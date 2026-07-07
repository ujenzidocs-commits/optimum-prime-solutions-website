import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { useSite } from '../context/SiteContext';
import { useOnlineStatus } from './OfflineBanner';
import { validateForm, getFieldError, type FormData, type ValidationError } from '../utils/validation';
import { fbSet } from '../firebase/config';
import type { Lead } from '../data/siteData';

const TIME_SLOTS = [
  '8:00 AM – 9:00 AM',
  '9:00 AM – 10:00 AM',
  '10:00 AM – 11:00 AM',
  '11:00 AM – 12:00 PM',
  '12:00 PM – 1:00 PM',
  '1:00 PM – 2:00 PM',
  '2:00 PM – 3:00 PM',
  '3:00 PM – 4:00 PM',
  '4:00 PM – 5:00 PM',
];

const BUSINESS_TYPES = [
  'Retail',
  'Wholesale & Distribution',
  'Manufacturing',
  'Import & Export',
  'Services',
  'Hospitality & Restaurant',
  'Construction & Real Estate',
  'Healthcare & Pharmacy',
  'Education',
  'NGO / Non-Profit',
  'Other',
];

const SOFTWARE_OPTIONS = [
  'Microsoft Excel / Manual records',
  'QuickBooks',
  'Sage',
  'Pastel',
  'Odoo',
  'SAP',
  'Wave',
  'Zoho Books',
  'Another TallyPrime version',
  'No accounting software yet',
  'Other',
];

