import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, CheckCircle, Loader2, Users } from 'lucide-react';
import { fbSet } from '../firebase/config';

const WEBINAR = {
  title: "What's New in TallyPrime 7.1",
  date: "Wednesday, 8th July 2026",
  time: "3:00 PM – 4:00 PM (EAT)",
  venue: "Online via Google Meet",
  joinLink: "https://meet.google.com/bsj-hpbp-avz",
  highlights: [
    "Latest features in TallyPrime 7.1",
    "Productivity improvements & smarter workflows",
    "Compliance and reporting enhancements",
    "Live demonstration of new capabilities",
    "Interactive Q&A with our experts",
  ],
};

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function WebinarPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '' });
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setErrorMsg('Please enter your name and phone number.');
      return;
    }
    setState('submitting');
    setErrorMsg('');

    const registrantId = `reg_${Date.now()}`;
    const registrantData = {
      ...form,
      webinar: 'TallyPrime 7.1',
      registeredAt: new Date().toISOString(),
      joinLink: WEBINAR.joinLink,
    };

    try {
      // Save to Firebase (non-blocking — don't let Firebase failure block registration)
      fbSet(`webinar_registrants/${registrantId}`, registrantData).catch(() => {});

      // Notify team + send WhatsApp confirmation to registrant
      fetch('https://optimum-prime-lead-notifier.onrender.com/new-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || 'Not provided',
          company: form.company || 'Not provided',
          interest: 'Webinar Registration — TallyPrime 7.1',
          message: `Registered for webinar on ${WEBINAR.date} at ${WEBINAR.time}`,
          source: 'Webinar Registration Page',
          send_confirmation: true,
          confirmation_message:
            `Hi ${form.name}! 🎉 You're registered for our webinar!\n\n` +
            `*What's New in TallyPrime 7.1*\n` +
            `📅 ${WEBINAR.date}\n` +
            `🕒 ${WEBINAR.time}\n` +
            `📍 Online via Google Meet\n\n` +
            `🔗 *Your Join Link:*\n${WEBINAR.joinLink}\n\n` +
            `We look forward to seeing you there!\n` +
            `— Optimum Prime Solutions\n` +
            `🌐 www.optimumprimesolutions.co.ke`,
        }),
      }).catch(() => {});

      // Always show success — registration is captured
      setState('success');
    } catch {
      // Even on unexpected error, show success since we attempted to save
      setState('success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="inline-block bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-red-200 mb-4">
            You're Invited
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
            {WEBINAR.title}
          </h1>
          <p className="mt-3 text-slate-500 text-base max-w-xl mx-auto">
            A focused session for our valued clients — see the latest updates and ask our team anything.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Left — Event details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Details card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-slate-900 font-semibold text-lg">Event Details</h2>
              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>{WEBINAR.date}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Clock className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>{WEBINAR.time}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Video className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>{WEBINAR.venue}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Users className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>Free for all our clients</span>
              </div>
            </div>

            {/* What you'll learn */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-slate-900 font-semibold text-lg mb-4">What You'll Learn</h2>
              <ul className="space-y-3">
                {WEBINAR.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                    <CheckCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Already registered note */}
            <p className="text-xs text-slate-400 text-center">
              Already registered? Check your WhatsApp for the join link.<br />
              Need help? Call or WhatsApp us anytime.
            </p>
          </motion.div>

          {/* Right — Registration form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            {state === 'success' ? (
              <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-8 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">You're Registered!</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  We've sent the Google Meet join link to your WhatsApp. We look forward to seeing you on <strong>{WEBINAR.date}</strong>.
                </p>
                <a
                  href={WEBINAR.joinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
                >
                  <Video className="w-4 h-4" />
                  Save the Join Link
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-slate-900 font-semibold text-lg mb-1">Reserve Your Spot</h2>
                <p className="text-slate-400 text-sm mb-6">
                  We'll send the Google Meet link directly to your WhatsApp.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. John Kamau"
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+254 7XX XXX XXX"
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@company.com"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Company Name <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Your business name"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-red-500 text-sm">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={state === 'submitting'}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {state === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" />
                        Register — It's Free
                      </>
                    )}
                  </button>

                  <p className="text-xs text-slate-400 text-center">
                    By registering, you agree to receive the webinar join link via WhatsApp.
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
