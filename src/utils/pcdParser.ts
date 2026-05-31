export interface PointCloudData {
  points: Float32Array; // Stride of 6: x, y, z, r, g, b
  count: number;
}

interface PCDHeader {
  fields: string[];
  sizes: number[];
  types: string[];
  counts: number[];
  width: number;
  height: number;
  pointsCount: number;
  dataType: string;
}

export function parsePCD(buffer: ArrayBuffer): PointCloudData {
  const bytes = new Uint8Array(buffer);
  const textDecoder = new TextDecoder("utf-8");

  let headerText = "";
  let dataIndex = -1;
  let lineStart = 0;

  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 10) { // Newline '\n'
      const line = textDecoder.decode(bytes.subarray(lineStart, i)).trim();
      headerText += line + "\n";
      lineStart = i + 1;
      if (line.toUpperCase().startsWith("DATA")) {
        dataIndex = i + 1;
        break;
      }
    }
  }

  if (dataIndex === -1) {
    throw new Error("Invalid PCD file: DATA field not found in header");
  }

  const header = parseHeader(headerText);
  const { fields, sizes, types, counts, dataType } = header;
  let { pointsCount } = header;

  if (pointsCount <= 0 && header.width > 0 && header.height > 0) {
    pointsCount = header.width * header.height;
  }

  if (pointsCount <= 0 && dataType === "ascii") {
    const dataString = textDecoder.decode(bytes.subarray(dataIndex));
    pointsCount = dataString.split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith("#")).length;
  }

  if (pointsCount <= 0) {
    throw new Error("No points defined in PCD file header");
  }

  const normalizedFields = fields.map((field) => field.toLowerCase());
  const xIdx = normalizedFields.indexOf("x");
  const yIdx = normalizedFields.indexOf("y");
  const zIdx = normalizedFields.indexOf("z");
  const rgbIdx = normalizedFields.indexOf("rgb") !== -1 ? normalizedFields.indexOf("rgb") : normalizedFields.indexOf("rgba");
  const intensityIdx = normalizedFields.indexOf("intensity");

  if (xIdx === -1 || yIdx === -1 || zIdx === -1) {
    throw new Error(`PCD file must contain x, y, and z fields. Found: ${fields.join(", ") || "none"}`);
  }

  const resultPoints = new Float32Array(pointsCount * 6);
  const layout = createBinaryLayout(sizes, counts);

  if (dataType === "ascii") {
    parseAsciiPoints(bytes, dataIndex, textDecoder, {
      fields,
      xIdx,
      yIdx,
      zIdx,
      rgbIdx,
      intensityIdx,
      pointsCount,
      resultPoints,
    });
  } else if (dataType === "binary") {
    const dataView = new DataView(buffer, dataIndex);
    const actualCount = parseBinaryPoints(dataView, layout.pointSize, pointsCount, layout.fieldOffsets, {
      xIdx,
      yIdx,
      zIdx,
      rgbIdx,
      intensityIdx,
      sizes,
      types,
      resultPoints,
    });
    pointsCount = actualCount;
  } else if (dataType === "binary_compressed") {
    const compressedView = new DataView(buffer, dataIndex);
    const compressedSize = compressedView.getUint32(0, true);
    const uncompressedSize = compressedView.getUint32(4, true);
    const compressed = bytes.subarray(dataIndex + 8, dataIndex + 8 + compressedSize);
    const decompressed = decompressLZF(compressed, uncompressedSize);
    const decompressedView = new DataView(decompressed.buffer, decompressed.byteOffset, decompressed.byteLength);
    const expectedPointCount = Math.min(pointsCount, Math.floor(uncompressedSize / layout.pointSize));
    pointsCount = parseCompressedBinaryPoints(decompressedView, expectedPointCount, layout.fieldOffsets, layout.fieldSizes, {
      xIdx,
      yIdx,
      zIdx,
      rgbIdx,
      intensityIdx,
      sizes,
      types,
      resultPoints,
    });
  } else {
    throw new Error(`Unsupported PCD data encoding: ${dataType || "unknown"}`);
  }

  return {
    points: resultPoints.subarray(0, pointsCount * 6),
    count: pointsCount,
  };
}

