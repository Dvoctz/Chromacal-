import React, { useEffect, useState } from 'react';
import { CalibrationResult, MeasurementPoint, CalibrationSettings } from '../types';
import { analyzeCalibration } from '../services/geminiService';
import { generateICCProfileBlob } from '../utils/iccProfileGenerator';
import { CheckCircle, Download, Loader2, RefreshCw, BookOpen, MonitorCheck, Sliders, Palette } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line } from 'recharts';

interface ReportProps {
  measurements: MeasurementPoint[];
  settings: CalibrationSettings;
  onUpdateSettings: (settings: CalibrationSettings) => void;
  onRestart: () => void;
  onOpenManual: () => void;
  onOpenSettings: () => void;
}

export const Report: React.FC<ReportProps> = ({ measurements, settings, onUpdateSettings, onRestart, onOpenManual, onOpenSettings }) => {
  const [result, setResult] = useState<CalibrationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const data = await analyzeCalibration(measurements, settings);
        setResult(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [measurements, settings]);

  const handleDownload = () => {
    if (!result) return;
    
    const blob = generateICCProfileBlob(result);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Clean up filename
    const safeName = result.profileName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    link.href = url;
    link.download = `${safeName}.icc`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCurrentColorHex = () => {
    // Try to parse RGB from "Custom RGB(r,g,b)" or similar
    const match = settings.targetWhitePoint.match(/RGB\((\d+),\s*(\d+),\s*(\d+)\)/i);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    // Default fallback if it is a preset name like "D65"
    return "#ffffff";
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    onUpdateSettings({
      ...settings,
      targetWhitePoint: `Custom RGB(${r}, ${g}, ${b})`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4 text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Analyzing Color Data...</h2>
        <p className="text-zinc-500 mt-2">Optimizing for {settings.targetGamma} Gamma / {settings.targetWhitePoint}</p>
      </div>
    );
  }

  if (!result) return null;

  const gainData = [
    { name: 'Red', gain: result.redGain, fill: '#ef4444' },
    { name: 'Green', gain: result.greenGain, fill: '#22c55e' },
    { name: 'Blue', gain: result.blueGain, fill: '#3b82f6' },
  ];
  
  // Simulated Gamma Curve data based on target vs measured
  const targetGammaVal = parseFloat(settings.targetGamma) || 2.2;
  const gammaData = Array.from({ length: 11 }, (_, i) => {
    const input = i / 10;
    const standard = Math.pow(input, targetGammaVal); // User Target
    const corrected = Math.pow(input, result.gamma); // Measured/Result
    return {
      input: input * 100,
      standard: standard,
      measured: corrected
    };
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Calibration Report</h1>
            <p className="text-zinc-400 text-sm md:text-base">Profile generated for {settings.targetWhitePoint} @ {settings.targetGamma}.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <button 
              onClick={onOpenSettings}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors border border-zinc-700 text-zinc-300"
            >
              <Sliders className="w-4 h-4" /> Tune
            </button>
            <button 
              onClick={onOpenManual}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors border border-zinc-700 text-zinc-300"
            >
              <BookOpen className="w-4 h-4" /> Guide
            </button>
            <button 
              onClick={onRestart}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
            >
              <RefreshCw className="w-4 h-4" /> Restart
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Main Stats Card */}
          <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
             <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
               <div>
                 <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-1">Generated Profile</h3>
                 <div className="text-xl md:text-2xl font-bold text-white break-words">{result.profileName}</div>
               </div>
               <div className="self-start bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20 flex items-center gap-1 whitespace-nowrap">
                 <CheckCircle className="w-3 h-3" /> Ready
               </div>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
               <div className="min-w-0">
                 <div className="text-zinc-500 text-xs mb-1">Measured Gamma</div>
                 <div className="text-xl md:text-2xl font-mono text-white">{result.gamma.toFixed(2)}</div>
               </div>
               <div className="min-w-0">
                 <div className="text-zinc-500 text-xs mb-1">Color Temp</div>
                 <div className="text-xl md:text-2xl font-mono text-white truncate" title={result.colorTemperature}>
                   {result.colorTemperature}
                 </div>
               </div>
               <div className="min-w-0">
                 <div className="text-zinc-500 text-xs mb-1">Delta E</div>
                 <div className={`text-xl md:text-2xl font-mono ${result.deltaE < 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                   {result.deltaE.toFixed(1)}
                 </div>
               </div>
               <div className="min-w-0">
                 <div className="text-zinc-500 text-xs mb-1">Contrast</div>
                 <div className="text-xl md:text-2xl font-mono text-white">{result.contrastRatio}</div>
               </div>
             </div>

             <div className="mt-8 pt-8 border-t border-zinc-800">
               <h4 className="text-sm font-semibold text-zinc-300 mb-3">ZAP AI Analysis</h4>
               <p className="text-zinc-400 leading-relaxed text-sm">
                 {result.feedback}
               </p>
             </div>
          </div>

          {/* Gain Adjustment Chart */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">Correction Curves</h3>
                <div className="flex items-center gap-2" title="Adjust Target White Point">
                  <Palette className="w-4 h-4 text-zinc-500" />
                  <div className="relative overflow-hidden w-6 h-6 rounded-full border border-zinc-600 ring-2 ring-black cursor-pointer hover:scale-110 transition-transform">
                    <input 
                      type="color" 
                      value={getCurrentColorHex()}
                      onChange={handleColorChange}
                      className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                    />
                  </div>
                </div>
            </div>
            
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gainData} margin={{top: 20, right: 30, left: 0, bottom: 5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#e4e4e7" 
                    tick={{fill: '#e4e4e7', fontSize: 12}} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#e4e4e7" 
                    domain={[0, 2]} 
                    tick={{fill: '#e4e4e7', fontSize: 12}} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#18181b', borderColor: '#333', color: '#fff'}}
                    cursor={{fill: '#ffffff10'}}
                  />
                  <ReferenceLine y={1} stroke="#666" strokeDasharray="3 3" />
                  <Bar dataKey="gain" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-zinc-500 mt-4 text-center">
              ICC profile applies these RGB gains.
            </p>
          </div>

           {/* Gamma Curve Chart */}
           <div className="lg:col-span-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
            <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-6">Tone Response Curve (Gamma)</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gammaData} margin={{top: 5, right: 20, bottom: 5, left: 0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="input" 
                    stroke="#e4e4e7" 
                    tick={{fill: '#e4e4e7', fontSize: 12}}
                    label={{ value: 'Input %', position: 'insideBottomRight', offset: -10, fill: '#e4e4e7' }} 
                  />
                  <YAxis 
                    stroke="#e4e4e7" 
                    tick={{fill: '#e4e4e7', fontSize: 12}}
                  />
                  <Tooltip contentStyle={{backgroundColor: '#18181b', borderColor: '#333', color: '#fff'}} />
                  <Line type="monotone" dataKey="standard" stroke="#666" strokeDasharray="5 5" name={`Target ${targetGammaVal}`} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="measured" stroke="#3b82f6" name="Measured Profile" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-gradient-to-r from-blue-900/10 to-indigo-900/10 rounded-2xl p-6 md:p-8 border border-blue-500/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-blue-100 mb-2">Install Calibration</h3>
              <p className="text-blue-200/60 text-sm max-w-xl">
                Download the generated ICC profile and install it using our guide.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button 
                onClick={onOpenManual}
                className="whitespace-nowrap flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-4 rounded-xl font-bold transition-all w-full sm:w-auto"
              >
                <BookOpen className="w-5 h-5" /> Install Guide
              </button>
              <button 
                onClick={handleDownload}
                className="whitespace-nowrap flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-900/50 transition-all transform hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                <Download className="w-5 h-5" /> Download (.icc)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};