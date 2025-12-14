import React, { useState } from 'react';
import { AppMode, MeasurementPoint, TARGET_POINTS, CalibrationSettings, DEFAULT_SETTINGS } from './types';
import { PatternGenerator } from './components/PatternGenerator';
import { SensorMode } from './components/SensorMode';
import { Report } from './components/Report';
import { Manual } from './components/Manual';
import { TutorialOverlay } from './components/TutorialOverlay';
import { SettingsModal } from './components/SettingsModal';
import { Monitor, Smartphone, ArrowRight, Zap, Target, BarChart3, Scan, MousePointerClick, Camera, Keyboard, FileCheck, HelpCircle, Info, Sliders } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.LANDING);
  const [previousMode, setPreviousMode] = useState<AppMode>(AppMode.LANDING);
  const [measurements, setMeasurements] = useState<MeasurementPoint[]>(TARGET_POINTS);
  const [showTutorial, setShowTutorial] = useState(false);
  const [settings, setSettings] = useState<CalibrationSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  const handleDisplayComplete = (results: MeasurementPoint[]) => {
    setMeasurements(results);
    setMode(AppMode.REPORT);
  };

  const resetApp = () => {
    setMeasurements(TARGET_POINTS);
    setMode(AppMode.LANDING);
  };

  const openManual = () => {
    setPreviousMode(mode);
    setMode(AppMode.MANUAL);
  };

  const closeManual = () => {
    setMode(previousMode);
  };

  // Logic to handle feature access - now open to all
  const requestFeatureAccess = (targetMode: AppMode) => {
    setMode(targetMode);
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.MANUAL:
        return <Manual onBack={closeManual} />;
      case AppMode.DISPLAY_SOURCE:
        return (
          <PatternGenerator 
            points={TARGET_POINTS} 
            onComplete={handleDisplayComplete}
            onCancel={resetApp}
          />
        );
      case AppMode.SENSOR_DEVICE:
        return <SensorMode onBack={resetApp} />;
      case AppMode.REPORT:
        return (
          <Report 
            measurements={measurements} 
            settings={settings}
            onUpdateSettings={setSettings}
            onRestart={resetApp} 
            onOpenManual={openManual}
            onOpenSettings={() => setShowSettings(true)}
          />
        );
      default:
        return (
          <div className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30 overflow-x-hidden">
            {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
            
            {/* Top Bar */}
            <div className="absolute top-0 right-0 p-4 md:p-6 z-20 flex flex-wrap justify-end gap-2 md:gap-4">
               <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs md:text-sm font-medium bg-black/20 p-2 rounded-lg backdrop-blur-sm"
              >
                <Sliders className="w-4 h-4" /> Settings
              </button>
               <button 
                onClick={() => setShowTutorial(true)}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs md:text-sm font-medium bg-black/20 p-2 rounded-lg backdrop-blur-sm"
              >
                <Info className="w-4 h-4" /> Start Tour
              </button>
              <button 
                id="btn-manual"
                onClick={openManual}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs md:text-sm font-medium bg-black/20 p-2 rounded-lg backdrop-blur-sm"
              >
                <HelpCircle className="w-4 h-4" /> Manual
              </button>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
               {/* Decorative blurs */}
               <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none"></div>
               <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none"></div>

               <div className="max-w-6xl mx-auto px-4 md:px-6 pt-24 md:pt-20 pb-16 md:pb-24 relative z-10">
                 <div className="flex flex-col items-center text-center">
                   
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8">
                     <Zap className="w-3 h-3 fill-blue-400" /> Free & Open Source
                   </div>

                   <h1 id="hero-title" className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                     ChromaCal
                   </h1>
                   <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-12">
                     Professional monitor calibration without the hardware. Use your smartphone or webcam as a colorimeter to create precision ICC profiles for your display.
                   </p>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                     {/* Card 1: Display Mode */}
                     <button 
                       id="card-calibrate"
                       onClick={() => requestFeatureAccess(AppMode.DISPLAY_SOURCE)}
                       className="group relative overflow-hidden p-6 md:p-8 bg-zinc-900 border border-white/10 rounded-3xl hover:border-blue-500/50 transition-all hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] text-left"
                     >
                       <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Monitor className="w-32 h-32 text-blue-500" />
                       </div>
                       <div className="relative z-10">
                         <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                           <Monitor className="w-6 h-6" />
                         </div>
                         <h3 className="flex items-center gap-2 text-xl md:text-2xl font-bold mb-2 text-white">
                            Calibrate Screen
                         </h3>
                         <p className="text-sm text-zinc-400 mb-6">
                           Turn this display into a color reference source.
                         </p>
                         <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                           Start Wizard <ArrowRight className="w-4 h-4" />
                         </div>
                       </div>
                     </button>

                     {/* Card 2: Sensor Mode */}
                     <button 
                       id="card-sensor"
                       onClick={() => requestFeatureAccess(AppMode.SENSOR_DEVICE)}
                       className="group relative overflow-hidden p-6 md:p-8 bg-zinc-900 border border-white/10 rounded-3xl hover:border-purple-500/50 transition-all hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] text-left"
                     >
                       <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Smartphone className="w-32 h-32 text-purple-500" />
                       </div>
                       <div className="relative z-10">
                         <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                           <Scan className="w-6 h-6" />
                         </div>
                         <h3 className="flex items-center gap-2 text-xl md:text-2xl font-bold mb-2 text-white">
                            Use as Sensor
                         </h3>
                         <p className="text-sm text-zinc-400 mb-6">
                           Use this device's camera to measure another screen.
                         </p>
                         <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                           Open Camera <ArrowRight className="w-4 h-4" />
                         </div>
                       </div>
                     </button>
                   </div>
                 </div>
               </div>
            </div>

            {/* How it Works Section */}
            <div className="py-16 md:py-24 bg-zinc-900/30 border-y border-white/5">
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Calibration in 4 Simple Steps</h2>
                  <p className="text-zinc-400 max-w-2xl mx-auto">
                    ChromaCal separates the pattern generation and measurement logic across your devices.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
                   {/* Connector Line (Desktop) */}
                   <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 -z-10"></div>

                   {/* Step 1 */}
                   <div className="relative flex flex-col items-center text-center">
                     <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-6 shadow-xl z-10 relative group hover:border-blue-500 transition-colors">
                        <MousePointerClick className="w-10 h-10 text-blue-400" />
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-zinc-900">1</div>
                     </div>
                     <h3 className="text-lg font-bold mb-2 text-white">Setup Devices</h3>
                     <p className="text-sm text-zinc-400 leading-relaxed">
                       Open ChromaCal on your desktop (to calibrate) and your phone (sensor).
                     </p>
                   </div>

                   {/* Step 2 */}
                   <div className="relative flex flex-col items-center text-center">
                     <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-6 shadow-xl z-10 relative group hover:border-purple-500 transition-colors">
                        <Camera className="w-10 h-10 text-purple-400" />
                         <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-zinc-900">2</div>
                     </div>
                     <h3 className="text-lg font-bold mb-2 text-white">Measure Colors</h3>
                     <p className="text-sm text-zinc-400 leading-relaxed">
                       Point your phone camera at each color patch displayed.
                     </p>
                   </div>

                   {/* Step 3 */}
                   <div className="relative flex flex-col items-center text-center">
                     <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-6 shadow-xl z-10 relative group hover:border-pink-500 transition-colors">
                        <Keyboard className="w-10 h-10 text-pink-400" />
                         <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-zinc-900">3</div>
                     </div>
                     <h3 className="text-lg font-bold mb-2 text-white">Input Data</h3>
                     <p className="text-sm text-zinc-400 leading-relaxed">
                       Enter the RGB values from your phone into the desktop wizard.
                     </p>
                   </div>

                   {/* Step 4 */}
                   <div className="relative flex flex-col items-center text-center">
                     <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-6 shadow-xl z-10 relative group hover:border-green-500 transition-colors">
                        <FileCheck className="w-10 h-10 text-green-400" />
                         <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-zinc-900">4</div>
                     </div>
                     <h3 className="text-lg font-bold mb-2 text-white">Generate Profile</h3>
                     <p className="text-sm text-zinc-400 leading-relaxed">
                       ZAP AI analyzes drift and creates a corrective ICC profile.
                     </p>
                   </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-white">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Precise Measurements</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Uses advanced computer vision algorithms to average pixel data from your camera sensor.
                  </p>
                </div>
                <div className="space-y-4">
                   <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-white">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Smart Analysis</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Powered by ZAP AI to interpret color drift and generate corrective gamma curves.
                  </p>
                </div>
                <div className="space-y-4">
                   <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-white">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Hardware Free</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    No need to buy a $200 colorimeter. Your smartphone is a capable sensor.
                  </p>
                </div>
              </div>
            </div>
            
            <footer className="py-8 border-t border-white/5 text-center text-zinc-600 text-sm">
              <p>&copy; 2024 ChromaCal. Free Professional Calibration.</p>
            </footer>
          </div>
        );
    }
  };

  return (
    <>
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        onSave={setSettings} 
        currentSettings={settings} 
      />
      {renderContent()}
    </>
  );
}