function parseHeader(headerText: string): PCDHeader {
  const lines = headerText.split(/\r?\n/);
  let fields: string[] = [];
  let sizes: number[] = [];
  let types: string[] = [];
  let counts: number[] = [];
  let width = 0;
  let height = 1;
  let pointsCount = 0;
  let dataType = "";

  for (const line of lines) {
    const cleanLine = line.replace(/#.*/, "").trim();
    const parts = cleanLine.split(/\s+/);
    if (parts.length < 2) continue;
    const command = parts[0].toUpperCase();

    if (command === "FIELDS") {
      fields = parts.slice(1);
    } else if (command === "SIZE") {
      sizes = parts.slice(1).map(Number);
    } else if (command === "TYPE") {
      types = parts.slice(1);
    } else if (command === "COUNT") {
      counts = parts.slice(1).map(Number);
    } else if (command === "WIDTH") {
      width = parseInt(parts[1], 10);
    } else if (command === "HEIGHT") {
      height = parseInt(parts[1], 10);
    } else if (command === "POINTS") {
      pointsCount = parseInt(parts[1], 10);
    } else if (command === "DATA") {
      dataType = parts[1].toLowerCase();
    }
  }

  while (sizes.length < fields.length) sizes.push(4);
  while (types.length < fields.length) types.push("F");
  while (counts.length < fields.length) counts.push(1);

  return { fields, sizes, types, counts, width, height, pointsCount, dataType };
}

function createBinaryLayout(sizes: number[], counts: number[]) {
  let pointSize = 0;
  const fieldOffsets: number[] = [];
  const fieldSizes: number[] = [];
  for (let i = 0; i < sizes.length; i++) {
    fieldOffsets.push(pointSize);
    const size = sizes[i];
    const count = counts[i];
    const fieldSize = size * count;
    fieldSizes.push(fieldSize);
    pointSize += fieldSize;
  }

  return { fieldOffsets, fieldSizes, pointSize };
}

interface ParseContext {
  xIdx: number;
  yIdx: number;
  zIdx: number;
  rgbIdx: number;
  intensityIdx: number;
  sizes?: number[];
  types?: string[];
  resultPoints: Float32Array;
}

function parseAsciiPoints(
  bytes: Uint8Array,
  dataIndex: number,
  textDecoder: TextDecoder,
  context: ParseContext & { fields: string[]; pointsCount: number },
) {
  const dataString = textDecoder.decode(bytes.subarray(dataIndex));
  const dataLines = dataString.split(/\r?\n/);
  let pointIndex = 0;

  for (const rawLine of dataLines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const tokens = line.split(/\s+/);
    if (tokens.length < context.fields.length) continue;

    const x = parseFloat(tokens[context.xIdx]);
    const y = parseFloat(tokens[context.yIdx]);
    const z = parseFloat(tokens[context.zIdx]);
    if (![x, y, z].every(Number.isFinite)) continue;

    const [r, g, b] = readPointColor({
      y,
      rgbValue: context.rgbIdx !== -1 ? parseFloat(tokens[context.rgbIdx]) : undefined,
      intensity: context.intensityIdx !== -1 ? parseFloat(tokens[context.intensityIdx]) : undefined,
    });

    writePoint(context.resultPoints, pointIndex, x, y, z, r, g, b);
    pointIndex += 1;
    if (pointIndex >= context.pointsCount) break;
  }
}

function parseBinaryPoints(
  dataView: DataView,
  pointSize: number,
  pointsCount: number,
  fieldOffsets: number[],
  context: Required<Pick<ParseContext, "sizes" | "types">> & ParseContext,
) {
  const numPointsToParse = Math.min(pointsCount, Math.floor(dataView.byteLength / pointSize));

  for (let p = 0; p < numPointsToParse; p++) {
    const offset = p * pointSize;
    writeBinaryPoint(dataView, p, offset, fieldOffsets, context);
  }

  return numPointsToParse;
}

function parseCompressedBinaryPoints(
  dataView: DataView,
  pointsCount: number,
  fieldOffsets: number[],
  fieldSizes: number[],
  context: Required<Pick<ParseContext, "sizes" | "types">> & ParseContext,
) {
  for (let p = 0; p < pointsCount; p++) {
    const getCompressedOffset = (fieldIndex: number) => fieldOffsets[fieldIndex] * pointsCount + p * fieldSizes[fieldIndex];
    writeBinaryPoint(dataView, p, 0, fieldOffsets, context, getCompressedOffset);
  }

  return pointsCount;
}

function writeBinaryPoint(
  dataView: DataView,
  pointIndex: number,
  baseOffset: number,
  fieldOffsets: number[],
  context: Required<Pick<ParseContext, "sizes" | "types">> & ParseContext,
  compressedOffset?: (fieldIndex: number) => number,
) {
  const getOffset = (fieldIndex: number) => compressedOffset?.(fieldIndex) ?? baseOffset + fieldOffsets[fieldIndex];
  const x = readBinaryValue(dataView, getOffset(context.xIdx), context.types[context.xIdx], context.sizes[context.xIdx]);
  const y = readBinaryValue(dataView, getOffset(context.yIdx), context.types[context.yIdx], context.sizes[context.yIdx]);
  const z = readBinaryValue(dataView, getOffset(context.zIdx), context.types[context.zIdx], context.sizes[context.zIdx]);

  if (![x, y, z].every(Number.isFinite)) return;

  const [r, g, b] = readPointColor({
    y,
    rgbValue: context.rgbIdx !== -1
      ? readRgbBinaryValue(dataView, getOffset(context.rgbIdx), context.types[context.rgbIdx], context.sizes[context.rgbIdx])
      : undefined,
    intensity: context.intensityIdx !== -1
      ? readBinaryValue(dataView, getOffset(context.intensityIdx), context.types[context.intensityIdx], context.sizes[context.intensityIdx])
      : undefined,
  });

  writePoint(context.resultPoints, pointIndex, x, y, z, r, g, b);
}

function writePoint(points: Float32Array, pointIndex: number, x: number, y: number, z: number, r: number, g: number, b: number) {
  const idx = pointIndex * 6;
  points[idx] = x;
  points[idx + 1] = y;
  points[idx + 2] = z;
  points[idx + 3] = r;
  points[idx + 4] = g;
  points[idx + 5] = b;
}

function readPointColor({ y, rgbValue, intensity }: { y: number; rgbValue?: number; intensity?: number }) {
  if (rgbValue !== undefined && Number.isFinite(rgbValue)) {
    const u32 = floatOrIntegerRgbToUint32(rgbValue);
    return [((u32 >> 16) & 0xff) / 255, ((u32 >> 8) & 0xff) / 255, (u32 & 0xff) / 255];
  }

  if (intensity !== undefined && Number.isFinite(intensity)) {
    const factor = Math.min(1.0, Math.max(0.2, intensity > 1 ? intensity / 255.0 : intensity));
    return [0.22 * factor, 0.82 * factor, 1.0 * factor];
  }

  const heightFactor = Math.min(1.0, Math.max(0.0, (y + 2) / 6));
  return [0.1 + heightFactor * 0.4, 0.5 + heightFactor * 0.5, 0.9 - heightFactor * 0.3];
}

function floatOrIntegerRgbToUint32(rgbValue: number) {
  if (Number.isInteger(rgbValue) && rgbValue >= 0 && rgbValue <= 0xffffffff) return rgbValue >>> 0;
  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, rgbValue, true);
  return view.getUint32(0, true);
}

