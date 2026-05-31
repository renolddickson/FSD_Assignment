import { useEffect, useRef, useState } from "react";
import { parsePCD, normalizePoints } from "../utils/pcdParser";

interface PointCloudMapProps {
  isPip?: boolean;
  isEmergencyStopped: boolean;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

type DragState = {
  x: number;
  y: number;
  yaw: number;
  pitch: number;
};

type ModelOrientation = {
  pitch: number;
  yaw: number;
  roll: number;
  flipY: boolean;
};


const vertexShaderSource = `
attribute vec3 a_position;
attribute vec3 a_color;
uniform mat4 u_matrix;
uniform float u_pointSize;
varying vec3 v_color;
void main() {
  gl_Position = u_matrix * vec4(a_position, 1.0);
  gl_PointSize = u_pointSize;
  v_color = a_color;
}
`;

const fragmentShaderSource = `
precision mediump float;
varying vec3 v_color;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  if (dot(c, c) > 0.25) discard;
  gl_FragColor = vec4(v_color, 0.95);
}
`;

const lineVertexShaderSource = `
attribute vec3 a_position;
attribute vec3 a_color;
uniform mat4 u_matrix;
varying vec3 v_color;
void main() {
  gl_Position = u_matrix * vec4(a_position, 1.0);
  v_color = a_color;
}
`;

const lineFragmentShaderSource = `
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 0.8);
}
`;

const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compilation failed");
  }

  return shader;
};

const createProgram = (gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) => {
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create WebGL program");

  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "Program link failed");
  }

  return program;
};

const perspective = (fov: number, aspect: number, near: number, far: number) => {
  const f = 1 / Math.tan(fov / 2);
  const rangeInv = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0,
  ]);
};

const multiply = (a: Float32Array, b: Float32Array) => {
  const out = new Float32Array(16);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      out[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3];
    }
  }
  return out;
};

const translate = (x: number, y: number, z: number) =>
  new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1,
  ]);

const rotateX = (angle: number) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1,
  ]);
};

const rotateY = (angle: number) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1,
  ]);
};

