import React from 'react';
import { CalibrationSettings } from '../types';
import { X, Save, Sliders } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: CalibrationSettings) => void;
  currentSettings: CalibrationSettings;
}

const STANDARD_WHITE_POINTS = [
  "D50 (5000K)",
  "D55 (5500K)", 
  "D65 (6500K)",
  "D75 (7500K)",
  "9300K"
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings }) => {
  const [localSettings, setLocalSettings] = React.useState(currentSettings);

  // Update local state if prop changes while open
  React.useEffect(() => {
    setLocalSettings(currentSettings);
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const isCustomWhitePoint = !STANDARD_WHITE_POINTS.includes(localSettings.targetWhitePoint);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-500" /> Calibration Settings
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider">Target Gamma</label>
            <select 
              value={localSettings.targetGamma}
              onChange={(e) => setLocalSettings({...localSettings, targetGamma: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="1.8">1.8 (Print/Legacy Mac)</option>
              <option value="2.0">2.0</option>
              <option value="2.2">2.2 (Standard Web/sRGB)</option>
              <option value="2.4">2.4 (Dark Room/BT.1886)</option>
            </select>
            <p className="text-zinc-500 text-xs mt-2">
              Determines how mid-tones are displayed. 2.2 is the industry standard.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider">Target White Point</label>
            <select 
              value={localSettings.targetWhitePoint}
              onChange={(e) => setLocalSettings({...localSettings, targetWhitePoint: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="D50 (5000K)">D50 (5000K) - Warm/Print</option>
              <option value="D55 (5500K)">D55 (5500K)</option>
              <option value="D65 (6500K)">D65 (6500K) - Standard Daylight</option>
              <option value="D75 (7500K)">D75 (7500K) - Cool</option>
              <option value="9300K">9300K - Very Cool</option>
              {isCustomWhitePoint && (
                 <option value={localSettings.targetWhitePoint}>{localSettings.targetWhitePoint} (Custom)</option>
              )}
            </select>
            <p className="text-zinc-500 text-xs mt-2">
              Sets the color temperature of white. D65 is standard for most displays.
            </p>
          </div>
          
           <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex gap-3">
             <Sliders className="w-5 h-5 text-blue-400 flex-shrink-0" />
             <p className="text-blue-200 text-xs leading-relaxed">
               ZAP AI will use these targets to calculate the correction gains and generate the ICC tone response curves.
             </p>
           </div>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-zinc-400 hover:text-white font-medium transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};