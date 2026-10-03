import { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Download, Copy, Moon, Sun, Settings2, Palette } from 'lucide-react';
import type { QROptions, QRType } from './types';
import Customizer from './components/Customizer';
import Presets from './components/Presets';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const defaultOptions: QROptions = {
  width: 300,
  height: 300,
  margin: 10,
  data: 'https://example.com',
  image: '',
  dotsOptions: {
    color: '#000000',
    type: 'square',
  },
  backgroundOptions: {
    color: '#ffffff',
  },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 10,
  },
  cornersSquareOptions: {
    color: '#000000',
    type: 'square',
  },
  cornersDotOptions: {
    color: '#000000',
    type: 'dot',
  },
  qrOptions: {
    errorCorrectionLevel: 'Q',
  },
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [options, setOptions] = useState<QROptions>(defaultOptions);
  const [qrType, setQrType] = useState<QRType>('url');
  
  // Data inputs
  const [urlData, setUrlData] = useState('https://example.com');
  const [textData, setTextData] = useState('');
  const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });
  const [phoneData, setPhoneData] = useState('');
  const [wifiData, setWifiData] = useState({ ssid: '', password: '', encryption: 'WPA' });

  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      if (next === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return next;
    });
  };

  // Compute final data string based on selected type
  const [isValid, setIsValid] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let finalData = '';
    let valid = true;
    let err = '';

    switch (qrType) {
      case 'url': 
        finalData = urlData; 
        if (!finalData.trim() || !/^https?:\/\/.+/.test(finalData)) {
          valid = false; err = 'Please enter a valid URL (e.g., https://example.com)';
        }
        break;
      case 'text': 
        finalData = textData; 
        if (!finalData.trim()) { valid = false; err = 'Text cannot be empty.'; }
        break;
      case 'email': 
        finalData = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        if (!emailData.to || !/^\S+@\S+\.\S+$/.test(emailData.to)) {
          valid = false; err = 'Please enter a valid email address.';
        }
        break;
      case 'phone': 
        finalData = `tel:${phoneData}`; 
        if (!phoneData.trim() || !/^\+?[0-9\-\s]+$/.test(phoneData)) {
          valid = false; err = 'Please enter a valid phone number.';
        }
        break;
      case 'wifi':
        finalData = `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};;`;
        if (!wifiData.ssid.trim()) {
          valid = false; err = 'SSID (Network Name) cannot be empty.';
        }
        break;
    }
    
    setIsValid(valid);
    setErrorMsg(err);
    setOptions(prev => ({ ...prev, data: finalData || ' ' }));
  }, [qrType, urlData, textData, emailData, phoneData, wifiData]);

  // Init and update QR code
  useEffect(() => {
    if (!qrRef.current) return;
    
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling(options);
      qrCode.current.append(qrRef.current);
    } else {
      qrCode.current.update(options);
    }
  }, [options]);

  const handleDownload = (ext: 'png' | 'svg') => {
    if (qrCode.current) {
      qrCode.current.download({ name: 'qr-code', extension: ext });
      saveToHistory();
    }
  };

  const handleCopy = async () => {
    if (qrCode.current) {
      try {
        const blob = await qrCode.current.getRawData('png');
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('QR Code copied to clipboard!');
          saveToHistory();
        }
      } catch (err) {
        console.error('Failed to copy', err);
        alert('Failed to copy. Your browser might not support copying images to clipboard directly.');
      }
    }
  };

  // Helper for luminance
  const getLuminance = (hex: string) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const [rr, gg, bb] = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
  };

  const getContrastRatio = (l1: number, l2: number) => {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const fgColor = options.dotsOptions.color || '#000000';
  const bgColor = options.backgroundOptions.color || '#ffffff';
  const contrast = getContrastRatio(getLuminance(fgColor), getLuminance(bgColor));
  const showWarning = contrast < 3.0; // Minimal contrast for scannability

  // History state
  const [history, setHistory] = useState<QROptions[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('qr_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch(e){}
    }
  }, []);

  const saveToHistory = () => {
    setHistory(prev => {
      const newHist = [options, ...prev.filter(o => o.data !== options.data || o.image !== options.image)].slice(0, 10);
      localStorage.setItem('qr_history', JSON.stringify(newHist));
      return newHist;
    });
  };

  const loadFromHistory = (histOpt: QROptions) => {
    setOptions(histOpt);
    const data = histOpt.data;
    if (data.startsWith('WIFI:')) {
      setQrType('wifi');
      const ssidMatch = data.match(/S:(.*?);/);
      const passMatch = data.match(/P:(.*?);/);
      const encMatch = data.match(/T:(.*?);/);
      setWifiData({
        ssid: ssidMatch ? ssidMatch[1] : '',
        password: passMatch ? passMatch[1] : '',
        encryption: encMatch ? encMatch[1] : 'WPA'
      });
    } else if (data.startsWith('mailto:')) {
      setQrType('email');
      const url = new URL(data);
      setEmailData({
        to: url.pathname,
        subject: url.searchParams.get('subject') || '',
        body: url.searchParams.get('body') || ''
      });
    } else if (data.startsWith('tel:')) {
      setQrType('phone');
      setPhoneData(data.substring(4));
    } else if (data.startsWith('http://') || data.startsWith('https://')) {
      setQrType('url');
      setUrlData(data);
    } else {
      setQrType('text');
      setTextData(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-xl leading-none">Q</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
            QR Studio
          </h1>
        </div>
        <button 
          onClick={toggleTheme} 
          className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm backdrop-blur-sm"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} className="text-slate-700" /> : <Sun size={18} className="text-slate-200" />}
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-8">
        {/* Left column: Controls */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Settings2 size={20} />
              </div>
              <h2 className="text-xl font-bold">Content Type</h2>
            </div>
            
            {/* Type selector */}
            <div className="flex flex-wrap gap-2 mb-8 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
              {(['url', 'text', 'email', 'phone', 'wifi'] as QRType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setQrType(t)}
                  className={cn(
                    "flex-1 min-w-[80px] px-4 py-2.5 rounded-xl capitalize font-medium text-sm transition-all duration-300",
                    qrType === t 
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-600/50" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Dynamic Inputs */}
            <div className="space-y-4">
              {qrType === 'url' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">Website URL</label>
                  <input type="url" placeholder="https://example.com" value={urlData} onChange={e => setUrlData(e.target.value)} className="input-field" />
                </div>
              )}
              {qrType === 'text' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">Plain Text</label>
                  <textarea placeholder="Enter text..." value={textData} onChange={e => setTextData(e.target.value)} className="input-field min-h-[120px] resize-y" />
                </div>
              )}
              {qrType === 'email' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">Email Address</label>
                    <input type="email" placeholder="hello@example.com" value={emailData.to} onChange={e => setEmailData(prev => ({...prev, to: e.target.value}))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">Subject</label>
                    <input type="text" placeholder="Subject" value={emailData.subject} onChange={e => setEmailData(prev => ({...prev, subject: e.target.value}))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">Message Body</label>
                    <textarea placeholder="Write your message here..." value={emailData.body} onChange={e => setEmailData(prev => ({...prev, body: e.target.value}))} className="input-field min-h-[100px] resize-y" />
                  </div>
                </div>
              )}
              {qrType === 'phone' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input type="tel" placeholder="+1234567890" value={phoneData} onChange={e => setPhoneData(e.target.value)} className="input-field" />
                </div>
              )}
              {qrType === 'wifi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">Network Name (SSID)</label>
                    <input type="text" placeholder="My WiFi Network" value={wifiData.ssid} onChange={e => setWifiData(prev => ({...prev, ssid: e.target.value}))} className="input-field" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">Password</label>
                      <input type="password" placeholder="Password" value={wifiData.password} onChange={e => setWifiData(prev => ({...prev, password: e.target.value}))} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">Encryption</label>
                      <select value={wifiData.encryption} onChange={e => setWifiData(prev => ({...prev, encryption: e.target.value}))} className="input-field appearance-none">
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600 dark:text-pink-400">
                <Palette size={20} />
              </div>
              <h2 className="text-xl font-bold">Quick Presets</h2>
            </div>
            <Presets setOptions={setOptions} />
          </div>

          <div className="glass-panel p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Settings2 size={20} />
              </div>
              <h2 className="text-xl font-bold">Design Customization</h2>
            </div>
            <Customizer options={options} setOptions={setOptions} />
          </div>
        </div>

        {/* Right column: Preview & Actions */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-6 sm:p-8 sticky top-6 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-8 text-center text-slate-800 dark:text-slate-100">Live Preview</h2>
            
            <div className={`relative flex justify-center mb-8 transition-all duration-500 ${!isValid ? 'opacity-30 scale-95 blur-[2px]' : 'opacity-100 scale-100 blur-0'} p-4 bg-white/50 dark:bg-white/10 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 backdrop-blur-md border border-white/40 dark:border-white/10`}>
              <div ref={qrRef} className="rounded-2xl overflow-hidden shadow-sm mix-blend-multiply dark:mix-blend-normal" />
            </div>

            {!isValid && errorMsg && (
              <div className="mb-6 w-full p-4 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-500/20 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {showWarning && (
              <div className="mb-6 w-full p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium rounded-xl border border-amber-500/20 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>Low contrast detected. The QR code might be hard to scan. Consider using a darker foreground.</span>
              </div>
            )}
            
            {options.image && options.qrOptions.errorCorrectionLevel !== 'H' && (
              <div className="mb-6 w-full p-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-xl border border-blue-500/20 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                <span className="shrink-0 mt-0.5">💡</span>
                <span>You added a logo. It's recommended to set Error Correction to High (H).</span>
              </div>
            )}

            <div className="w-full grid grid-cols-2 gap-3 mb-4">
              <button 
                onClick={() => handleDownload('png')} 
                disabled={!isValid}
                className="btn-primary"
              >
                <Download size={18} /> PNG
              </button>
              <button 
                onClick={() => handleDownload('svg')} 
                disabled={!isValid}
                className="btn-secondary"
              >
                <Download size={18} /> SVG
              </button>
            </div>
            
            <button 
              onClick={handleCopy} 
              disabled={!isValid}
              className="w-full btn-secondary"
            >
              <Copy size={18} /> Copy to Clipboard
            </button>

            {history.length > 0 && (
              <div className="w-full mt-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">History</h3>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {history.map((hist, i) => (
                    <button 
                      key={i} 
                      onClick={() => loadFromHistory(hist)}
                      className="w-full text-left p-3 rounded-xl bg-white/40 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 truncate border border-slate-200/50 dark:border-slate-700/50 transition-all shadow-sm hover:shadow"
                    >
                      {hist.data.length > 30 ? hist.data.substring(0, 30) + '...' : hist.data}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
