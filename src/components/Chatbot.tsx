import { X, Send, Bot, User, Minimize2, Sparkles, RotateCcw } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import WhatsAppButton from './WhatsAppButton';
import { useSite } from '../context/SiteContext';
import { motion, AnimatePresence } from 'framer-motion';
import DemoRequestModal from './DemoRequestModal';
import KraLogo from './KraLogo';
import { getChatGPTReply, type ChatMessage } from '../utils/chatgpt';
import type { SiteData } from '../data/siteData';

interface Msg {
  id: string;
  role: 'bot' | 'user';
  text: string;
  time: string;
  action?: 'demo' | 'contact';
  badge?: 'kra';
}

const getTime = () =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

function getBotResponse(q: string, d: SiteData): Msg {
  const lc = q.toLowerCase();
  const time = getTime();

  const responses: Array<{ pattern: RegExp; message: string; action?: Msg['action']; badge?: Msg['badge']; }> = [
    {
      pattern: /^(hi|hello|hey|jambo|habari|sasa|hallo)/,
      message: `Hello! 👋 Welcome to ${d.company.name}. Great to meet you!\n\n**I can help with:**\n✦ KRA & eTIMS compliance\n✦ Payroll & PAYE setup\n✦ Banking integrations\n✦ Inventory management\n✦ Collections & receivables\n✦ Audit readiness\n✦ System migration\n\n**What's your biggest challenge right now?** 🤔\n\nJust type or pick from the quick links below!`,
    },
    {
      pattern: /payroll|paye|salary|nhif|nssf|housing|employee/,
      message: `💰 **Payroll Management**\n\nAutomate payroll processing:\n✓ Auto salary calculation\n✓ PAYE withholding\n✓ NHIF deductions\n✓ NSSF contributions\n✓ Housing Levy (3%)\n✓ Leave tracking\n✓ Loan deductions\n✓ Advance settlements\n\n📊 **Reports:**\n• Individual payslips\n• Bank transfer lists\n• PAYE schedules\n• NHIF/NSSF remittance\n\n💡 **Reality check:** Manual payroll costs 5-10 hours monthly + errors. We automate it in minutes!\n\n**How many employees do you currently manage payroll for?** 👥`,
    },
    {
      pattern: /inventory|stock|warehouse|product|sku|barcode/,
      message: `📦 **Inventory Management**\n\nReal-time stock control:\n✓ Multi-location warehousing\n✓ Batch & serial tracking\n✓ Expiry date management\n✓ Barcode scanning\n✓ Auto reorder alerts\n✓ Stock transfers\n✓ Consignment tracking\n\n🎯 **Features:**\n• Safety stock calculations\n• FIFO/LIFO valuation\n• Stock loss reporting\n• Inventory cycles\n• Cost analysis\n\n⚠️ **Problem we solve:** Stock-outs lose sales, overstock ties up cash. We balance it perfectly!\n\n**Are you currently tracking inventory across multiple locations, or just one main warehouse?** 📍`,
    },
    {
      pattern: /price|cost|how much|silver|gold|edition|investment|budget/,
      message: `💰 **Tally Prime Pricing:**\n\n${d.products.map((p) => `• **${p.name} ${p.edition}**: ${p.price} (${p.period})\n  ${p.features[0]}`).join('\n\n')}\n\n✓ Volume discounts available\n✓ Custom TDL from KES 25,000\n✓ Training included\n\n**To help me recommend the best edition for you, how many users will need access to the system?**`,
    },
    {
      pattern: /service|what.*offer|provide|do you/,
      message: `🚀 **Our Services:**\n\n${d.services.slice(0, 8).map((s, i) => `${i+1}. **${s.title}**\n   ${s.desc}`).join('\n\n')}\n\n**Which of these services aligns most closely with your current business goals?**`,
    },
    {
      pattern: /kra|etims|e-filing|tax|vat|compliance|excise|cdf|pin|filing/,
      message: `📋 **KRA & eTIMS Compliance**\n\nWe configure 100% KRA compliance:\n✓ VAT computation & e-filing\n✓ PAYE auto-calculation\n✓ Income tax reporting\n✓ eTIMS integration\n✓ iTax e-Filing\n✓ Excise duty tracking\n✓ Certificate of Tax Compliance\n✓ Deadline alerts\n\n🎯 **Here's the thing:** Most businesses lose money to missed deadlines & errors. We automate it all!\n\n**Are you currently using eTIMS, or are you looking for help setting it up for the first time?** 💭`,
      badge: 'kra',
    },
    {
      pattern: /payroll|salary|paye|nhif|nssf|housing|staff|employee|wage|deduction|leave|advance/,
      message: `💰 **Payroll Management**\n\nAutomate payroll processing:\n✓ Auto salary calculation\n✓ PAYE withholding\n✓ NHIF deductions\n✓ NSSF contributions\n✓ Housing Levy (3%)\n✓ Leave tracking\n✓ Loan deductions\n✓ Advance settlements\n\n📊 **Reports:**\n• Individual payslips\n• Bank transfer lists\n• PAYE schedules\n• NHIF/NSSF remittance\n\nFully Kenya compliant!`,
    },
    {
      pattern: /bank|payment|gateway|mpesa|reconcil|cash|cheque|transfer|account/,
      message: `🏦 **Banking & Payment Integration**\n\nSeamless banking workflows:\n✓ Bank reconciliation automation\n✓ M-Pesa payment tracking\n✓ Cheque management\n✓ Payment gateway integration\n✓ Cash flow forecasting\n✓ Multi-bank account support\n✓ Real-time bank feeds\n\n💳 **Supported Banks:**\n• KCB, Equity, I&M, Absa, Standard Chartered\n• M-Pesa for business\n• PayPal & Stripe for e-commerce\n\nSetup takes < 1 hour!`,
    },
    {
      pattern: /collections|receivable|invoice|credit|customer|debtors|aging|recovery|dso|cash flow/,
      message: `📲 **Collections & Receivables**\n\nMaximize cash collection:\n✓ Credit limit management\n✓ Invoice aging reports\n✓ Dunning automation\n✓ Payment reminders\n✓ Customer statements\n✓ Collection tracking\n✓ Bad debt provisioning\n\n📈 **Improve Cash Flow:**\n• Automated follow-up\n• Credit scoring\n• Early payment discounts\n• Late payment penalties\n\n🎯 **Impact:** Most businesses see 30-40% faster payments after setup.\n\n**How many days does it take to collect from customers?** ⏳`,
    },
    {
      pattern: /inventor|stock|warehouse|product|item|sku|batch|expiry|reorder|location|distribution/,
      message: `📦 **Inventory Management**\n\nReal-time stock control:\n✓ Multi-location warehousing\n✓ Batch & serial tracking\n✓ Expiry date management\n✓ Barcode scanning\n✓ Auto reorder alerts\n✓ Stock transfers\n✓ Consignment tracking\n\n🎯 **Features:**\n• Safety stock calculations\n• FIFO/LIFO valuation\n• Stock loss reporting\n• Inventory cycles\n• Cost analysis\n\nWorks for retail, wholesale, manufacturing & F&B!`,
    },
    {
      pattern: /branch|multi-branch|distributed|location|site|head office|regional|chain|franchise/,
      message: `🏢 **Multi-Branch Accounting**\n\nCentralized control, local autonomy:\n✓ Branch-wise P&L\n✓ Consolidated reporting\n✓ Inter-branch transfers\n✓ Central bank account\n✓ Shared master data\n✓ Branch expense tracking\n✓ Performance comparison\n\n📊 **Reports:**\n• Financial statements by branch\n• Variance analysis\n• Sales by location\n• Expense allocation\n\nPerfect for retail chains, service providers & franchises!`,
    },
    {
      pattern: /migrat|upgrade|import|data|legacy|transfer|move from|switch|convert|import data/,
      message: `🔄 **System Migration & Data Transfer**\n\nSmooth transition to Tally Prime:\n✓ Data import from legacy systems\n✓ Opening balance migration\n✓ Customer/supplier mapping\n✓ Inventory balance transfer\n✓ Historical data archival\n✓ Zero data loss guarantee\n✓ Parallel run support\n\n⚙️ **Our Process:**\n1. Data audit & validation\n2. Mapping & transformation\n3. Test migration\n4. Live cutover\n5. Post-migration support\n\n🎯 Typically 2-4 weeks with training!`,
    },
    {
      pattern: /manufactur|production|bom|bill of material|process|wip|work in progress|cost|labor|batch|waste/,
      message: `🏭 **Manufacturing Solutions**\n\nStreamline production:\n✓ Bill of Materials (BOM)\n✓ Production orders\n✓ Work-in-progress tracking\n✓ Job costing\n✓ Quality control\n✓ Labor allocation\n✓ Batch tracking\n✓ Waste management\n\n📊 **Analysis:**\n• Cost per unit\n• Production efficiency\n• Material usage variance\n• Timeline tracking\n\nGreat for food, pharma, textiles & heavy manufacturing!`,
    },
    {
      pattern: /audit|audit trail|internal control|risk|fraud|sox|sarbanes|compliance check|regulatory/,
      message: `🔐 **Audit Readiness & Controls**\n\nMeet regulatory requirements:\n✓ Complete audit trail\n✓ User access controls\n✓ Approval workflows\n✓ Exception reporting\n✓ Document retention\n✓ Balance sheet reconciliation\n✓ Fraud detection\n\n📋 **For Auditors:**\n• General ledger with drill-down\n• Journal entries with approvals\n• User activity logs\n• System snapshots\n• Compliance checklist\n\nPrepare for audits in hours, not weeks!`,
    },
    {
      pattern: /train|training|staff|onboard|workshop|cert|skill|learn|course|education/,
      message: `👥 **Training & Onboarding**\n\nBuild capability in your team:\n✓ On-site training sessions\n✓ Remote workshops\n✓ One-on-one coaching\n✓ Video tutorials\n✓ User manuals\n✓ Role-based training\n✓ Certification programs\n\n📚 **Topics:**\n• Daily operations\n• Reporting & analysis\n• KRA compliance\n• Banking & collections\n• Inventory management\n• Advanced features\n\nTraining included in all packages!`,
    },
    {
      pattern: /remote|cloud|access|online|work from|anywhere|mobile|app|vpn/,
      message: `☁️ **Remote Access & Cloud Hosting**\n\nAccess Tally Prime anywhere, anytime:\n✓ Secure cloud infrastructure\n✓ Multi-device support\n✓ VPN integration\n✓ Mobile app access\n✓ Automatic hourly backups\n✓ Disaster recovery\n✓ ISO 27001 compliance\n\n🔒 **Security:**\n• 256-bit encryption\n• Multi-factor authentication\n• Regular security audits\n\nPerfect for remote teams & hybrid work!`,
    },
    {
      pattern: /integrat|api|connector|plugin|third-party|sync|webhook|automat|pos|crm|erp|hr/,
      message: `🔗 **Integrations & API Solutions**\n\nConnect Tally Prime with your ecosystem:\n✓ POS system integration\n✓ E-commerce platform sync\n✓ CRM integration\n✓ HR software link\n✓ Email & document automation\n✓ Custom API development\n✓ Workflow automation\n\n💼 **Common Integrations:**\n• Shopify & WooCommerce\n• LinkedIn & ATS\n• Google Workspace\n• Slack notifications\n• Power BI dashboards\n\nCustom TDL & API from KES 25,000!`,
    },
    {
      pattern: /report|dashboard|analysis|insight|forecast|budget|projection|kpi|metric/,
      message: `📊 **Advanced Reporting & Analytics**\n\nTurn data into decisions:\n✓ Real-time dashboards\n✓ Financial reports\n✓ Budget vs. actual\n✓ Cash flow forecast\n✓ KPI tracking\n✓ Variance analysis\n✓ Custom reports\n✓ Data export (Excel/PDF)\n\n🎯 **Key Reports:**\n• P&L statements\n• Balance sheets\n• Cash flow analysis\n• Profitability by product\n• Customer/supplier analysis\n• Tax reports\n\nMake data-driven decisions daily!`,
    },
    {
      pattern: /demo|book|schedule|meeting|call|consultation|appointment/,
      message: `📅 **Book a Demo**\n\nLet's show you how Tally Prime can transform your business!\n\n✓ 30-minute personalized demo\n✓ Customized to your industry\n✓ Live Q&A session\n✓ No obligation\n\n**Ready to see it in action?** 🚀`,
      action: 'demo',
    },
  ];

  for (const r of responses) {
    if (r.pattern.test(lc)) {
      return {
        id: Date.now().toString(),
        role: 'bot',
        text: r.message,
        time,
        action: r.action,
        badge: r.badge,
      };
    }
  }

  return {
    id: Date.now().toString(),
    role: 'bot',
    text: `I appreciate your question! 🤔\n\nWhile I'm still learning, here's what I can help with:\n\n✓ **KRA & eTIMS compliance** - Stay 100% tax compliant\n✓ **Payroll automation** - Manage salaries, PAYE, NHIF, NSSF\n✓ **Inventory control** - Real-time stock tracking across locations\n✓ **Banking integrations** - Reconcile accounts automatically\n✓ **Collections** - Speed up customer payments\n✓ **Manufacturing** - Bill of Materials, production tracking\n✓ **System migration** - Move from legacy systems safely\n\n**Can you tell me more about your specific challenge?** Or feel free to **book a demo** with our team! 😊`,
    time,
  };
}

