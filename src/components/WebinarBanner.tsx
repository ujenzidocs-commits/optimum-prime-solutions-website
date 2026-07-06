import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Video, ClipboardList } from 'lucide-react';

const WEBINAR_DATE = new Date('2026-07-07T15:00:00+03:00'); // 3pm EAT

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      over: false,
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-slate-800 border border-red-600/40 rounded-xl w-14 h-14 flex items-center justify-center shadow-lg">
        <span className="text-xl font-bold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function WebinarBanner() {
  const countdown = useCountdown(WEBINAR_DATE);

  return (
    <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-16 px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-800/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto">

        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            Free Live Webinar &nbsp;·&nbsp; 7 July 2026
          </span>
        </motion.div>

        {/* Two-column layout: poster + details */}
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Poster image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <img
              src="/webinar-poster.jpg"
              alt="TallyPrime 7.1 Webinar Invite"
              className="w-full max-w-sm rounded-2xl shadow-2xl shadow-black/50 border border-slate-700/40"
            />
          </motion.div>

          {/* Details + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <p className="text-red-400 text-sm font-semibold uppercase tracking-widest mb-2">
                Optimum Prime Solutions · Exclusive Client Session
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                What's New in
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                  TallyPrime 7.1
                </span>
              </h2>
              <p className="mt-3 text-slate-300 text-base leading-relaxed">
                A focused session for our valued clients — see the latest updates, live demo, and ask our team anything directly.
              </p>
            </div>

            {/* Countdown */}
            {!countdown.over ? (
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Starting in</p>
                <div className="flex gap-3">
                  <Digit value={countdown.days} label="Days" />
                  <div className="text-red-500 text-xl font-bold self-start mt-3">:</div>
                  <Digit value={countdown.hours} label="Hrs" />
                  <div className="text-red-500 text-xl font-bold self-start mt-3">:</div>
                  <Digit value={countdown.minutes} label="Mins" />
                  <div className="text-red-500 text-xl font-bold self-start mt-3">:</div>
                  <Digit value={countdown.seconds} label="Secs" />
                </div>
              </div>
            ) : (
              <p className="text-red-400 font-semibold">🔴 The webinar is live now — join immediately!</p>
            )}

            {/* Event details */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">📅 <span><strong className="text-white">Tuesday, 7th July 2026</strong></span></div>
              <div className="flex items-center gap-2">🕒 <span>3:00 PM – 4:00 PM (East Africa Time)</span></div>
              <div className="flex items-center gap-2">📍 <span>Online via Google Meet</span></div>
              <div className="flex items-center gap-2">💰 <span className="text-green-400 font-semibold">Free for all our clients</span></div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/webinar"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-500/50 hover:scale-105 text-sm"
              >
                <ClipboardList className="w-4 h-4" />
                Register Now — It's Free
              </Link>
              <a
                href="https://meet.google.com/bsj-hpbp-avz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-red-500/50 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-300 hover:scale-105 text-sm"
              >
                <Video className="w-4 h-4" />
                Join Directly
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>

            <p className="text-slate-500 text-xs">
              🔒 Register to receive the join link on WhatsApp automatically. You can also join directly without registering.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
