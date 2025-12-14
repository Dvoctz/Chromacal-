import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, RefreshCw, XCircle, Crosshair } from 'lucide-react';
import { RGB } from '../types';

interface SensorModeProps {
  onBack: () => void;
}

export const SensorMode: React.FC<SensorModeProps> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<RGB[]>([]); // Track history for stability check
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [measuredRGB, setMeasuredRGB] = useState<RGB>({ r: 0, g: 0, b: 0 });
  const [isFrozen, setIsFrozen] = useState(false);
  const [isStable, setIsStable] = useState(false); // New stability state
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Prefer back camera on phones
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Handle video playback state based on frozen status
  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      if (isFrozen) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => console.error("Resume play failed:", e));
      }
    }
  }, [isFrozen]);

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isFrozen) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Analyze center 50x50 area
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      const sampleSize = 50;
      const offset = Math.floor(sampleSize / 2);

      const frameData = ctx.getImageData(centerX - offset, centerY - offset, sampleSize, sampleSize);
      const data = frameData.data;

      let r = 0, g = 0, b = 0;
      const pixelCount = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      const newRGB = {
        r: Math.round(r / pixelCount),
        g: Math.round(g / pixelCount),
        b: Math.round(b / pixelCount)
      };

      setMeasuredRGB(newRGB);

      // --- Stability Check Logic ---
      const history = historyRef.current;
      history.push(newRGB);
      // Keep last 10 frames
      if (history.length > 10) history.shift();

      if (history.length >= 5) {
        let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
        
        // Calculate min/max for each channel across the history buffer
        for (const val of history) {
            minR = Math.min(minR, val.r); maxR = Math.max(maxR, val.r);
            minG = Math.min(minG, val.g); maxG = Math.max(maxG, val.g);
            minB = Math.min(minB, val.b); maxB = Math.max(maxB, val.b);
        }
        
        // Determine maximum variance
        const variance = Math.max(maxR - minR, maxG - minG, maxB - minB);
        
        // If variance is low (user is holding still), mark as stable
        // Threshold of 6 accounts for minor camera sensor noise
        setIsStable(variance < 6);
      } else {
        setIsStable(false);
      }
    }

    requestAnimationFrame(processFrame);
  }, [isFrozen]);

  useEffect(() => {
    const handle = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(handle);
  }, [processFrame]);

  const toggleFreeze = () => {
    setIsFrozen(!isFrozen);
  };

  const rgbString = `rgb(${measuredRGB.r}, ${measuredRGB.g}, ${measuredRGB.b})`;
  const hexString = `#${((1 << 24) + (measuredRGB.r << 16) + (measuredRGB.g << 8) + measuredRGB.b).toString(16).slice(1).toUpperCase()}`;

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 bg-zinc-900/50 backdrop-blur">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <XCircle className="w-6 h-6 text-zinc-400" />
        </button>
        <h2 className="text-lg font-bold tracking-tight">Sensor Mode</h2>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-red-400 p-8 text-center max-w-xs">{error}</div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay UI */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* Target Reticle */}
              <div 
                className={`relative w-64 h-64 border-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isStable 
                    ? 'border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.4)] scale-105' 
                    : 'border-white/30'
                }`}
              >
                 <div className={`w-16 h-1 absolute transition-colors duration-300 ${isStable ? 'bg-green-400' : 'bg-white/50'}`}></div>
                 <div className={`w-1 h-16 absolute transition-colors duration-300 ${isStable ? 'bg-green-400' : 'bg-white/50'}`}></div>
                 {/* Sampling Area Indicator */}
                 <div className="w-12 h-12 border-2 border-yellow-400 rounded-lg shadow-[0_0_15px_rgba(250,204,21,0.5)] bg-transparent"></div>
              </div>
              
              <div className="mt-8 bg-black/60 backdrop-blur px-4 py-2 rounded-full text-xs font-mono text-zinc-300 flex items-center gap-2 transition-all">
                {isStable ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-green-400 font-bold tracking-wider">LOCKED</span>
                  </>
                ) : (
                  <span>Align with patch</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Control Panel */}
      <div className="p-6 bg-zinc-900 border-t border-white/10">
        <div className="flex items-center gap-6">
          {/* Measured Swatch */}
          <div 
            className="w-24 h-24 rounded-2xl shadow-inner border-4 border-white/10 relative overflow-hidden"
            style={{ backgroundColor: rgbString }}
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
          </div>

          {/* Values */}
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-baseline">
               <span className="text-xs text-zinc-500 uppercase font-bold">Hex</span>
               <span className="font-mono text-xl">{hexString}</span>
            </div>
            <div className="flex justify-between text-sm font-mono text-zinc-400">
               <span>R <span className="text-white ml-2">{measuredRGB.r}</span></span>
               <span>G <span className="text-white ml-2">{measuredRGB.g}</span></span>
               <span>B <span className="text-white ml-2">{measuredRGB.b}</span></span>
            </div>
          </div>
        </div>

        <button 
          onClick={toggleFreeze}
          className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
            isFrozen 
            ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-900/20' 
            : 'bg-white text-black hover:bg-zinc-200 shadow-white/10'
          }`}
        >
          {isFrozen ? (
            <>Unfreeze Sensor <RefreshCw className="w-5 h-5" /></>
          ) : (
            <>Capture Measurement <Camera className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </div>
  );
};