import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LiveChatModal } from '../components/modals/LiveChatModal';
import {
  HelpCircleIcon,
  MailIcon,
  PhoneIcon,
  MessageCircleIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ScaleIcon,
  ShieldIcon,
  ExternalLinkIcon } from
'lucide-react';
import { toast } from 'sonner';
const faqs = [
{
  q: 'What is the AARTO Act?',
  a: 'The Administrative Adjudication of Road Traffic Offences Act (Act 46 of 1998) governs how minor and major traffic infringements are handled in South Africa. It introduces a demerit point system and standardizes the dispute process.'
},
{
  q: 'How long do I have to dispute a fine?',
  a: 'Under AARTO, you have 32 days from the service date of the infringement notice to submit a representation (dispute). After this period, the option to dispute via representation lapses.'
},
{
  q: 'What happens if my license disc expires?',
  a: 'Driving with an expired disc is an offence. There is a 21-day grace period after expiry, after which arrears penalties apply at 10% per month overdue. You can renew online via TrafficOS at any time.'
},
{
  q: 'Are the AI dispute analyses legally binding?',
  a: 'No. Our AI analysis is a guidance tool based on public AARTO regulations and procedural requirements. The final dispute outcome is determined by the issuing authority. We strongly recommend reviewing each analysis carefully.'
},
{
  q: 'How does the blockchain receipt work?',
  a: 'When you submit a dispute, we generate a cryptographic SHA-256 hash that proves the exact time of submission. This is useful evidence if the issuing authority later disputes when you submitted your representation.'
},
{
  q: 'Is my payment information secure?',
  a: 'Yes. All payments are processed through PCI-DSS compliant gateways with 256-bit encryption. We never store your full card details on our servers.'
}];

export function SupportPage() {
  const { dispatch } = useAppStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setContactForm({
        subject: '',
        message: ''
      });
      toast.success('Message sent. Our team will respond within 24 hours.');
    }, 1200);
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="space-y-8">
      
      <PageHeader
        title="Support Centre"
        description="Find answers, contact our team, and access legal resources." />
      

      {/* Quick contact tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ContactTile
          icon={<MessageCircleIcon className="w-5 h-5" />}
          title="Live Chat"
          description="Mon–Fri, 8am–6pm SAST"
          action="Start chat"
          onClick={() => setIsChatOpen(true)}
          color="blue" />
        
        <ContactTile
          icon={<PhoneIcon className="w-5 h-5" />}
          title="Call Us"
          description="0800 TRAFFIC (872 334)"
          action="Toll-free"
          onClick={() => window.open('tel:0800872334')}
          color="emerald" />
        
        <ContactTile
          icon={<MailIcon className="w-5 h-5" />}
          title="Email"
          description="support@trafficos.co.za"
          action="24h response"
          onClick={() => window.open('mailto:support@trafficos.co.za')}
          color="indigo" />
        
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <HelpCircleIcon className="w-5 h-5 text-blue-600" />
          Frequently Asked Questions
        </h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx}>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    
                    <span className="font-medium text-gray-900 dark:text-white pr-4">
                      {faq.q}
                    </span>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen &&
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0
                      }}
                      animate={{
                        height: 'auto',
                        opacity: 1
                      }}
                      exit={{
                        height: 0,
                        opacity: 0
                      }}
                      transition={{
                        duration: 0.2
                      }}
                      className="overflow-hidden">
                      
                        <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    }
                  </AnimatePresence>
                </div>);

            })}
          </div>
        </div>
      </div>

      {/* Legal Resources */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ScaleIcon className="w-5 h-5 text-blue-600" />
          Legal Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ResourceLink
            title="AARTO Act, 1998"
            subtitle="Full text of Act 46 of 1998"
            url="https://www.gov.za/documents/administrative-adjudication-road-traffic-offences-act" />
          
          <ResourceLink
            title="National Road Traffic Act"
            subtitle="Act 93 of 1996"
            url="https://www.gov.za/documents/national-road-traffic-act" />
          
          <ResourceLink
            title="AARTO Representation Form"
            subtitle="Official AARTO 08 form template"
            url="https://www.aarto.gov.za" />
          
          <ResourceLink
            title="Demerit Points System"
            subtitle="How points work in South Africa"
            url="https://www.aarto.gov.za" />
          
        </div>
      </div>

      {/* Contact form */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpenIcon className="w-5 h-5 text-blue-600" />
          Send us a Message
        </h2>
        <form
          onSubmit={handleContactSubmit}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          
          <Input
            label="Subject"
            placeholder="What can we help with?"
            value={contactForm.subject}
            onChange={(e) =>
            setContactForm({
              ...contactForm,
              subject: e.target.value
            })
            }
            required />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Message
            </label>
            <textarea
              className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white p-4 min-h-[120px] resize-none"
              placeholder="Describe your issue in detail..."
              value={contactForm.message}
              onChange={(e) =>
              setContactForm({
                ...contactForm,
                message: e.target.value
              })
              }
              required />
            
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSending}>
              Send Message
            </Button>
          </div>
        </form>
      </div>

      <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1 pb-4">
        <ShieldIcon className="w-3 h-3" /> All conversations are encrypted and
        confidential.
      </div>

      <LiveChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </motion.div>);

}
function ContactTile({
  icon,
  title,
  description,
  action,
  onClick,
  color







}: {icon: React.ReactNode;title: string;description: string;action: string;onClick: () => void;color: 'blue' | 'emerald' | 'indigo';}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    emerald:
    'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    indigo:
    'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
  };
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 text-left hover:shadow-md transition-shadow">
      
      <div
        className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>
        
        {icon}
      </div>
      <h4 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {description}
      </p>
      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
        {action} →
      </span>
    </button>);

}
function ResourceLink({
  title,
  subtitle,
  url




}: {title: string;subtitle: string;url: string;}) {
  return (
    <button
      onClick={() => window.open(url, '_blank')}
      className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-4">
      
      <div className="min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {subtitle}
        </p>
      </div>
      <ExternalLinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </button>);

}