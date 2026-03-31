import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, School, Settings, Users } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { getClasses, getRecentHistory, getTeachers } from '../../services/firestoreService';
import { SubjectKeywordEditor } from './SubjectKeywordEditor';
import type { AppUser, HistoryEntry } from '../../types/models';
import { toast } from 'sonner';

export function AdminDashboard() {
  const [teachers, setTeachers] = useState<AppUser[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [recentHistory, setRecentHistory] = useState<HistoryEntry[]>([]);
  const [showKeywordSettings, setShowKeywordSettings] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [teacherData, classData, historyData] = await Promise.all([
          getTeachers(),
          getClasses(),
          getRecentHistory(4),
        ]);
        setTeachers(teacherData);
        setClasses(classData);
        setRecentHistory(historyData);
      } catch {
        toast.error('Failed to load admin dashboard data');
      }
    }

    loadAdminData();
  }, []);

  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const classTeachers = useMemo(() => teachers.filter(t => t.isClassTeacher).length, [teachers]);
  const unassignedClasses = Math.max(0, totalClasses - classTeachers);

  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#1E2A44]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
        <header className="mb-5 rounded-3xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#667085]">Admin Panel</p>
              <h1 className="text-[24px] font-semibold">School Dashboard</h1>
              <p className="mt-1 text-[14px] text-[#677489]">Overview of teachers, classes, and daily activity</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/admin/teachers"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#DCE2EC] bg-white px-4 text-[13px] font-semibold text-[#2F3B52]"
              >
                Manage Teachers
              </Link>
              <Button
                onClick={() => setShowKeywordSettings(true)}
                className="h-10 rounded-xl bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] px-4 text-[13px] font-semibold text-white"
              >
                <Settings className="mr-2 h-4 w-4" />
                Subject Keywords
              </Button>
            </div>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Teachers" value={String(totalTeachers)} icon={Users} tone="indigo" />
          <StatCard label="Total Classes" value={String(totalClasses)} icon={School} tone="green" />
          <StatCard label="Class Teachers" value={String(classTeachers)} icon={Users} tone="amber" />
          <StatCard label="Need Assignment" value={String(unassignedClasses)} icon={AlertTriangle} tone="red" />
        </section>

        {unassignedClasses > 0 && (
          <section className="mb-5 rounded-2xl border border-[#F8D7A7] bg-[#FFF7E9] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[14px] font-semibold text-[#B45309]">Missing Class Teacher Assignments</p>
                <p className="text-[13px] text-[#8A5A15]">
                  {unassignedClasses} {unassignedClasses === 1 ? 'class is' : 'classes are'} not assigned to a class teacher.
                </p>
              </div>
              <Link
                to="/admin/teachers"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#EAB865] bg-white px-4 text-[13px] font-semibold text-[#B45309]"
              >
                Resolve Now
              </Link>
            </div>
          </section>
        )}

        <section className="rounded-3xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold">Recent Activity</h2>
            <Link to="/admin/checklist-audit" className="text-[13px] font-semibold text-[#4F46E5]">
              Checklist Audit
            </Link>
          </div>

          <div className="space-y-2">
            {recentHistory.length === 0 && (
              <div className="rounded-2xl border border-[#E3E7EE] bg-[#F8FAFC] p-4 text-[13px] text-[#677489]">
                No recent activity found.
              </div>
            )}

            {recentHistory.map(entry => (
              <div key={entry.id} className="rounded-2xl border border-[#E3E7EE] bg-[#F8FAFC] p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-[#2F3B52]">{entry.teacherName || 'Teacher'}</p>
                    <p className="text-[13px] text-[#677489]">Updated checklist for Class {entry.class}</p>
                  </div>
                  <p className="text-[12px] text-[#677489]">{entry.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={showKeywordSettings} onOpenChange={setShowKeywordSettings}>
        <DialogContent className="max-w-2xl border-[#E3E7EE] bg-white text-[#1E2A44]">
          <DialogHeader>
            <DialogTitle>Subject Keyword Configuration</DialogTitle>
            <DialogDescription className="text-[#677489]">
              Configure subject keywords to avoid cross-subject checklist updates.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <SubjectKeywordEditor />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'indigo' | 'green' | 'amber' | 'red';
}) {
  const tones = {
    indigo: 'bg-[#E9ECFF] text-[#4F46E5]',
    green: 'bg-[#EAF8F0] text-[#15803D]',
    amber: 'bg-[#FFF7E9] text-[#B45309]',
    red: 'bg-[#FDEEEE] text-[#DC2626]',
  } as const;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-2 text-[24px] font-semibold">{value}</p>
      <p className="text-[13px] text-[#677489]">{label}</p>
    </div>
  );
}