/** Build a Google Calendar "Add to Calendar" link for a 1-hour demo slot. */
function buildCalendarLink(name: string, company: string, date: string, timeSlot: string): string {
  if (!date || !timeSlot) return '';
  try {
    const startStr = timeSlot.split('–')[0].trim();
    const [timePart, meridiem] = startStr.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const [year, month, day] = date.split('-').map(Number);
    const startUTC = new Date(Date.UTC(year, month - 1, day, hours - 3, minutes, 0));
    const endUTC   = new Date(startUTC.getTime() + 60 * 60 * 1000);

    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const title = encodeURIComponent(`TallyPrime Demo — ${company || name}`);
    const details = encodeURIComponent(
      `Free 1-hour TallyPrime demo with Optimum Prime Solutions.\nClient: ${name}${company ? ` | ${company}` : ''}`
    );
    const location = encodeURIComponent('Google Meet — link to be shared by Optimum Prime Solutions');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(startUTC)}/${fmt(endUTC)}&details=${details}&location=${location}`;
  } catch {
    return '';
  }
}

const inputClass = (error?: string) =>
  `w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${
    error
      ? 'border-red-400 bg-red-50 text-slate-950 placeholder:text-red-400'
      : 'border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
  }`;

const selectClass = (error?: string) =>
  `w-full rounded-3xl border px-4 py-3 text-sm outline-none transition appearance-none ${
    error
      ? 'border-red-400 bg-red-50 text-slate-950'
      : 'border-slate-200 bg-slate-50 text-slate-950 focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
  }`;

export default function Contact() {
  const { data, update } = useSite();
  const c = data.contact;
  const isOnline = useOnlineStatus();
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submittedForm, setSubmittedForm] = useState<FormData | null>(null);
  const [form, setForm] = useState<FormData>({
    name: '',
    company: '',
    phone: '',
    email: '',
    businessType: '',
    demoDate: '',
    demoTime: '',
    currentSoftware: '',
    message: '',
  });

  const set = (k: string, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    // Clear the error for this field as user types
    setErrors(prev => prev.filter(e => e.field !== k));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setServerError(null);

    const validation = validateForm(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Scroll to first error
      const firstErrorField = validation.errors[0]?.field;
      if (firstErrorField) {
        document.getElementById(`field-${firstErrorField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!isOnline) {
      setServerError('You are offline. Please check your internet connection before submitting.');
      return;
    }

    setLoading(true);

    try {
      const lead: Lead = {
        ...form,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'New',
      };

      notifyLeadViaWhatsApp(form).catch(() => {/* silent fail */});

      await fbSet(`leads/${lead.id}`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        businessType: form.businessType,
        demoDate: form.demoDate,
        demoTime: form.demoTime,
        currentSoftware: form.currentSoftware,
        message: form.message,
        createdAt: lead.createdAt,
        status: 'New',
      });

      update({ ...data, leads: [...data.leads, lead] });
      await sendEmailNotification(form);
      setSubmittedForm({ ...form });
      setOk(true);
      setForm({
        name: '',
        company: '',
        phone: '',
        email: '',
        businessType: '',
        demoDate: '',
        demoTime: '',
        currentSoftware: '',
        message: '',
      });
      setTimeout(() => setOk(false), 8000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit form. Please try again.';
      setServerError(message);
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const notifyLeadViaWhatsApp = async (formData: FormData) => {
    try {
      await fetch('https://optimum-prime-lead-notifier.onrender.com/new-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          company: formData.company,
          interest: formData.businessType || 'TallyPrime / General Enquiry',
          message: formData.message,
          demoDate: formData.demoDate || '',
          demoTime: formData.demoTime || '',
          source: 'Contact Form',
        }),
      });
    } catch {
      // WhatsApp notification is best-effort
    }
  };

  const sendEmailNotification = async (formData: FormData) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.email,
          subject: 'Demo Request Received - Optimum Prime Solutions',
          html: `
            <h2>Thank you for your demo request!</h2>
            <p>Hi ${formData.name},</p>
            <p>We've received your request for a TallyPrime demo. Our team will contact you within 24 hours.</p>
            <ul>
              <li>Company: ${formData.company || 'Not provided'}</li>
              <li>Phone: ${formData.phone}</li>
              <li>Preferred Date: ${formData.demoDate || 'Not specified'}</li>
              <li>Preferred Time: ${formData.demoTime || 'Not specified'}</li>
            </ul>
            <p>Best regards,<br/>Optimum Prime Solutions Team</p>
          `,
        }),
      });
      if (!response.ok) console.warn('Email notification failed');
    } catch (error) {
      console.warn('Could not send email notification:', error);
    }
  };

  const info = [
    { icon: MapPin, title: 'Visit Us', lines: [c.location] },
    { icon: Phone, title: 'Call Us', lines: c.phones },
    { icon: Mail, title: 'Email Us', lines: c.emails },
    { icon: Clock, title: 'Hours', lines: c.workingHours },
  ];

  return (
    <section id="contact" className="relative overflow-hidden bg-slate-50 py-24">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sky-200/40 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          {/* Left panel */}
          <div className="lg:col-span-2 space-y-6 overflow-hidden rounded-[2rem] bg-white border border-slate-200 p-8 shadow-xl text-slate-950">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                Contact
              </span>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Request a demo with the team that helps businesses grow faster.
                </h2>
                <p className="mt-4 text-base text-slate-600">
                  Complete the form and a specialist will contact you with a custom TallyPrime plan for your organization.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {info.map(({ icon: Icon, title, lines }) => (
                <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex items-center gap-3 text-slate-950">
                    <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{title}</p>
                      {lines.map((line) => (
                        <p key={line} className="mt-1 text-sm text-slate-600">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={`https://wa.me/${c.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-[#25D366]/30 transition hover:bg-[#1DA851]"
            >
              <WhatsAppIcon className="h-4 w-4 text-white" /> Chat on WhatsApp
            </a>
          </div>

          {/* Right panel — form */}
          <div className="lg:col-span-3">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl text-slate-950">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Demo request</p>
                  <h3 className="mt-3 text-2xl font-bold text-slate-950">Let's build your next TallyPrime solution.</h3>
                </div>
                <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${isOnline ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                  {isOnline ? '● Online' : '● Offline'}
                </div>
              </div>

              {serverError && (
                <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              {ok ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 rounded-[1.5rem] border border-green-100 bg-green-50 p-10 text-center"
                >
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h4 className="mt-4 text-xl font-semibold text-slate-950">Request submitted!</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Our team will get back to you within 24 hours. Check your WhatsApp for a confirmation message.
                  </p>
                  {submittedForm?.demoDate && submittedForm?.demoTime && (
                    <a
                      href={buildCalendarLink(submittedForm.name, submittedForm.company, submittedForm.demoDate, submittedForm.demoTime)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-700 transition"
                    >
                      📅 Add to Google Calendar
                    </a>
                  )}
                </motion.div>
              ) : (
                <form onSubmit={submit} noValidate className="mt-8 grid gap-5">
                  {/* Row 1: Name + Company */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div id="field-name">
                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                        Full name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => set('name', e.target.value)}
                        placeholder="e.g. Jane Wanjiru"
                        className={inputClass(getFieldError(errors, 'name'))}
                      />
                      {getFieldError(errors, 'name') && (
                        <p className="mt-1.5 text-xs text-red-500">{getFieldError(errors, 'name')}</p>
                      )}
                    </div>

                    <div id="field-company">
                      <label className="block mb-2 text-sm font-semibold text-slate-700">Company name</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => set('company', e.target.value)}
                        placeholder="e.g. Nairobi Traders Ltd"
                        className={inputClass(getFieldError(errors, 'company'))}
                      />
                      {getFieldError(errors, 'company') && (
                        <p className="mt-1.5 text-xs text-red-500">{getFieldError(errors, 'company')}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone + Email */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div id="field-phone">
                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => set('phone', e.target.value)}
                        placeholder="+254 700 000 000"
                        className={inputClass(getFieldError(errors, 'phone'))}
                      />
                      {getFieldError(errors, 'phone') && (
                        <p className="mt-1.5 text-xs text-red-500">{getFieldError(errors, 'phone')}</p>
                      )}
                    </div>

                    <div id="field-email">
                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                        placeholder="jane@company.co.ke"
                        className={inputClass(getFieldError(errors, 'email'))}
                      />
                      {getFieldError(errors, 'email') && (
                        <p className="mt-1.5 text-xs text-red-500">{getFieldError(errors, 'email')}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Business type + Current software (dropdowns) */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div id="field-businessType">
                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                        Business type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.businessType}
                        onChange={(e) => set('businessType', e.target.value)}
                        className={selectClass(getFieldError(errors, 'businessType'))}
                      >
                        <option value="">Select business type</option>
                        {BUSINESS_TYPES.map((bt) => (
                          <option key={bt} value={bt}>{bt}</option>
                        ))}
                      </select>
                      {getFieldError(errors, 'businessType') && (
                        <p className="mt-1.5 text-xs text-red-500">{getFieldError(errors, 'businessType')}</p>
                      )}
                    </div>

                    <div id="field-currentSoftware">
                      <label className="block mb-2 text-sm font-semibold text-slate-700">Current software</label>
                      <select
                        value={form.currentSoftware}
                        onChange={(e) => set('currentSoftware', e.target.value)}
                        className={selectClass(getFieldError(errors, 'currentSoftware'))}
                      >
                        <option value="">Select current software</option>
                        {SOFTWARE_OPTIONS.map((sw) => (
                          <option key={sw} value={sw}>{sw}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Preferred date + Preferred time */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div id="field-demoDate">
                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                        Preferred date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={form.demoDate}
                        onChange={(e) => set('demoDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={inputClass(getFieldError(errors, 'demoDate'))}
                      />
                      {getFieldError(errors, 'demoDate') && (
                        <p className="mt-1.5 text-xs text-red-500">{getFieldError(errors, 'demoDate')}</p>
                      )}
                    </div>

                    <div id="field-demoTime">
                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                        Preferred time <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.demoTime}
                        onChange={(e) => set('demoTime', e.target.value)}
                        className={selectClass(getFieldError(errors, 'demoTime'))}
                      >
                        <option value="">Select a time slot</option>
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      {getFieldError(errors, 'demoTime') && (
                        <p className="mt-1.5 text-xs text-red-500">{getFieldError(errors, 'demoTime')}</p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div id="field-message">
                    <label className="block mb-2 text-sm font-semibold text-slate-700">Message (optional)</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => set('message', e.target.value)}
                      rows={4}
                      placeholder="Tell us about your business needs, number of users, or any specific questions..."
                      className={`${inputClass(getFieldError(errors, 'message'))} resize-none`}
                    />
                    {getFieldError(errors, 'message') && (
                      <p className="mt-1.5 text-xs text-red-500">{getFieldError(errors, 'message')}</p>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">Fields marked <span className="text-red-500">*</span> are required.</p>

                  <button
                    type="submit"
                    disabled={loading || !isOnline}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
