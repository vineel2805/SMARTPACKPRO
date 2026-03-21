import { ArrowLeft, Mail, MessageCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export function HelpSupport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issueDescription, setIssueDescription] = useState('');

  const handleSubmit = () => {
    if (!issueDescription.trim()) {
      toast.error('Please describe your issue');
      return;
    }
    toast.success('Issue reported successfully', {
      description: 'Our team will get back to you soon.',
    });
    setIssueDescription('');
  };

  const faqs = [
    {
      question: 'How do I add custom items to my packing list?',
      answer: 'Students can add custom items in the "My Items" section on the Today\'s Bag screen.',
    },
    {
      question: 'How do teachers update packing items?',
      answer: 'Teachers can use the Update screen to select a class and add items to bring or not bring.',
    },
    {
      question: 'Can I see which students have completed packing?',
      answer: 'Yes, teachers can view student engagement in the Student Engagement screen.',
    },
    {
      question: 'How do I change the theme?',
      answer: 'Go to Profile → Appearance and select Light, Dark, or System theme.',
    },
  ];

  const getBackPath = () => {
    switch (user?.role) {
      case 'student':
        return '/student/profile';
      case 'teacher':
        return '/teacher/profile';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <header className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => navigate(getBackPath())}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </button>
          <h1 className="font-semibold">Help & Support</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Contact Options */}
        <section>
          <h3 className="font-semibold mb-3">Contact Us</h3>
          <div className="space-y-2">
            <a
              href="mailto:support@smartpackapp.com"
              className="flex items-center gap-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-zinc-400">support@smartpackapp.com</p>
              </div>
            </a>

            <button className="w-full flex items-center gap-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Live Chat</p>
                <p className="text-sm text-zinc-400">Available Mon-Fri, 9 AM - 5 PM</p>
              </div>
            </button>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h3 className="font-semibold mb-3">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden group"
              >
                <summary className="p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors list-none flex items-center justify-between">
                  <span className="font-medium pr-4">{faq.question}</span>
                  <svg
                    className="w-5 h-5 text-zinc-400 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-sm text-zinc-400 border-t border-zinc-800 pt-3">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Report Issue */}
        <section>
          <h3 className="font-semibold mb-3">Report an Issue</h3>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 space-y-4">
            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <p className="text-sm text-zinc-300">
                Please describe your issue in detail. Our team will review and respond within 24 hours.
              </p>
            </div>

            <textarea
              value={issueDescription}
              onChange={e => setIssueDescription(e.target.value)}
              placeholder="Describe the issue you're facing..."
              className="w-full h-32 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg outline-none focus:border-indigo-500 transition-colors resize-none"
            />

            <Button
              onClick={handleSubmit}
              className="w-full bg-indigo-500 hover:bg-indigo-600"
            >
              Submit Issue
            </Button>
          </div>
        </section>

        {/* App Info */}
        <section className="text-center pt-4">
          <p className="text-sm text-zinc-500">Smart Pack App v1.0.0</p>
          <p className="text-xs text-zinc-600 mt-1">© 2026 Smart Pack App. All rights reserved.</p>
        </section>
      </main>
    </div>
  );
}
