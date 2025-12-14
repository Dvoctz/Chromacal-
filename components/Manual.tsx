import React, { useState } from 'react';
import { ArrowLeft, Monitor, Command, HelpCircle, Smartphone, FolderOpen, MousePointerClick, CheckCircle2 } from 'lucide-react';

interface ManualProps {
  onBack: () => void;
}

type Tab = 'app' | 'windows' | 'mac';

export const Manual: React.FC<ManualProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('app');

  const renderContent = () => {
    switch (activeTab) {
      case 'app':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">How to use ChromaCal</h3>
              <p className="text-zinc-400 mb-6">
                ChromaCal generates a standard ICC profile file that you can install on your operating system to correct colors automatically.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg flex-shrink-0">1</div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-2">Measure Screen</h4>
                  <p className="text-zinc-400 text-sm">
                    Follow the calibration wizard. Use your phone to measure the color patches displayed on your monitor.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg flex-shrink-0">2</div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-2">Download Profile</h4>
                  <p className="text-zinc-400 text-sm">
                    Once analysis is complete, click <strong>Download Profile (.icc)</strong>. Save this file to your computer.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-lg flex-shrink-0">3</div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-2">Install Profile</h4>
                  <p className="text-zinc-400 text-sm">
                    Use the guide in the sidebar tabs (Windows or Mac) to install the file into your system settings. This will apply the color correction globally.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'windows':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
             <div>
              <h3 className="text-2xl font-bold text-white mb-4">Installing on Windows</h3>
              <p className="text-zinc-400 mb-6">
                How to apply your ChromaCal .icc profile on Windows 10/11.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-800 p-6 rounded-lg">
                <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <MousePointerClick className="w-5 h-5 text-blue-400" /> Step 1: Install the File
                </h4>
                <p className="text-zinc-400 text-sm mb-4">
                  Locate the <strong>.icc</strong> file you downloaded. Right-click the file and select <strong>Install Profile</strong>.
                </p>
                <div className="bg-black/40 p-4 rounded text-sm text-zinc-300">
                  <em>Tip: If you don't see "Install Profile", you can manually copy the file to:</em><br/>
                  <code className="text-blue-400">C:\Windows\System32\spool\drivers\color</code>
                </div>
              </div>

               <div className="bg-zinc-800 p-6 rounded-lg">
                <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <Monitor className="w-5 h-5 text-green-400" /> Step 2: Activate in Settings
                </h4>
                <ol className="list-decimal pl-5 text-zinc-400 text-sm space-y-3">
                  <li>Press <strong>Windows Key</strong>, type "Color Management", and press Enter.</li>
                  <li>In the dialog, verify your monitor is selected in the "Device" dropdown.</li>
                  <li>Check the box <strong>"Use my settings for this device"</strong>.</li>
                  <li>Click <strong>Add...</strong> button at the bottom.</li>
                  <li>Find your ChromaCal profile in the list, select it, and click OK.</li>
                  <li>Select the new profile in the list and click <strong>Set as Default Profile</strong>.</li>
                </ol>
              </div>
            </div>
          </div>
        );

      case 'mac':
        return (
           <div className="space-y-8 animate-in fade-in duration-300">
             <div>
              <h3 className="text-2xl font-bold text-white mb-4">Installing on macOS</h3>
              <p className="text-zinc-400 mb-6">
                How to apply your ChromaCal .icc profile on a Mac.
              </p>
            </div>

             <div className="space-y-6">
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
                 <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                   <FolderOpen className="w-5 h-5" /> Step 1: Copy Profile
                 </h4>
                 <p className="text-zinc-400 text-sm mb-4">
                   Move your downloaded <strong>.icc</strong> file into the ColorSync folder.
                 </p>
                 <ol className="list-decimal pl-5 text-zinc-300 text-sm space-y-3">
                   <li>Open <strong>Finder</strong>.</li>
                   <li>In the menu bar, click <strong>Go</strong> -&gt; <strong>Go to Folder...</strong></li>
                   <li>Type: <code className="text-blue-400">~/Library/ColorSync/Profiles</code></li>
                   <li>Drag and drop your .icc file into this folder.</li>
                 </ol>
              </div>

               <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Command className="w-5 h-5" /> Step 2: Select Profile
                </h4>
                <ol className="list-decimal pl-5 text-zinc-300 text-sm space-y-3">
                   <li>Open <strong>System Settings</strong> (or System Preferences).</li>
                   <li>Go to <strong>Displays</strong>.</li>
                   <li>Click the <strong>Color Profile</strong> dropdown menu.</li>
                   <li>Your ChromaCal profile should now appear in the list. Select it to apply.</li>
                 </ol>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <div className="md:w-64 bg-zinc-900 border-r border-white/5 flex flex-col">
        <div className="p-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to App
          </button>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            User Manual
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('app')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'app' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
          >
            <Smartphone className="w-4 h-4" /> App Overview
          </button>
          <button 
             onClick={() => setActiveTab('windows')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'windows' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
          >
            <Monitor className="w-4 h-4" /> Install on Windows
          </button>
          <button 
             onClick={() => setActiveTab('mac')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'mac' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
          >
            <Command className="w-4 h-4" /> Install on Mac
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto max-h-screen">
        <div className="max-w-3xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};