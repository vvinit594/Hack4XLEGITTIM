interface HeartLoaderProps {
  progress?: number;
}

export default function HeartLoader({ progress = 0 }: HeartLoaderProps) {
  // Map progress to stroke cycle duration (2× faster than prior; floor ≥0.8s)
  const speed = progress < 30 ? 1.5 : progress < 80 ? 0.85 : 0.8;
  const glowOpacity = progress < 30 ? 0.5 : progress < 80 ? 0.72 : 0.95;
  
  const getStatusText = () => {
    if (progress < 30) return "Initializing system...";
    if (progress < 80) return "Fetching live ward data...";
    return "Finalizing connection...";
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="relative w-full max-w-[550px] h-[206px] flex items-center justify-center">
        {/* Background Grey Path */}
        <svg
          viewBox="0 0 550 210"
          className="absolute w-full h-auto opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m0,130.08h44.51c7.08-3.45,11.54-24.65,19.42-24.81s13.23,22.54,21.03,24.81c10.03,2.92,29.69-14.6,39.91-12.4,4.58.98,9.34,12.36,14.02,12.4,3.54.03,7.25-9.31,10.79-9.17,3.24.13,6.17,7.93,9.17,9.17s9.68-1.48,12.4,0c2.4,1.3,3.45,10.3,5.93,9.17,3.23-1.48,2.82-103.01,8.09-103.01,6.96,0,12.35,137.53,16.72,137.53,3.9,0-.09-36.61,8.49-43.69,3.41-2.81,13.69,1.93,17.66,0,7.17-3.49,11.72-24.71,19.69-25.08,8.62-.4,15.39,22.86,23.73,25.08,8.99,2.38,26.51-12.76,35.6-10.79,5.58,1.21,11.46,15.82,17.12,15.1,3.88-.49,4.87-12.59,8.76-12.94,3.01-.28,5.7,7.46,8.49,8.63s9.75-1.43,12.54,0,4.03,9.39,7.01,9.71c4.98.54,2.64-103.55,8.63-103.55,5.16,0,8.8,111.51,12.94,111.64,5.02.16,5.01-15.2,9.3-17.8s15.02,2.06,19.42,0c7.39-3.46,12.74-25.17,20.9-25.08,8.97.09,13.68,25.85,22.38,28.04,9.17,2.31,25.4-15.93,34.79-14.83,4.95.58,11.31,10.3,16.04,11.87h44.51"
            className="stroke-2 fill-none stroke-blue-900"
          />
        </svg>

        {/* Animated Moving Path */}
        <svg
          viewBox="0 0 550 210"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m0,130.08h44.51c7.08-3.45,11.54-24.65,19.42-24.81s13.23,22.54,21.03,24.81c10.03,2.92,29.69-14.6,39.91-12.4,4.58.98,9.34,12.36,14.02,12.4,3.54.03,7.25-9.31,10.79-9.17,3.24.13,6.17,7.93,9.17,9.17s9.68-1.48,12.4,0c2.4,1.3,3.45,10.3,5.93,9.17,3.23-1.48,2.82-103.01,8.09-103.01,6.96,0,12.35,137.53,16.72,137.53,3.9,0-.09-36.61,8.49-43.69,3.41-2.81,13.69,1.93,17.66,0,7.17-3.49,11.72-24.71,19.69-25.08,8.62-.4,15.39,22.86,23.73,25.08,8.99,2.38,26.51-12.76,35.6-10.79,5.58,1.21,11.46,15.82,17.12,15.1,3.88-.49,4.87-12.59,8.76-12.94,3.01-.28,5.7,7.46,8.49,8.63s9.75-1.43,12.54,0,4.03,9.39,7.01,9.71c4.98.54,2.64-103.55,8.63-103.55,5.16,0,8.8,111.51,12.94,111.64,5.02.16,5.01-15.2,9.3-17.8s15.02,2.06,19.42,0c7.39-3.46,12.74-25.17,20.9-25.08,8.97.09,13.68,25.85,22.38,28.04,9.17,2.31,25.4-15.93,34.79-14.83,4.95.58,11.31,10.3,16.04,11.87h44.51"
            className="heart-path stroke-2 fill-none stroke-blue-400 transition-all duration-300"
            style={{
              animationDuration: `${speed}s`,
              filter: `drop-shadow(0 0 10px rgba(59, 130, 246, ${glowOpacity}))`,
            }}
          />
        </svg>
      </div>

      {/* Progress Info */}
      <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-xs">
        <div className="flex justify-between w-full text-xs font-mono text-blue-600/80 tracking-widest uppercase">
          <span className="animate-pulse">{getStatusText()}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="h-1 w-full bg-blue-100/50 rounded-full overflow-hidden backdrop-blur-sm border border-blue-200/20">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
