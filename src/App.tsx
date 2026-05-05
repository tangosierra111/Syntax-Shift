import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Trash2, 
  Play, 
  Info, 
  Loader2,
  ChevronDown,
  Github,
  Monitor
} from 'lucide-react';
import { convertCode, explainCode } from './lib/gemini';

const LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Dart/Flutter', 'Go', 'Rust', 'Java', 'C++', 
  'C#', 'C', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'R', 'Julia', 'Scala', 'Haskell', 
  'Perl', 'SQL', 'HTML/CSS', 'Bash'
];

export default function App() {
  const [sourceCode, setSourceCode] = useState('');
  const [targetCode, setTargetCode] = useState('');
  const [sourceLang, setSourceLang] = useState('Python');
  const [targetLang, setTargetLang] = useState('JavaScript');
  const [isConverting, setIsConverting] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const sourceGutterRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLTextAreaElement>(null);
  const targetGutterRef = useRef<HTMLDivElement>(null);

  const handleSourceScroll = () => {
    if (sourceRef.current && sourceGutterRef.current) {
      sourceGutterRef.current.scrollTop = sourceRef.current.scrollTop;
    }
  };

  const handleTargetScroll = () => {
    if (targetRef.current && targetGutterRef.current) {
      targetGutterRef.current.scrollTop = targetRef.current.scrollTop;
    }
  };

  // Sync gutters on content change in case scroll height changes
  useEffect(() => {
    handleSourceScroll();
  }, [sourceCode]);

  useEffect(() => {
    handleTargetScroll();
  }, [targetCode]);

  const handleConvert = async () => {
    if (!sourceCode.trim()) return;
    setIsConverting(true);
    setError(null);
    try {
      const result = await convertCode(sourceCode, sourceLang, targetLang);
      if (result.startsWith('ERROR:')) {
        setError(result.replace('ERROR: ', ''));
        setTargetCode('');
      } else {
        setTargetCode(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsConverting(false);
    }
  };

  const handleExplain = async () => {
    if (!targetCode && !sourceCode) return;
    setIsExplaining(true);
    try {
      const codeToExplain = targetCode || sourceCode;
      const lang = targetCode ? targetLang : sourceLang;
      const result = await explainCode(codeToExplain, lang);
      setExplanation(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExplaining(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(targetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setSourceCode('');
    setTargetCode('');
    setExplanation('');
    setError(null);
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceCode(targetCode);
    setTargetCode(sourceCode);
  };

  const renderLineNumbers = (code: string) => {
    const lines = code.split('\n').length;
    return Array.from({ length: Math.max(lines, 1) }).map((_, i) => (
      <div key={i} className="leading-relaxed h-[20px]">{i + 1}</div>
    ));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] font-sans relative overflow-hidden flex flex-col selection:bg-[#D1FF00] selection:text-black">
      {/* Background Typographic Texture */}
      <div className="absolute -top-20 -left-10 text-[20rem] md:text-[24rem] font-black text-[#ffffff03] select-none pointer-events-none leading-none tracking-tighter z-0 uppercase">
        CODE
      </div>
      <div className="absolute -bottom-20 -right-10 text-[20rem] md:text-[24rem] font-black text-[#ffffff03] select-none pointer-events-none leading-none tracking-tighter z-0 uppercase">
        MORPH
      </div>

      {/* Header Section */}
      <header className="px-6 md:px-12 pt-10 pb-6 flex flex-col md:flex-row justify-between items-baseline z-10 gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-[0.4em] text-[#D1FF00] uppercase mb-1">Syntax Engine v2.4</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] uppercase">
            SYNTAX<br/>SHIFT
          </h1>
        </div>
        <nav className="flex gap-4 md:gap-8 text-[11px] font-bold tracking-widest uppercase items-center">
          <span className="text-[#D1FF00] border-b-2 border-[#D1FF00] pb-1 cursor-default">Translate</span>
          <span className="opacity-40 hover:opacity-100 cursor-pointer transition-opacity">Library</span>
          <span className="opacity-40 hover:opacity-100 cursor-pointer transition-opacity">Cloud API</span>
          <div className="w-[1px] h-4 bg-white/20" />
          <div className="flex items-center gap-2 opacity-70">
            <Monitor className="w-3 h-3" />
            <span className="font-mono">PRO_ENV</span>
          </div>
        </nav>
      </header>

      <main className="max-w-[1400px] mx-auto w-full p-6 md:px-12 md:pb-12 z-10 flex-1 flex flex-col">
        {/* Workspace Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-[#161616] p-4 border border-white/5">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <label className="absolute -top-2 left-3 px-1 bg-[#161616] font-mono text-[9px] uppercase text-[#D1FF00] z-10 font-bold">From</label>
              <select 
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full md:w-40 bg-transparent border border-white/10 py-2.5 px-4 font-mono text-xs appearance-none focus:outline-none focus:border-[#D1FF00] transition-all hover:bg-white/5"
              >
                {LANGUAGES.map(lang => <option key={lang} value={lang} className="bg-black">{lang}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
            </div>

            <button 
              onClick={swapLanguages}
              className="p-2.5 border border-white/10 hover:border-[#D1FF00] hover:text-[#D1FF00] transition-all active:scale-95 bg-white/5"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <div className="relative flex-1 md:flex-none">
              <label className="absolute -top-2 left-3 px-1 bg-[#161616] font-mono text-[9px] uppercase text-[#D1FF00] z-10 font-bold">To</label>
              <select 
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full md:w-40 bg-transparent border border-white/10 py-2.5 px-4 font-mono text-xs appearance-none focus:outline-none focus:border-[#D1FF00] transition-all hover:bg-white/5"
              >
                {LANGUAGES.map(lang => <option key={lang} value={lang} className="bg-black">{lang}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={clearAll}
              className="px-6 py-2.5 font-mono text-[10px] uppercase tracking-widest border border-white/10 hover:border-red-500 hover:text-red-500 transition-all flex items-center gap-2 group flex-1 md:flex-none"
            >
              <Trash2 className="w-3 h-3" />
              Reset
            </button>
            <div className="hidden md:block w-px h-8 bg-white/10" />
            <button 
              onClick={handleExplain}
              disabled={isExplaining || (!sourceCode && !targetCode)}
              className="px-6 py-2.5 font-mono text-[10px] uppercase font-bold tracking-widest border border-white/10 hover:border-[#D1FF00] hover:text-[#D1FF00] transition-all flex items-center gap-2 disabled:opacity-20 flex-1 md:flex-none"
            >
              {isExplaining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Info className="w-3 h-3" />}
              Explain
            </button>
          </div>
        </div>

        {/* Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 flex-1 min-h-0">
          {/* Input Pane */}
          <div className="bg-[#161616] border border-white/10 flex flex-col relative group transition-all focus-within:border-white/30 min-h-[400px]">
            <div className="flex justify-between items-center p-6 pb-2">
              <span className="bg-white text-black px-3 py-1 text-[10px] font-black uppercase tracking-tighter">Source</span>
              <span className="text-[11px] font-bold font-mono opacity-50 uppercase tracking-wider">{sourceLang} Buffer</span>
            </div>
            
            <div className="flex-1 flex min-h-0 overflow-hidden">
              <div 
                ref={sourceGutterRef}
                className="w-10 bg-white/5 border-r border-white/5 py-4 font-mono text-[10px] text-white/20 text-right pr-3 select-none overflow-hidden"
              >
                {renderLineNumbers(sourceCode)}
              </div>
              <textarea
                ref={sourceRef}
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                onScroll={handleSourceScroll}
                placeholder="// Input code sequence..."
                spellCheck={false}
                className="flex-1 p-4 font-mono text-sm leading-relaxed resize-none bg-transparent focus:outline-none placeholder:text-white/10 text-white/80 overflow-auto whitespace-pre"
              />
            </div>
          </div>

          {/* Action Column */}
          <div className="flex flex-col justify-center items-center gap-6 py-4">
            <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConvert}
              disabled={isConverting || !sourceCode.trim()}
              className="w-20 h-20 rounded-full bg-[#D1FF00] text-black flex items-center justify-center disabled:opacity-20 disabled:grayscale transition-all shadow-[0_0_20px_rgba(209,255,0,0.2)] z-20 group"
            >
              {isConverting ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <ArrowRightLeft className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
              )}
            </motion.button>
            <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* Output Pane */}
          <div className={`bg-[#161616] border flex flex-col transition-all min-h-[400px] ${targetCode ? 'border-[#D1FF00] shadow-[0_0_40px_rgba(209,255,0,0.05)]' : 'border-white/10'}`}>
            <div className="flex justify-between items-center p-6 pb-2">
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-tighter transition-all ${targetCode ? 'bg-[#D1FF00] text-black' : 'bg-white/10 text-white'}`}>Target</span>
              <div className="flex items-center gap-4">
                <span className={`text-[11px] font-bold font-mono uppercase tracking-wider transition-all ${targetCode ? 'text-[#D1FF00]' : 'opacity-50'}`}>{targetLang} Output</span>
                {targetCode && (
                  <button 
                    onClick={copyToClipboard}
                    className="hover:text-[#D1FF00] transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
            
            <div className="relative flex-1 flex min-h-0 overflow-hidden">
              <div 
                ref={targetGutterRef}
                className="w-10 bg-white/5 border-r border-white/5 py-4 font-mono text-[10px] text-white/20 text-right pr-3 select-none overflow-hidden"
              >
                {renderLineNumbers(targetCode)}
              </div>
              <textarea
                ref={targetRef}
                value={targetCode}
                onScroll={handleTargetScroll}
                readOnly
                placeholder="// Results will manifest here..."
                className="flex-1 p-4 font-mono text-sm leading-relaxed resize-none bg-transparent focus:outline-none placeholder:text-white/10 text-[#D1FF00]/90 overflow-auto whitespace-pre"
              />
              
              {isConverting && (
                <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="w-2 h-2 rounded-full bg-[#D1FF00]"
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-[0.5em] text-[#D1FF00]">Transcoding</span>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 p-6 bg-red-950/20 backdrop-blur-sm border border-red-500/50 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500">
                    <span className="text-xl">!</span>
                  </div>
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-red-500 mb-2">Internal Fault</p>
                  <p className="font-mono text-[11px] text-red-400 max-w-xs">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Explanation Area */}
        <AnimatePresence>
          {explanation && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="mt-8 p-10 bg-[#161616] border border-white/5 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 text-8xl font-black text-white/[0.02] select-none pointer-events-none">DATA</div>
              <h3 className="text-[#D1FF00] font-black uppercase text-2xl tracking-tighter mb-8 border-b border-white/10 pb-4">Structural Analysis Report</h3>
              <div className="font-mono text-sm leading-relaxed text-white/70 whitespace-pre-wrap max-w-4xl">
                {explanation}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Details */}
        <footer className="mt-12 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="grid grid-cols-2 md:flex gap-12 md:gap-24 w-full md:w-auto">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Latency</div>
              <div className="text-3xl font-black tracking-tighter">0.002s</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Protocol</div>
              <div className="text-3xl font-black tracking-tighter">WSS/G3</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Stability</div>
              <div className="text-3xl font-black tracking-tighter flex items-baseline gap-2">
                99.8<span className="text-xs text-[#D1FF00]">%</span>
              </div>
            </div>
          </div>
          
          <div className="text-right w-full md:w-auto">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Active Session</div>
            <div className="text-sm font-mono font-bold uppercase">PRO_NODE_SRV_{new Date().getFullYear()}</div>
            <div className="flex items-center justify-end gap-4 mt-4">
              <a href="#" className="opacity-40 hover:opacity-100 hover:text-[#D1FF00] transition-all"><Github className="w-5 h-5" /></a>
              <div className="h-px w-8 bg-white/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D1FF00]">v2.4.0-STABLE</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
