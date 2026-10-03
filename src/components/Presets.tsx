import React from 'react';
import type { QROptions } from '../types';

interface PresetsProps {
  setOptions: React.Dispatch<React.SetStateAction<QROptions>>;
}

const presets = [
  {
    name: 'Classic',
    options: {
      dotsOptions: { type: 'square', color: '#000000' },
      backgroundOptions: { color: '#ffffff' },
      cornersSquareOptions: { type: 'square', color: '#000000' },
      cornersDotOptions: { type: 'dot', color: '#000000' },
    }
  },
  {
    name: 'Rounded Blue',
    options: {
      dotsOptions: { type: 'rounded', color: '#2563eb' },
      backgroundOptions: { color: '#ffffff' },
      cornersSquareOptions: { type: 'extra-rounded', color: '#1e40af' },
      cornersDotOptions: { type: 'dot', color: '#1e40af' },
    }
  },
  {
    name: 'Classy Dark',
    options: {
      dotsOptions: { type: 'classy', color: '#1f2937' },
      backgroundOptions: { color: '#f3f4f6' },
      cornersSquareOptions: { type: 'extra-rounded', color: '#111827' },
      cornersDotOptions: { type: 'dot', color: '#111827' },
    }
  },
  {
    name: 'Dot Matrix',
    options: {
      dotsOptions: { type: 'dots', color: '#059669' },
      backgroundOptions: { color: '#ecfdf5' },
      cornersSquareOptions: { type: 'dot', color: '#047857' },
      cornersDotOptions: { type: 'dot', color: '#047857' },
    }
  }
];

export default function Presets({ setOptions }: PresetsProps) {
  const applyPreset = (presetOptions: any) => {
    setOptions(prev => {
      const newDots = { ...prev.dotsOptions, ...presetOptions.dotsOptions };
      if (!presetOptions.dotsOptions.gradient) {
        delete newDots.gradient;
      }
      return {
        ...prev,
        dotsOptions: newDots,
        backgroundOptions: { ...prev.backgroundOptions, ...presetOptions.backgroundOptions },
        cornersSquareOptions: { ...prev.cornersSquareOptions, ...presetOptions.cornersSquareOptions },
        cornersDotOptions: { ...prev.cornersDotOptions, ...presetOptions.cornersDotOptions },
      };
    });
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {presets.map(preset => (
        <button
          key={preset.name}
          onClick={() => applyPreset(preset.options)}
          className="flex flex-col items-center justify-center gap-2 p-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl transition-all duration-300 hover:shadow-md hover:shadow-blue-500/10 hover:-translate-y-0.5"
        >
          <div className="w-8 h-8 rounded-full shadow-inner border border-slate-200 dark:border-slate-600" 
            style={{ 
              background: preset.options.backgroundOptions.color,
            }}
          >
            <div className="w-full h-full rounded-full" 
              style={{
                background: preset.options.dotsOptions.color,
                clipPath: preset.options.dotsOptions.type === 'dots' || preset.options.dotsOptions.type === 'rounded' 
                  ? 'circle(30% at 50% 50%)' 
                  : 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)'
              }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{preset.name}</span>
        </button>
      ))}
    </div>
  );
}
