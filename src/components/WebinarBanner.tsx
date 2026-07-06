import { motion } from 'framer-motion';
import { Calendar, Clock, Video, ExternalLink, ClipboardList } from 'lucide-react';

const WEBINAR = {
  title: "Discover What's New in TallyPrime 7.1",
  subtitle: "Exclusive Live Webinar",
  date: "Tuesday, 7th July 2026",
  time: "3:00 PM – 4:00 PM (EAT)",
  venue: "Online via Google Meet",
  rsvpLink: "https://forms.gle/gBfvbDyCoBkbQEhRA",
  joinLink: "https://meet.google.com/bsj-hpbp-avz",
  highlights: [
    "Latest features in TallyPrime 7.1",
    "Productivity improvements & smarter workflows",
    "Compliance and reporting enhancements",
    "Live demonstration of new capabilities",
    "Interactive Q&A with our experts",
  ],
};

export default function WebinarBanner() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4 overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-4"
        >
          <span className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Live Webinar — 7 July 2026
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-10"
        >
          <p className="text-red-400 font-semibold text-sm uppercase tracking-widest mb-2">
            {WEBINAR.subtitle}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            🚀 {WEBINAR.title}
          </h2>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-base leading-relaxed">
            Whether you're a business owner, accountant, finance professional, or current Tally user —
            this session will show you how TallyPrime 7.1 helps you work faster, stay compliant, and
            gain better control of your operations.
          </p>
        </motion.div>

        {/* Details + Highlights grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Event details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-white font-semibold text-lg mb-2">Event Details</h3>
            <div className="flex items-center gap-3 text-slate-300">
              <Calendar className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{WEBINAR.date}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Clock className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{WEBINAR.time}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Video className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{WEBINAR.venue}</span>
            </div>
          </motion.div>

          {/* What you'll learn */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6"
          >
            <h3 className="text-white font-semibold text-lg mb-3">What You'll Learn</h3>
            <ul className="space-y-2">
              {WEBINAR.highlights.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href={WEBINAR.joinLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-red-600/50"
          >
            <Video className="w-5 h-5" />
            Join the Webinar
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>
          <a
            href={WEBINAR.rsvpLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200"
          >
            <ClipboardList className="w-5 h-5" />
            RSVP (Optional)
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>
        </motion.div>

        <p className="text-center text-slate-500 text-xs mt-4">
          RSVP helps us estimate attendance and prepare for the session. You're welcome to join even without registering.
        </p>
      </div>
    </section>
  );
}
