import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface TutorialOverlayProps {
  onClose: () => void;
}

const STEPS = [
  {
    targetId: 'hero-title',
    title: 'Welcome to ChromaCal',
    content: 'ChromaCal helps you calibrate your monitor colors accurately using just your smartphone. Let\'s take a quick tour.',
    position: 'bottom'
  },
  {
    targetId: 'card-calibrate',
    title: 'Step 1: Display Source',
    content: 'Open this mode on the computer or monitor you want to calibrate. It will display the color patterns.',
    position: 'bottom'
  },
  {
    targetId: 'card-sensor',
    title: 'Step 2: Sensor Device',
    content: 'Open this mode on your smartphone. You will point your phone camera at the screen to measure the colors.',
    position: 'bottom'
  },
  {
    targetId: 'btn-manual',
    title: 'Need Help?',
    content: 'Access the comprehensive user manual and installation guides here at any time.',
    position: 'bottom' 
  }
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Small delay to ensure render
    const timer = setTimeout(() => {
      const step = STEPS[currentStep];
      const element = document.getElementById(step.targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Wait for scroll to finish approximately
        setTimeout(() => {
            setTargetRect(element.getBoundingClientRect());
        }, 500);
      } else {
        setTargetRect(null);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep, windowSize]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = STEPS[currentStep];

  // Calculate Popover Position
  const getPopoverStyle = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    // Default to bottom center
    let top = targetRect.bottom + 20;
    let left = targetRect.left + (targetRect.width / 2) - 160; // Center 320px wide box

    // Keep within viewport
    if (left < 20) left = 20;
    if (left + 320 > window.innerWidth) left = window.innerWidth - 340;
    
    // Adjust for vertical overflow
    if (top + 200 > window.innerHeight) {
        // Place on top if no room below
        top = targetRect.top - 240; 
    }

    return { top, left };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
      {/* SVG Mask for the Spotlight Effect */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-500 ease-in-out">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 10}
                y={targetRect.top - 10}
                width={targetRect.width + 20}
                height={targetRect.height + 20}
                rx="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.8)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Control Box */}
      {targetRect && (
        <div
          className="absolute max-w-xs w-full bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out"
          style={getPopoverStyle()}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <button onClick={onClose} className="text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
          <p className="text-zinc-400 mb-6 text-sm leading-relaxed">{step.content}</p>

          <div className="flex items-center justify-between">
            <button 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`p-2 rounded-lg transition-colors ${currentStep === 0 ? 'text-zinc-800 cursor-not-allowed' : 'text-zinc-300 hover:bg-zinc-800'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentStep ? 'bg-blue-500' : 'bg-zinc-800'}`}
                />
              ))}
            </div>

            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors"
            >
              {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
              {currentStep < STEPS.length - 1 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};