import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TallyPromoPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show popup after 1.5 seconds, only once per session
    const dismissed = sessionStorage.getItem('tally71_popup_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('tally71_popup_dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red top bar */}
        <div className="h-2 w-full bg-red-700" />

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors text-2xl font-bold leading-none"
          aria-label="Close"
        >
          ×
        </button>

        <div className="px-8 py-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 mb-4">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Now Available</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-1">
            TallyPrime 7.1 is Here! 🚀
          </h2>
          <p className="text-sm text-slate-500 mb-5">
            The next generation of business management software — officially launched.
          </p>

          {/* Feature highlights */}
          <ul className="space-y-2 mb-6">
            {[
              '🤖 AI-powered Docs by Ira — automate data entry',
              '🧾 8 new professional invoice templates',
              '🏦 Connected banking with major Kenyan banks',
              '📊 Scheduled auto backup — never lose your data',
              '✅ KRA eTIMS e-invoicing compliance',
              '💬 Interactive Q&A — join our free webinar',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/webinar"
              onClick={dismiss}
              className="flex-1 rounded-xl bg-red-700 px-5 py-3 text-center text-sm font-bold text-white hover:bg-red-800 transition-colors"
            >
              🎓 Join Our Free Webinar
            </Link>
            <Link
              to="/products"
              onClick={dismiss}
              className="flex-1 rounded-xl border-2 border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:border-red-700 hover:text-red-700 transition-colors"
            >
              Explore TallyPrime 7.1 →
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            As your certified TallyPrime partner, we handle your upgrade seamlessly.
          </p>
        </div>

        {/* Red bottom bar */}
        <div className="h-2 w-full bg-red-700" />
      </div>
    </div>
  );
}
