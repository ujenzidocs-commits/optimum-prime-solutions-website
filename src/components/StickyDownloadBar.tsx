import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, ArrowRight } from 'lucide-react';
import tallyNewLogo from '../Tally Solutions new logo.png';

export default function StickyDownloadBar() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (dismissed) return;
      setShow(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          className="fixed top-0 inset-x-0 z-[60] border-b border-blue-700 bg-blue-700 shadow-xl"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4 py-3 text-sm text-white">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white flex-shrink-0 shadow-lg backdrop-blur-sm border border-white/20">
                  <Download className="h-6 w-6" />
                </div>
                <div className="inline-flex items-center gap-4">
                  <div className="flex items-center justify-center bg-white rounded-2xl p-2 shadow-lg border border-white/20 flex-shrink-0">
                    <img src={tallyNewLogo} alt="Tally Solutions" className="h-16 w-auto max-h-16" />
                  </div>
                  <span className="font-bold text-white text-sm leading-tight">Try TallyPrime free — Education Mode, no license needed.</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://tallysolutions.com/ssa/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Download Now
                  <ArrowRight className="h-3 w-3" />
                </a>
                <button onClick={() => setDismissed(true)} className="rounded-full p-2 text-white transition hover:text-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
