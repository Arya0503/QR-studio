import React from 'react';
import type { QROptions } from '../types';

interface CustomizerProps {
  options: QROptions;
  setOptions: React.Dispatch<React.SetStateAction<QROptions>>;
}

export default function Customizer({ options, setOptions }: CustomizerProps) {
  const handleChange = (key: string, value: any, nestedKey?: string) => {
    setOptions(prev => {
      if (nestedKey) {
        return {
          ...prev,
          [key]: {
            ...(prev[key as keyof QROptions] as any),
            [nestedKey]: value
          }
        };
      }
      return { ...prev, [key]: value };
    });
  };

  return (
    <div className="space-y-8">
      {/* Size & Margin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Size (px)</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md">{options.width}</span>
          </div>
          <input 
            type="range" min="100" max="1000" step="10" 
            value={options.width} 
            onChange={e => {
              const val = Number(e.target.value);
              setOptions(prev => ({ ...prev, width: val, height: val }));
            }} 
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Margin</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md">{options.margin}</span>
          </div>
          <input 
            type="range" min="0" max="50" step="1" 
            value={options.margin} 
            onChange={e => handleChange('margin', Number(e.target.value))} 
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Foreground Color</label>
          <div className="flex p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm w-fit mb-3">
            <button 
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${options.dotsOptions.gradient ? 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white' : 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'}`} 
              onClick={() => {
                const newOptions = { ...options, dotsOptions: { ...options.dotsOptions } };
                delete newOptions.dotsOptions.gradient;
                setOptions(newOptions);
              }}
            >
              Solid
            </button>
            <button 
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${options.dotsOptions.gradient ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
              onClick={() => {
                const color = options.dotsOptions.color || '#000000';
                handleChange('dotsOptions', {
                  type: 'linear',
                  colorStops: [{ offset: 0, color }, { offset: 1, color: '#2563eb' }]
                }, 'gradient');
              }}
            >
              Gradient
            </button>
          </div>
          
          {!options.dotsOptions.gradient ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden shrink-0">
                <input 
                  type="color" 
                  value={options.dotsOptions.color} 
                  onChange={e => handleChange('dotsOptions', e.target.value, 'color')} 
                  className="w-16 h-16 -m-3 cursor-pointer"
                />
              </div>
              <span className="text-sm font-mono text-slate-500 uppercase">{options.dotsOptions.color}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden shrink-0">
                  <input 
                    type="color" 
                    value={options.dotsOptions.gradient.colorStops[0].color} 
                    onChange={e => {
                      const gradient = { ...options.dotsOptions.gradient! };
                      gradient.colorStops[0].color = e.target.value;
                      handleChange('dotsOptions', gradient, 'gradient');
                    }} 
                    className="w-12 h-12 -m-2 cursor-pointer"
                  />
                </div>
                <span className="text-slate-400 text-xs">to</span>
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden shrink-0">
                  <input 
                    type="color" 
                    value={options.dotsOptions.gradient.colorStops[1].color} 
                    onChange={e => {
                      const gradient = { ...options.dotsOptions.gradient! };
                      gradient.colorStops[1].color = e.target.value;
                      handleChange('dotsOptions', gradient, 'gradient');
                    }} 
                    className="w-12 h-12 -m-2 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Background Color</label>
          <div className="flex items-center gap-3 h-10 mt-[44px]">
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden shrink-0">
              <input 
                type="color" 
                value={options.backgroundOptions.color} 
                onChange={e => handleChange('backgroundOptions', e.target.value, 'color')} 
                className="w-16 h-16 -m-3 cursor-pointer"
              />
            </div>
            <span className="text-sm font-mono text-slate-500 uppercase">{options.backgroundOptions.color}</span>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-slate-200 dark:bg-slate-700/50" />

      {/* Style & Error Correction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Pattern Style</label>
          <select 
            value={options.dotsOptions.type} 
            onChange={e => handleChange('dotsOptions', e.target.value, 'type')}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="square">Square</option>
            <option value="dots">Dots</option>
            <option value="rounded">Rounded</option>
            <option value="classy">Classy</option>
            <option value="classy-rounded">Classy Rounded</option>
            <option value="extra-rounded">Extra Rounded</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Error Correction</label>
          <select 
            value={options.qrOptions.errorCorrectionLevel} 
            onChange={e => handleChange('qrOptions', e.target.value, 'errorCorrectionLevel')}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="L">Low (7%) - Cleanest</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%) - Best for Logos</option>
          </select>
        </div>
      </div>
      
      {/* Logo/Image */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Center Logo URL (Optional)</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-slate-400">🔗</span>
          </div>
          <input 
            type="url" 
            placeholder="https://example.com/logo.png" 
            value={options.image || ''} 
            onChange={e => handleChange('image', e.target.value)} 
            className="input-field pl-10"
          />
        </div>
      </div>
    </div>
  );
}