const rotateZ = (angle: number) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([
    c, s, 0, 0,
    -s, c, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
};

const scaleMatrix = (x: number, y: number, z: number) =>
  new Float32Array([
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1,
  ]);

const quarterTurn = Math.PI / 2;

const createPointCloud = () => {
  const rows = 110;
  const cols = 110;
  const stride = 6;
  const data = new Float32Array(rows * cols * stride);
  let index = 0;

  for (let zIndex = 0; zIndex < rows; zIndex += 1) {
    for (let xIndex = 0; xIndex < cols; xIndex += 1) {
      const x = (xIndex / (cols - 1) - 0.5) * 16;
      const z = (zIndex / (rows - 1) - 0.5) * 12;
      const corridor =
        Math.abs(x) < 1.3 || Math.abs(z + 2.7) < 0.8 || (x > 3.4 && z > -1.2 && z < 4.8);
      const shelf =
        (x < -3.2 && z < -1.2) || (x < -3.4 && z > 1.5) || (x > 2.4 && x < 6.7 && z < -3.4);
      const obstacle = (Math.hypot(x - 3.4, z - 1.3) < 1.1) || (Math.abs(x + 0.7) < 0.6 && Math.abs(z - 3.5) < 1);
      const wave = Math.sin(x * 1.8) * 0.08 + Math.cos(z * 1.4) * 0.08;
      const y = shelf ? 0.9 + wave : obstacle ? 0.45 + wave : corridor ? wave : 0.18 + wave;

      data[index] = x;
      data[index + 1] = y;
      data[index + 2] = z;

      if (obstacle) {
        data[index + 3] = 0.94;
        data[index + 4] = 0.25;
        data[index + 5] = 0.25;
      } else if (shelf) {
        data[index + 3] = 0.96;
        data[index + 4] = 0.72;
        data[index + 5] = 0.32;
      } else if (corridor) {
        data[index + 3] = 0.22;
        data[index + 4] = 0.82;
        data[index + 5] = 1;
      } else {
        data[index + 3] = 0.22;
        data[index + 4] = 0.3;
        data[index + 5] = 0.42;
      }

      index += stride;
    }
  }

  return data;
};

const createLines = () => {
  const lines: number[] = [];

  const pushLine = (
    ax: number,
    ay: number,
    az: number,
    bx: number,
    by: number,
    bz: number,
    r: number,
    g: number,
    b: number,
  ) => {
    lines.push(ax, ay, az, r, g, b, bx, by, bz, r, g, b);
  };

  for (let x = -8; x <= 8; x += 1) pushLine(x, 0, -6, x, 0, 6, 0.18, 0.26, 0.38);
  for (let z = -6; z <= 6; z += 1) pushLine(-8, 0, z, 8, 0, z, 0.18, 0.26, 0.38);

  pushLine(-8, 0.03, -6, 8, 0.03, -6, 0.56, 0.65, 0.78);
  pushLine(8, 0.03, -6, 8, 0.03, 6, 0.56, 0.65, 0.78);
  pushLine(8, 0.03, 6, -8, 0.03, 6, 0.56, 0.65, 0.78);
  pushLine(-8, 0.03, 6, -8, 0.03, -6, 0.56, 0.65, 0.78);

  return new Float32Array(lines);
};

export const PointCloudMap = ({ isPip = false, isEmergencyStopped, zoom, onZoomChange }: PointCloudMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const yawRef = useRef(-0.65);
  const pitchRef = useRef(0.85);
  const distanceRef = useRef(isPip ? 18 : 15);
  const [webGlUnavailable, setWebGlUnavailable] = useState(false);

  const [pointsData, setPointsData] = useState<Float32Array | null>(null);
  const [pointsCount, setPointsCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedFileName, setLoadedFileName] = useState<string>("Loading default...");
  const [modelOrientation, setModelOrientation] = useState<ModelOrientation>({
    pitch: 0,
    yaw: 0,
    roll: 0,
    flipY: false,
  });
  const [isPointCloudInfoExpanded, setIsPointCloudInfoExpanded] = useState(true);
  const [isPcdControlsExpanded, setIsPcdControlsExpanded] = useState(false);

  // Synchronize dynamic zoom slider with 3D camera distance
  useEffect(() => {
    if (zoom !== undefined) {
      // Map zoom (1x to 5x) to WebGL orbit camera distance (23 units to 8 units)
      distanceRef.current = Math.max(8, Math.min(24, 23 - (zoom - 1) * 3.75));
    }
  }, [zoom]);



  // Load default sample.pcd
  useEffect(() => {
    setLoading(true);
    fetch("/sample.pcd")
      .then((res) => {
        if (!res.ok) throw new Error("Default PCD asset not found");
        return res.arrayBuffer();
      })
      .then((buffer) => {
        const parsed = parsePCD(buffer);
        const normalized = normalizePoints(parsed.points);
        setPointsData(normalized);
        setPointsCount(parsed.count);
        setLoadedFileName("sample.pcd (Double Helix)");
        setModelOrientation({ pitch: 0, yaw: 0, roll: 0, flipY: false });
        setLoading(false);
        setLoadError(null);
      })
      .catch((err) => {
        console.warn("Could not load default PCD file, falling back to synthetic generator:", err);
        const synthetic = createPointCloud();
        setPointsData(synthetic);
        setPointsCount(synthetic.length / 6);
        setLoadedFileName("Default Wave (Synthetic)");
        setLoading(false);
      });
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setLoadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      try {
        const parsed = parsePCD(buffer);
        const normalized = normalizePoints(parsed.points);
        setPointsData(normalized);
        setPointsCount(parsed.count);
        setLoadedFileName(file.name);
        setModelOrientation({ pitch: 0, yaw: 0, roll: 0, flipY: false });
        setLoading(false);
      } catch (err: any) {
        console.error("Error parsing uploaded PCD file:", err);
        setLoadError(err.message || "Failed to parse PCD file");
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setLoadError("Failed to read file contents");
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleResetToDefault = () => {
    const synthetic = createPointCloud();
    setPointsData(synthetic);
    setPointsCount(synthetic.length / 6);
    setLoadedFileName("Default Wave (Synthetic)");
    setModelOrientation({ pitch: 0, yaw: 0, roll: 0, flipY: false });
    setLoadError(null);
  };

  const rotateModel = (axis: "pitch" | "yaw" | "roll", direction: 1 | -1) => {
    setModelOrientation((current) => ({
      ...current,
      [axis]: current[axis] + direction * quarterTurn,
    }));
  };

  const resetModelOrientation = () => {
    setModelOrientation({ pitch: 0, yaw: 0, roll: 0, flipY: false });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) {
      setWebGlUnavailable(true);
      return;
    }

    const pointProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    const lineProgram = createProgram(gl, lineVertexShaderSource, lineFragmentShaderSource);
    
    // Resolve active point cloud data
    const activePoints = pointsData || createPointCloud();
    const activePointsCount = pointsCount || activePoints.length / 6;

    const lines = createLines();
    const cloudBuffer = gl.createBuffer();
    const lineBuffer = gl.createBuffer();
    let animationFrame = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, cloudBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, activePoints, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    const drawGeometry = (
      program: WebGLProgram,
      buffer: WebGLBuffer | null,
      count: number,
      mode: number,
      matrix: Float32Array,
      pointSize = 1,
    ) => {
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

      const positionLocation = gl.getAttribLocation(program, "a_position");
      const colorLocation = gl.getAttribLocation(program, "a_color");
      const matrixLocation = gl.getUniformLocation(program, "u_matrix");
      const pointSizeLocation = gl.getUniformLocation(program, "u_pointSize");

      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(colorLocation);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 24, 12);
      gl.uniformMatrix4fv(matrixLocation, false, matrix);
      if (pointSizeLocation) gl.uniform1f(pointSizeLocation, pointSize);
      gl.drawArrays(mode, 0, count);
    };

    const render = () => {
      resize();
      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0.012, 0.02, 0.04, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const projection = perspective(Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
      const view = multiply(
        multiply(translate(0, -1.5, -distanceRef.current), rotateX(pitchRef.current)),
        rotateY(yawRef.current),
      );
      const gridMatrix = multiply(projection, view);
      const modelMatrix = multiply(
        multiply(
          multiply(rotateY(modelOrientation.yaw), rotateX(modelOrientation.pitch)),
          rotateZ(modelOrientation.roll),
        ),
        scaleMatrix(1, modelOrientation.flipY ? -1 : 1, 1),
      );
      const cloudMatrix = multiply(gridMatrix, modelMatrix);

      drawGeometry(lineProgram, lineBuffer, lines.length / 6, gl.LINES, gridMatrix);
      drawGeometry(pointProgram, cloudBuffer, activePointsCount, gl.POINTS, cloudMatrix, isPip ? 1.8 : 2.8);

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      gl.deleteBuffer(cloudBuffer);
      gl.deleteBuffer(lineBuffer);
      gl.deleteProgram(pointProgram);
      gl.deleteProgram(lineProgram);
    };
  }, [isPip, pointsData, pointsCount, modelOrientation]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPip) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, yaw: yawRef.current, pitch: pitchRef.current };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const deltaX = event.clientX - dragRef.current.x;
    const deltaY = event.clientY - dragRef.current.y;
    yawRef.current = dragRef.current.yaw + deltaX * 0.008;
    pitchRef.current = Math.max(0.35, Math.min(1.25, dragRef.current.pitch + deltaY * 0.006));
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (isPip) return;
    const newDistance = Math.max(8, Math.min(24, distanceRef.current + event.deltaY * 0.01));
    distanceRef.current = newDistance;

    if (onZoomChange) {
      // Map WebGL camera orbit distance (23 units to 8 units) back to zoom state (1x to 5x)
      const calculatedZoom = 1 + (23 - newDistance) / 3.75;
      const roundedZoom = Math.round(Math.max(1, Math.min(5, calculatedZoom)) * 10) / 10;
      onZoomChange(roundedZoom);
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050A14] select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className={`h-full w-full ${isPip ? "" : "cursor-grab active:cursor-grabbing"}`}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.14),transparent_38%),linear-gradient(180deg,rgba(4,8,20,0)_60%,rgba(4,8,20,0.72))]" />

      {webGlUnavailable && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
          <div className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-4 text-center text-xs text-slate-200">
            WebGL is unavailable in this browser, so the 3D map cannot be rendered.
          </div>
        </div>
      )}

      {!isPip && (
        <>
          {/* Main Left HUD Panel Stack */}
          <div className="absolute left-6 top-[160px] z-30 flex flex-col gap-3 pointer-events-auto w-[180px]">
            {/* Main Info Card */}
            <div className="flex flex-col rounded-lg border border-slate-700/70 bg-slate-950/75 p-2.5 backdrop-blur-md">
              <div 
                onClick={() => setIsPointCloudInfoExpanded(!isPointCloudInfoExpanded)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-300">3D Point Cloud</div>
                <svg 
                  className={`w-3 h-3 text-sky-300 transition-transform duration-200 ${isPointCloudInfoExpanded ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {isPointCloudInfoExpanded && (
                <div className="mt-1.5 font-mono text-[10px] text-slate-400 border-t border-slate-800/40 pt-1.5 leading-normal">
                  {(pointsCount || 12100).toLocaleString()} points | {loading ? "loading..." : "point cloud"}
                </div>
              )}
            </div>

            {/* PCD File Upload HUD Controls */}
            <div className="flex flex-col rounded-lg border border-slate-700/70 bg-slate-950/75 p-3.5 backdrop-blur-md">
              <div 
                onClick={() => setIsPcdControlsExpanded(!isPcdControlsExpanded)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">PCD CONTROLS</div>
                <svg 
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isPcdControlsExpanded ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {isPcdControlsExpanded && (
                <div className="flex flex-col gap-2.5 mt-2.5 border-t border-slate-800/40 pt-2.5">
                  <div className="flex flex-col gap-1">
                    <div className="text-[8px] font-black uppercase tracking-wider text-slate-500">Active Source</div>
                    <div className="font-mono text-[9px] text-sky-200 truncate" title={loadedFileName}>
                      {loadedFileName}
                    </div>
                  </div>

                  {loadError && (
                    <div className="rounded bg-red-950/40 border border-red-500/20 p-1.5 text-[8px] font-mono text-red-300 leading-normal max-w-full break-words">
                      ERROR: {loadError}
                    </div>
                  )}

                  <label className="flex items-center justify-center gap-1.5 rounded border border-sky-500/40 bg-sky-500/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-sky-200 hover:bg-sky-500/25 active:scale-95 transition-all cursor-pointer select-none">
                    <svg className="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    Upload PCD File
                    <input
                      type="file"
                      accept=".pcd"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={loading || isEmergencyStopped}
                    />
                  </label>

                  {loadedFileName !== "Default Wave (Synthetic)" && (
                    <button
                      onClick={handleResetToDefault}
                      disabled={loading}
                      className="rounded border border-slate-700/60 bg-slate-900/60 py-1 text-[8px] font-black uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Reset Default
                    </button>
                  )}

                  <div className="mt-1 border-t border-slate-800/70 pt-2">
                    <div className="mb-1.5 text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Model Orientation
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => rotateModel("pitch", 1)}
                        className="rounded border border-slate-700/60 bg-slate-900/60 py-1 text-[8px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        Pitch 90
                      </button>
                      <button
                        onClick={() => rotateModel("yaw", 1)}
                        className="rounded border border-slate-700/60 bg-slate-900/60 py-1 text-[8px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        Yaw 90
                      </button>
                      <button
                        onClick={() => rotateModel("roll", 1)}
                        className="rounded border border-slate-700/60 bg-slate-900/60 py-1 text-[8px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        Roll 90
                      </button>
                      <button
                        onClick={() => setModelOrientation((current) => ({ ...current, flipY: !current.flipY }))}
                        className={`rounded border py-1 text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          modelOrientation.flipY
                            ? "border-sky-400/60 bg-sky-500/20 text-sky-100"
                            : "border-slate-700/60 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        Flip
                      </button>
                    </div>
                    <button
                      onClick={resetModelOrientation}
                      className="mt-1.5 w-full rounded border border-slate-700/60 bg-slate-900/60 py-1 text-[8px] font-black uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Reset Pose
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-20 right-6 rounded-lg border border-slate-700/70 bg-slate-950/75 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-slate-300 backdrop-blur-md md:bottom-6">
            Drag orbit | wheel zoom
          </div>
          
          {isEmergencyStopped && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-lg border border-red-500/70 bg-red-950/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-100 shadow-[0_0_25px_rgba(239,68,68,0.25)]">
              Map locked by emergency stop
            </div>
          )}
        </>
      )}

      {isPip && (
        <div className="absolute left-2 top-2 rounded border border-slate-800 bg-slate-950/80 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-400 backdrop-blur-sm">
          MAP VIEW
        </div>
      )}
    </div>
  );
};