function readRgbBinaryValue(view: DataView, offset: number, type: string, size: number): number {
  if (size === 4 && type.toUpperCase() === "F") return view.getFloat32(offset, true);
  if (size === 4) return view.getUint32(offset, true);
  return readBinaryValue(view, offset, type, size);
}

function readBinaryValue(view: DataView, offset: number, type: string, size: number): number {
  const normalizedType = type.toUpperCase();
  if (normalizedType === "F") {
    if (size === 4) return view.getFloat32(offset, true);
    if (size === 8) return view.getFloat64(offset, true);
  } else if (normalizedType === "I") {
    if (size === 1) return view.getInt8(offset);
    if (size === 2) return view.getInt16(offset, true);
    if (size === 4) return view.getInt32(offset, true);
  } else if (normalizedType === "U") {
    if (size === 1) return view.getUint8(offset);
    if (size === 2) return view.getUint16(offset, true);
    if (size === 4) return view.getUint32(offset, true);
  }
  return 0;
}

function decompressLZF(input: Uint8Array, expectedLength: number) {
  const output = new Uint8Array(expectedLength);
  let inputIndex = 0;
  let outputIndex = 0;

  while (inputIndex < input.length && outputIndex < expectedLength) {
    const control = input[inputIndex++];

    if (control < 32) {
      const literalLength = control + 1;
      output.set(input.subarray(inputIndex, inputIndex + literalLength), outputIndex);
      inputIndex += literalLength;
      outputIndex += literalLength;
    } else {
      let length = control >> 5;
      let reference = outputIndex - ((control & 0x1f) << 8) - 1;

      if (length === 7) {
        length += input[inputIndex++];
      }

      reference -= input[inputIndex++];
      length += 2;

      if (reference < 0) {
        throw new Error("Invalid binary_compressed PCD payload");
      }

      for (let i = 0; i < length; i++) {
        output[outputIndex++] = output[reference++];
      }
    }
  }

  if (outputIndex !== expectedLength) {
    throw new Error("PCD binary_compressed payload ended before expected size");
  }

  return output;
}

export function normalizePoints(points: Float32Array): Float32Array {
  const count = points.length / 6;
  if (count === 0) return points;

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let i = 0; i < count; i++) {
    const idx = i * 6;
    const x = points[idx];
    const y = points[idx + 1];
    const z = points[idx + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;

  const dx = maxX - minX;
  const dy = maxY - minY;
  const dz = maxZ - minZ;
  const maxSpan = Math.max(dx, dy, dz) || 1.0;
  const scale = 8.0 / maxSpan; // target bounding box size of 8.0 units

  const result = new Float32Array(points.length);
  for (let i = 0; i < count; i++) {
    const idx = i * 6;
    result[idx] = (points[idx] - cx) * scale;
    result[idx + 1] = (points[idx + 2] - cz) * scale + 0.5;
    result[idx + 2] = -(points[idx + 1] - cy) * scale;
    result[idx + 3] = points[idx + 3];
    result[idx + 4] = points[idx + 4];
    result[idx + 5] = points[idx + 5];
  }

  return result;
}
