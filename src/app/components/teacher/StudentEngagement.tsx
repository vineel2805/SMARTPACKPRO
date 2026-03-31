import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Bell } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { getStudentEngagementByClass } from '../../services/firestoreService';
import type { StudentEngagement as StudentEngagementItem } from '../../types/models';

type StatusFilter = 'all' | 'completed' | 'in-progress' | 'not-seen' | 'inactive';

export function StudentEngagement() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState(user?.assignedClasses?.[0] ?? '');
  const [students, setStudents] = useState<StudentEngagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setIsLoading(false);
      return;
    }

    async function loadEngagement() {
      setIsLoading(true);
      try {
        const data = await getStudentEngagementByClass(selectedClass);
        setStudents(data);
      } catch {
        toast.error('Failed to load student engagement');
      } finally {
        setIsLoading(false);
      }
    }

    loadEngagement();
  }, [selectedClass]);

  const statusConfig = {
    completed: { icon: CheckCircle2, badge: 'bg-[#EAF8F0] text-[#15803D] border-[#BFE7CF]', label: 'Completed' },
    'in-progress': { icon: Clock, badge: 'bg-[#FFF7E8] text-[#D97706] border-[#F8D29C]', label: 'In Progress' },
    'not-seen': { icon: AlertCircle, badge: 'bg-[#EEF1F6] text-[#667085] border-[#D8DEE9]', label: 'Not Seen' },
    inactive: { icon: AlertCircle, badge: 'bg-[#FDEEEE] text-[#DC2626] border-[#F4C4C4]', label: 'Inactive' },
  } as const;

  const filteredStudents = useMemo(
    () => (filter === 'all' ? students : students.filter(s => s.status === filter)),
    [filter, students],
  );

  const stats = useMemo(
    () => ({
      completed: students.filter(s => s.status === 'completed').length,
      'in-progress': students.filter(s => s.status === 'in-progress').length,
      'not-seen': students.filter(s => s.status === 'not-seen').length,
      inactive: students.filter(s => s.status === 'inactive').length,
    }),
    [students],
  );

  const handleRemindStudents = () => {
    const count = students.filter(s => s.status === 'not-seen' || s.status === 'inactive').length;
    if (count === 0) {
      toast.success('All students are engaged!');
      return;
    }
    toast.success(`Reminder sent to ${count} students`);
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#1E2A44] pb-20" style={{ fontFamily: 'Inter, sans-serif' }}>
      <header className="sticky top-0 z-10 border-b border-[#E1E6EF] bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          <Link
            to="/teacher"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D9DEE8] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-[20px] font-semibold">Student Engagement</h1>
            <p className="text-[13px] text-[#677489]">Class {selectedClass || 'N/A'}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-4 px-4 py-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(user?.assignedClasses ?? []).map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`h-10 whitespace-nowrap rounded-full border px-4 text-[13px] font-medium ${
                selectedClass === cls
                  ? 'border-transparent bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] text-white'
                  : 'border-[#C8CEDB] bg-white text-[#2F3B52]'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        <section className="grid grid-cols-5 gap-2">
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = stats[key as keyof typeof stats];
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key as StatusFilter)}
                className={`rounded-2xl border bg-white p-2 text-left ${active ? 'border-[#5B5FF2]' : 'border-[#DCE2EC]'}`}
              >
                <Icon className="mb-1 h-4 w-4 text-[#5B5FF2]" />
                <p className="text-[16px] font-semibold">{count}</p>
                <p className="text-[10px] text-[#677489]">{config.label}</p>
              </button>
            );
          })}
        </section>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('all')}
            className={`h-9 whitespace-nowrap rounded-full border px-3 text-[12px] font-medium ${
              filter === 'all' ? 'border-[#5B5FF2] bg-[#E9ECFF] text-[#4F46E5]' : 'border-[#DCE2EC] bg-white text-[#2F3B52]'
            }`}
          >
            All ({students.length})
          </button>
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = stats[key as keyof typeof stats];
            return (
              <button
                key={key}
                onClick={() => setFilter(key as StatusFilter)}
                className={`h-9 whitespace-nowrap rounded-full border px-3 text-[12px] font-medium ${
                  filter === key ? 'border-[#5B5FF2] bg-[#E9ECFF] text-[#4F46E5]' : 'border-[#DCE2EC] bg-white text-[#2F3B52]'
                }`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>

        <section className="space-y-2">
          {isLoading && <p className="text-[13px] text-[#677489]">Loading engagement...</p>}
          {!isLoading && filteredStudents.length === 0 && <p className="text-[13px] text-[#677489]">No engagement records found.</p>}

          {filteredStudents.map(student => {
            const config = statusConfig[student.status];
            const Icon = config.icon;
            return (
              <div key={student.id} className="rounded-2xl bg-white p-3 shadow-[0_4px_14px_rgba(15,23,42,0.06)]">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[14px] font-semibold">{student.name}</p>
                    <p className="text-[12px] text-[#677489]">{student.class}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${config.badge}`}>
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </span>
                </div>
                {student.lastSeen && <p className="text-[12px] text-[#677489]">Last seen: {student.lastSeen}</p>}
              </div>
            );
          })}
        </section>

        <button
          onClick={handleRemindStudents}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] text-[14px] font-semibold text-white"
        >
          <Bell className="h-4.5 w-4.5" />
          Remind Students
        </button>
      </main>
    </div>
  );
}
