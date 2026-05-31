import { useEffect, useRef, useState } from "react";

interface CameraFeedProps {
  isPip?: boolean;
  zoom: number;
  isEmergencyStopped: boolean;
  activeDirection: string | null;
}

export const CameraFeed = ({
  isPip = false,
  zoom,
  isEmergencyStopped,
  activeDirection,
}: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"requesting" | "live" | "blocked" | "unsupported">("requesting");
  const [feedType, setFeedType] = useState<"camera" | "video">("camera");
  const [isCameraSourceExpanded, setIsCameraSourceExpanded] = useState(false);


  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      setFeedType("video"); // Auto fallback to video
      return;
    }

    setStatus("requesting");

    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.removeAttribute("src");
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("live");
    } catch {
      setStatus("blocked");
      setFeedType("video"); // Auto fallback to video
    }
  };

  useEffect(() => {
    if (feedType === "camera") {
      void startCamera();
    } else {
      stopStream();
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = "https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4";
        videoRef.current.loop = true;
        videoRef.current.play().catch((err) => console.log("Video playback interrupted:", err));
      }
      setStatus("live");
    }
    return stopStream;
  }, [feedType]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center select-none">
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        className={`w-full h-full object-cover transition-transform duration-300 ${
          status === "live" ? "opacity-95" : "opacity-20"
        }`}
        style={{
          transform: isPip ? "scale(1.05)" : `scale(${zoom})`,
          filter: isEmergencyStopped ? "contrast(1.2) sepia(0.3) hue-rotate(-50deg)" : "none",
        }}
      />

      {status !== "live" && isPip && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90">
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-sky-200">
            {status === "requesting" ? "Opening" : "No Signal"}
          </div>
        </div>
      )}

      {status !== "live" && !isPip && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
          <div className="mx-6 max-w-sm rounded-lg border border-slate-700/70 bg-slate-950/90 px-5 py-4 text-center shadow-2xl">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300">
              {status === "requesting" ? "Opening Camera" : "Camera Feed Unavailable"}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              {status === "requesting"
                ? "Waiting for browser camera permission."
                : "Allow camera access in the browser, or run the app from localhost to enable the live feed."}
            </p>
            {status === "blocked" && (
              <button
                onClick={startCamera}
                className="mt-4 rounded-md border border-sky-400/40 bg-sky-500/15 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-sky-100 hover:bg-sky-500/25"
              >
                Retry Camera
              </button>
            )}
          </div>
        </div>
      )}

      {!isPip && (
        <div className="absolute inset-0 pointer-events-none border-[12px] border-slate-950/20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[size:100%_4px] opacity-10" />

          {/* Camera Feed Selector HUD */}
          <div className="absolute left-6 top-[160px] pointer-events-auto flex flex-col rounded-lg border border-slate-700/70 bg-slate-950/75 p-3.5 backdrop-blur-md w-[180px]">
            <div 
              onClick={() => setIsCameraSourceExpanded(!isCameraSourceExpanded)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">CAMERA SOURCE</div>
              <svg 
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCameraSourceExpanded ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {isCameraSourceExpanded && (
              <div className="flex flex-col gap-2.5 mt-2.5 border-t border-slate-800/40 pt-2.5">
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setFeedType("camera")}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
                      feedType === "camera"
                        ? "bg-sky-500/20 border border-sky-500/40 text-sky-200"
                        : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${feedType === "camera" ? "bg-sky-400 animate-pulse shadow-[0_0_6px_#38BDF8]" : "bg-slate-600"}`} />
                    Live Webcam
                  </button>

                  <button
                    onClick={() => setFeedType("video")}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
                      feedType === "video"
                        ? "bg-sky-500/20 border border-sky-500/40 text-sky-200"
                        : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${feedType === "video" ? "bg-emerald-400 animate-pulse shadow-[0_0_6px_#34D399]" : "bg-slate-600"}`} />
                    Demo Video
                  </button>
                </div>
                
                {feedType === "video" && (
                  <div className="text-[8px] font-mono text-emerald-400 leading-normal border-t border-slate-800/40 pt-1.5">
                    ● LOOPING DEMO PATH
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20">
              <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            </div>
            <div className="absolute h-[1px] w-16 bg-white/10" />
            <div className="absolute h-16 w-[1px] bg-white/10" />
          </div>

          <div className="absolute left-6 top-6 h-6 w-6 border-l-2 border-t-2 border-white/30" />
          <div className="absolute right-6 top-6 h-6 w-6 border-r-2 border-t-2 border-white/30" />
          <div className="absolute bottom-6 left-6 h-6 w-6 border-b-2 border-l-2 border-white/30" />
          <div className="absolute bottom-6 right-6 h-6 w-6 border-b-2 border-r-2 border-white/30" />

          {isEmergencyStopped && (
            <div className="absolute left-1/2 top-1/3 flex min-w-[300px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-xl border border-red-500/80 bg-slate-950/85 px-6 py-4 shadow-[0_0_30px_rgba(239,68,68,0.35)] backdrop-blur-md pointer-events-auto">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
                </span>
                <span className="text-xs font-black uppercase leading-none tracking-[0.2em] text-red-500">
                  Emergency Shutdown
                </span>
              </div>
              <div className="my-1 h-[1px] w-full bg-red-500/20" />
              <span className="text-center font-mono text-[10px] uppercase tracking-widest text-white/90">
                All actuators and motors inhibited
              </span>
            </div>
          )}

          <div className="absolute bottom-20 left-44 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1 text-[9px] font-black tracking-wider text-slate-400 md:bottom-6 md:left-32">
            LENS ZOOM: {zoom.toFixed(1)}x
          </div>

          {activeDirection && (
            <div className="absolute bottom-36 right-6 animate-pulse rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 md:bottom-6 md:right-40">
              DRIVE: STEERING{" "}
              {activeDirection.toLowerCase() === "w"
                ? "FORWARD"
                : activeDirection.toLowerCase() === "s"
                  ? "BACKWARD"
                  : activeDirection.toLowerCase() === "a"
                    ? "LEFT"
                    : activeDirection.toLowerCase() === "d"
                      ? "RIGHT"
                      : activeDirection}
            </div>
          )}
        </div>
      )}

      {isPip && (
        <div className="absolute left-2 top-2 rounded border border-slate-800 bg-slate-950/80 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-400 backdrop-blur-sm">
          CAM VIEW
        </div>
      )}
    </div>
  );
};
