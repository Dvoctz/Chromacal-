import React, { useState } from 'react';
import { MeasurementPoint, RGB } from '../types';
import { ArrowRight, Check, Monitor, Smartphone, RefreshCw, EyeOff, MousePointerClick, Info, Maximize } from 'lucide-react';

interface PatternGeneratorProps {
  points: MeasurementPoint[];
  onComplete: (measuredPoints: MeasurementPoint[]) => void;
  onCancel: () => void;
}

export const PatternGenerator: React.FC<PatternGeneratorProps> = ({ points, onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [measurements, setMeasurements] = useState<MeasurementPoint[]>([...points]);
  const [isUIVisible, setIsUIVisible] = useState(true);
  
  // Temporary state for manual entry simulation (since we can't do real P2P in this demo)
  const [manualR, setManualR] = useState<string>('');
  const [manualG, setManualG] = useState<string>('');
  const [manualB, setManualB] = useState<string>('');

  const currentPoint = points[currentIndex];

  const handleNext = () => {
    // Save current manual input into measurements
    const r = parseInt(manualR) || currentPoint.targetColor.r; 
    const g = parseInt(manualG) || currentPoint.targetColor.g;
    const b = parseInt(manualB) || currentPoint.targetColor.b;

    const updated = [...measurements];
    updated[currentIndex] = {
      ...currentPoint,
      measuredColor: { r, g, b }
    };
    setMeasurements(updated);

    // Reset inputs
    setManualR('');
    setManualG('');
    setManualB('');
    setIsUIVisible(true); // Ensure UI is visible for next step

    if (currentIndex < points.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(updated);
    }
  };

  const bgColor = `rgb(${currentPoint.targetColor.r}, ${currentPoint.targetColor.g}, ${currentPoint.targetColor.b})`;
  
  // Determine text color based on background brightness
  const brightness = (currentPoint.targetColor.r * 299 + currentPoint.targetColor.g * 587 + currentPoint.targetColor.b * 114) / 1000;
  const textColor = brightness > 125 ? 'text-black' : 'text-white';
  const borderColor = brightness > 125 ? 'border-black/20' : 'border-white/20';
  const instructionsBg = brightness > 125 ? 'bg-black/10' : 'bg-white/10';

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-500 ease-in-out cursor-pointer p-4"
      style={{ backgroundColor: bgColor }}
      onClick={() => !isUIVisible && setIsUIVisible(true)}
    >
      {isUIVisible ? (
        <div 
          className={`relative z-10 max-w-lg w-full p-6 md:p-8 rounded-2xl backdrop-blur-md bg-zinc-950/80 shadow-2xl ${borderColor} border`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Calibration Wizard</h2>
            <span className="text-xs font-mono bg-white/20 px-2 py-1 rounded text-white">
              {currentIndex + 1} / {points.length}
            </span>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl md:text-3xl font-black mb-2 text-white drop-shadow-md">
              {currentPoint.label}
            </h3>
          </div>

          {/* Workflow Guide */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
             <h4 className="text-blue-200 font-bold mb-3 flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider">
               <Info className="w-4 h-4"/> How to Measure
             </h4>
             <ol className="text-xs md:text-sm text-zinc-300 space-y-3">
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                  <span>Click <strong>Hide Controls</strong> below. The screen will become pure color.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                  <span>Point your phone at the center. Tap <strong>Capture Measurement</strong> on the phone to freeze the values.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                  <span>Click anywhere on this screen to reveal these controls again.</span>
                </li>
             </ol>
          </div>

          {/* Manual Input Section */}
          <div className="bg-black/40 p-4 md:p-5 rounded-xl border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 text-white/90">
                <Smartphone className="w-4 h-4 text-zinc-400" />
                <span className="font-medium text-sm">Input Frozen Values</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-red-400 font-bold mb-1 text-center">Red</label>
                <input 
                  type="number" 
                  value={manualR}
                  onChange={(e) => setManualR(e.target.value)}
                  placeholder={currentPoint.targetColor.r.toString()}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-red-500 text-center font-mono text-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-green-400 font-bold mb-1 text-center">Green</label>
                <input 
                  type="number" 
                  value={manualG}
                  onChange={(e) => setManualG(e.target.value)}
                  placeholder={currentPoint.targetColor.g.toString()}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-green-500 text-center font-mono text-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-1 text-center">Blue</label>
                <input 
                  type="number" 
                  value={manualB}
                  onChange={(e) => setManualB(e.target.value)}
                  placeholder={currentPoint.targetColor.b.toString()}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-blue-500 text-center font-mono text-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setIsUIVisible(false)}
              className="w-full py-3 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center justify-center gap-2 transition-all border border-zinc-700 group"
            >
              <EyeOff className="w-5 h-5 group-hover:text-white" /> Hide Controls & Measure
            </button>
            
            <div className="flex gap-3">
              <button 
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 font-medium transition-all text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleNext}
                className="flex-[2] py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all"
              >
                {currentIndex === points.length - 1 ? (
                  <>Finish <Check className="w-5 h-5" /></>
                ) : (
                  <>Next Color <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Hidden UI Hint */
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
           <MousePointerClick className={`w-8 h-8 ${textColor} animate-bounce`} />
           <p className={`px-4 py-2 rounded-full backdrop-blur-md font-bold text-sm whitespace-nowrap ${brightness > 125 ? 'bg-black/10 text-black' : 'bg-black/50 text-white'}`}>
             Click anywhere to input values
           </p>
        </div>
      )}
    </div>
  );
};