import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { User, CheckCircle2, Clock, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getHistoryByClasses, getStudentEngagementByClasses } from '../../services/firestoreService';
import { toast } from 'sonner';
import type { HistoryEntry, StudentEngagement } from '../../types/models';

export function TeacherDashboard() {
  const { user } = useAuth();
  const [engagement, setEngagement] = useState<StudentEngagement[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.assignedClasses?.length) return;

      try {
        const [engagementData, historyData] = await Promise.all([
          getStudentEngagementByClasses(user.assignedClasses),
          getHistoryByClasses(user.assignedClasses),
        ]);
        setEngagement(engagementData);
        setHistory(historyData.slice(0, 3));
      } catch {
        toast.error('Failed to load teacher dashboard data');
      }
    }

    loadDashboardData();
  }, [user?.assignedClasses]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const stats = useMemo(
    () => [
      {
        label: 'Completed',
        value: String(engagement.filter(item => item.status === 'completed').length),
        icon: CheckCircle2,
        bg: 'bg-[#E7F8EF]',
        color: 'text-[#16A34A]',
      },
      {
        label: 'In Progress',
        value: String(engagement.filter(item => item.status === 'in-progress').length),
        icon: Clock,
        bg: 'bg-[#FFF6E8]',
        color: 'text-[#D97706]',
      },
      {
        label: 'Not Seen',
        value: String(engagement.filter(item => item.status === 'not-seen').length),
        icon: Package,
        bg: 'bg-[#EEF1F6]',
        color: 'text-[#667085]',
      },
    ],
    [engagement],
  );

  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#1E2A44] pb-20" style={{ fontFamily: 'Inter, sans-serif' }}>
      <header className="sticky top-0 z-10 border-b border-[#E1E6EF] bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold">Dashboard</h1>
            <p className="text-[13px] text-[#677489]">{today}</p>
          </div>
          <Link
            to="/teacher/profile"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D9DEE8] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-4 px-4 py-5">
        <section className="rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.07)]">
          <h2 className="text-[24px] font-semibold leading-7">Welcome back,</h2>
          <p className="mt-1 text-[18px] font-semibold text-[#4F46E5]">{user?.name}</p>

          <Link
            to="/teacher/update"
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] text-[15px] font-semibold text-white"
          >
            Update Today's Items
          </Link>
        </section>

        <section className="grid grid-cols-3 gap-2">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl bg-white p-3 shadow-[0_6px_16px_rgba(15,23,42,0.06)]">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg}`}>
                  <Icon className={`h-4.5 w-4.5 ${stat.color}`} />
                </span>
                <p className="mt-2 text-[22px] font-semibold">{stat.value}</p>
                <p className="text-[12px] text-[#677489]">{stat.label}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.07)]">
          <h3 className="mb-3 text-[16px] font-semibold">Your Classes</h3>
          <div className="flex flex-wrap gap-2">
            {(user?.assignedClasses ?? []).map(cls => (
              <span key={cls} className="rounded-full border border-[#C8CEFC] bg-[#E9ECFF] px-3 py-1.5 text-[13px] font-medium text-[#4F46E5]">
                {cls}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.07)]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[16px] font-semibold">Recent Activity</h3>
            <Link to="/teacher/history" className="text-[13px] font-semibold text-[#4F46E5]">View all</Link>
          </div>

          <div className="space-y-2">
            {history.length === 0 && <p className="text-[13px] text-[#677489]">No recent updates found.</p>}
            {history.map(entry => (
              <div key={entry.id} className="rounded-2xl border border-[#E3E7EE] bg-[#F8FAFC] p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14px] font-semibold text-[#2F3B52]">Class {entry.class}</p>
                  <p className="text-[12px] text-[#677489]">{entry.date}</p>
                </div>
                <p className="mt-1 text-[13px] text-[#677489]">
                  Added {entry.itemsAdded.length} items • Removed {entry.itemsRemoved.length} items
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
