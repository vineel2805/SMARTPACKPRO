import { ArrowLeft, Mail, MessageCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
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
      answer: 'Students can add custom items in the My Items section on the Today\'s Bag screen.',
    },
    {
      question: 'How do teachers update packing items?',
      answer: 'Teachers can use Update screen to select class and add bring or do not bring items.',
    },
    {
      question: 'Can I see which students have completed packing?',
      answer: 'Yes, teachers can view student engagement from Student Engagement screen.',
    },
    {
      question: 'How do I change the theme?',
      answer: 'Go to Profile and select Light, Dark, or System theme mode.',
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
    <div className="min-h-screen bg-[#F3F5F9] text-[#1E2A44] pb-20" style={{ fontFamily: 'Inter, sans-serif' }}>
      <header className="sticky top-0 z-10 border-b border-[#E1E6EF] bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          <button
            onClick={() => navigate(getBackPath())}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D9DEE8] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[20px] font-semibold">Help & Support</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-4 px-4 py-5">
        <section className="rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.07)]">
          <h3 className="mb-3 text-[16px] font-semibold">Contact</h3>
          <div className="space-y-2">
            <a
              href="mailto:support@smartpackapp.com"
              className="flex items-center gap-3 rounded-2xl border border-[#DCE2EC] bg-white p-3"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8EBFF] text-[#5B5FF2]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[14px] font-semibold">Email Support</p>
                <p className="text-[13px] text-[#677489]">support@smartpackapp.com</p>
              </div>
            </a>

            <button className="flex w-full items-center gap-3 rounded-2xl border border-[#DCE2EC] bg-white p-3 text-left">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F8EF] text-[#16A34A]">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[14px] font-semibold">Live Chat</p>
                <p className="text-[13px] text-[#677489]">Mon-Fri, 9 AM - 5 PM</p>
              </div>
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.07)]">
          <h3 className="mb-3 text-[16px] font-semibold">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <details key={index} className="rounded-2xl border border-[#DCE2EC] bg-white px-3 py-2">
                <summary className="cursor-pointer list-none text-[14px] font-medium text-[#2F3B52]">{faq.question}</summary>
                <p className="mt-2 text-[13px] text-[#677489]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.07)]">
          <h3 className="mb-3 text-[16px] font-semibold">Report an Issue</h3>
          <div className="mb-3 flex items-start gap-2 rounded-2xl border border-[#F8DBA6] bg-[#FFF7E6] p-3">
            <AlertCircle className="mt-0.5 h-4.5 w-4.5 text-[#D97706]" />
            <p className="text-[13px] text-[#6B4E10]">Describe your issue and our team will respond within 24 hours.</p>
          </div>

          <textarea
            value={issueDescription}
            onChange={e => setIssueDescription(e.target.value)}
            placeholder="Describe the issue you're facing..."
            className="h-28 w-full resize-none rounded-xl border border-[#C8CEDB] bg-white px-3 py-2.5 text-[14px] outline-none placeholder:text-[#8A94A8] focus:border-[#5B5FF2]"
          />

          <button
            onClick={handleSubmit}
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] text-[14px] font-semibold text-white"
          >
            Submit Issue
          </button>
        </section>
      </main>
    </div>
  );
}