export default function Chatbot() {
  const { data } = useSite();
  const quickLinks = [
    'Request a demo',
    'Pricing & editions',
    'KRA compliance',
    'Payroll setup',
    'Banking integrations',
    'Inventory management',
    'Branch accounting',
    'System migration',
  ];
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [conversationContext, setConversationContext] = useState<Record<string, string>>({});
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: '0',
      role: 'bot',
      text: `👋 Hello there! I'm **Aurora**, your AI assistant from Optimum Prime Solutions. I'm designed to help you navigate our services and find the best solutions for your business.\n\nTo get started, tell me a bit about what you're looking for. For example, you could ask about:\n\n✨ **KRA & eTIMS compliance**\n💼 **Payroll management**\n📊 **Inventory control**\n🚀 **System migration**\n\nOr, if you prefer, I can help you **book a demo** or **connect with a human expert**! What's on your mind today? 😊\n\nTo help me understand your needs better, could you tell me what industry your business operates in?`,
      time: getTime(),
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback(() => {
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  useEffect(() => {
    scroll();
  }, [msgs, typing, scroll]);

  // Extract context from user messages
  const extractContext = (txt: string) => {
    const updates: Record<string, string> = {};
    const locationMatch = txt.match(/(\d+)\s*(location|branch|warehouse)/i);
    if (locationMatch) updates.locations = locationMatch[1];

    const employeeMatch = txt.match(/(\d+)\s*(employee|staff|person|people)/i);
    if (employeeMatch) updates.employees = employeeMatch[1];

    if (/stock.?out|overstock|inventory|warehouse/i.test(txt)) updates.inventoryChallenge = 'stock management';
    if (/manufacturing|production|factory/i.test(txt)) updates.industry = 'manufacturing';
    if (/retail|shop|store/i.test(txt)) updates.industry = 'retail';
    if (/service|consulting|agency/i.test(txt)) updates.industry = 'service';

    return updates;
  };

  const send = (txt: string) => {
    if (!txt.trim()) return;

    const userMsg: Msg = {
      id: Date.now().toString(),
      role: 'user',
      text: txt.trim(),
      time: getTime(),
    };

    const trimmedText = txt.trim();
    const isGreeting = /^(hi|hello|hey|jambo|habari|sasa|hallo)\b/i.test(trimmedText);
    const kraQueryRegex = /\b(kra|etims|e-filing|tax|vat|compliance)\b/i;
    const replyBadge = kraQueryRegex.test(trimmedText) ? 'kra' : undefined;

    // Update conversation context
    const newContext = extractContext(trimmedText);
    setConversationContext((p) => ({ ...p, ...newContext }));

    setMsgs((p) => [...p, userMsg]);
    setInput('');

    if (isGreeting) {
      const botMsg = getBotResponse(trimmedText, data);
      if (botMsg.action === 'demo') setDemoOpen(true);
      setTimeout(() => {
        setMsgs((p) => [...p, botMsg]);
        setShowTypingIndicator(false);
      }, 600);
      return;
    }

    setTyping(true);
    setShowTypingIndicator(true);

    // Build conversation history for the AI from current message list
    // We use a snapshot of msgs at call time (before the new user msg is rendered)
    const aiHistory: ChatMessage[] = msgs.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    // Capture context snapshot at call time (setConversationContext is async)
    const currentContext = { ...conversationContext, ...newContext };

    (async () => {
      try {
        const reply = await getChatGPTReply(trimmedText, data, aiHistory, currentContext);
        if (!reply?.trim()) throw new Error("EMPTY_REPLY");

        const botMsg: Msg = {
          id: Date.now().toString(),
          role: "bot",
          text: reply,
          time: getTime(),
          badge: replyBadge,
        };

        setTimeout(() => {
          setMsgs((p) => [...p, botMsg]);
          setShowTypingIndicator(false);
        }, 600);
      } catch (err) {
        const botMsg = getBotResponse(trimmedText, data);
        if (botMsg.action === "demo") setDemoOpen(true);
        setTimeout(() => {
          setMsgs((p) => [...p, { ...botMsg, badge: botMsg.badge || replyBadge }]);
          setShowTypingIndicator(false);
        }, 600);
      } finally {
        setTyping(false);
        setShowTypingIndicator(false);
      }
    })();
  };

  const handleClear = () => {
    if (confirm('Clear all messages?')) {
      setMsgs([
        {
          id: '0',
          role: 'bot',
          text: `👋 Chat cleared! How can I help you today?`,
          time: getTime(),
        },
      ]);
      setConversationContext({});
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-40 h-16 w-16 rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/40 hover:scale-110 transition-all flex items-center justify-center"
            aria-label="Open WhatsApp chat"
            title="Open WhatsApp chat"
          >
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <WhatsAppIcon className="h-8 w-8 text-white" />
            </motion.div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/30 opacity-60" />
              <span className="relative h-4 w-4 rounded-full bg-white/60" />
            </span>
            <span className="absolute -bottom-2 -left-2 bg-white text-[#25D366] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">✓</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed z-50 transition-all duration-300 ${
              min
                ? 'bottom-6 right-6 h-14 w-72'
                : 'bottom-0 right-0 sm:bottom-6 sm:right-6 h-[100dvh] w-full sm:h-[600px] sm:w-[420px]'
            } flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-2xl sm:rounded-2xl`}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative h-8 w-8 rounded-full bg-[#25D366] flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity }}>
                    <WhatsAppIcon className="h-4 w-4 text-white" />
                  </motion.div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm">Optimum Assistant</span>
                  <span className="text-green-300 text-xs">● Online & Ready</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMin(!min)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Minimize"
                >
                  <Minimize2 className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={handleClear}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Clear chat"
                >
                  <RotateCcw className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
              <AnimatePresence>
                {msgs.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'bot' && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-xs px-4 py-2.5 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-[#25D366] text-white rounded-br-none'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                        {msg.time}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {showTypingIndicator && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 items-start"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-slate-200 dark:bg-slate-800 px-4 py-2.5 rounded-lg rounded-bl-none flex gap-1">
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-2 h-2 bg-slate-500 rounded-full" />
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }} className="w-2 h-2 bg-slate-500 rounded-full" />
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-slate-500 rounded-full" />
                  </div>
                </motion.div>
              )}

              <div ref={endRef} />
            </div>

            {/* Quick Links */}
            {msgs.length <= 2 && (
              <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 overflow-x-auto">
                <div className="flex gap-2 flex-nowrap">
                  {quickLinks.map((link) => (
                    <button
                      key={link}
                      onClick={() => send(link)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-white text-xs font-medium rounded-full hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors whitespace-nowrap flex-shrink-0"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2 p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shrink-0">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && send(input)}
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || typing}
                className="p-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20ba58] disabled:opacity-50 transition-colors"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
              <WhatsAppButton message={`Hi, I need help with: ${input || 'Optimum Prime Solutions'}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {demoOpen && <DemoRequestModal open={demoOpen} onOpenChange={setDemoOpen} />}
    </>
  );
}
