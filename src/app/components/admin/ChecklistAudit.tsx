import { useEffect, useState } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { getClasses, getChecklistAuditData } from '../../services/firestoreService';
import { toast } from 'sonner';

interface AuditItem {
  name: string;
  type: 'bring' | 'do-not-bring';
  sources: Array<{
    teacherName: string;
    teacherRoleType: 'class-teacher' | 'subject-teacher';
    teacherSubject?: string;
    priority: number;
    won: boolean;
  }>;
}

export function ChecklistAudit() {
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [auditData, setAuditData] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function loadClasses() {
      try {
        const classData = await getClasses();
        setClasses(classData);
        if (classData.length > 0) {
          setSelectedClass(classData[0]);
        }
      } catch {
        toast.error('Failed to load classes');
      }
    }

    loadClasses();
  }, []);

  useEffect(() => {
    async function loadAuditData() {
      if (!selectedClass) return;

      setLoading(true);
      try {
        const data = await getChecklistAuditData(selectedClass, today);
        setAuditData(data);
      } catch {
        toast.error('Failed to load audit data');
        setAuditData([]);
      } finally {
        setLoading(false);
      }
    }

    loadAuditData();
  }, [selectedClass, today]);

  if (!selectedClass && classes.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F5F9] text-[#677489]" style={{ fontFamily: 'Inter, sans-serif' }}>
        No classes found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#1E2A44]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
        <header className="mb-5 rounded-3xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#667085]">Admin Panel</p>
              <h1 className="text-[24px] font-semibold">Checklist Audit</h1>
              <p className="mt-1 text-[14px] text-[#677489]">See which updates won for each checklist item</p>
            </div>
            <Link
              to="/admin"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#DCE2EC] bg-white px-4 text-[13px] font-semibold text-[#2F3B52]"
            >
              Back to Dashboard
            </Link>
          </div>
        </header>

        <section className="mb-5 rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-5">
          <p className="mb-2 text-[13px] font-semibold text-[#677489]">Select Class</p>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="h-11 rounded-xl border-[#DCE2EC] bg-white text-[#2F3B52]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent className="border-[#DCE2EC] bg-white">
              {classes.map(className => (
                <SelectItem key={className} value={className}>
                  {className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-5">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[18px] font-semibold">{selectedClass} - {today}</h2>
            <p className="text-[13px] text-[#677489]">
              {auditData.length === 0 && !loading ? 'No updates today' : `${auditData.length} final checklist items`}
            </p>
          </div>

          {loading ? (
            <p className="py-8 text-center text-[13px] text-[#677489]">Loading...</p>
          ) : auditData.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[#677489]">No updates found for this class today</p>
          ) : (
            <div className="space-y-3">
              {auditData.map((item, idx) => (
                <div key={`${item.name}-${idx}`} className="rounded-2xl border border-[#E3E7EE] bg-[#F8FAFC] p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[15px] font-semibold text-[#2F3B52]">{item.name}</p>
                      <p className="text-[12px] text-[#677489]">
                        Type:{' '}
                        <span className={item.type === 'bring' ? 'font-semibold text-[#15803D]' : 'font-semibold text-[#DC2626]'}>
                          {item.type === 'bring' ? 'Bring' : 'Do Not Bring'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {item.sources.length > 0 && (
                    <div className="space-y-2 border-t border-[#E3E7EE] pt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#677489]">
                        Update Sources ({item.sources.length})
                      </p>

                      {item.sources.map((source, sourceIdx) => (
                        <div
                          key={sourceIdx}
                          className={`rounded-xl border p-2.5 ${
                            source.won ? 'border-[#BFE7CF] bg-[#EAF8F0]' : 'border-[#DCE2EC] bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[13px] font-semibold text-[#2F3B52]">{source.teacherName}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                                <span
                                  className={`rounded-full px-2 py-0.5 font-semibold ${
                                    source.teacherRoleType === 'class-teacher'
                                      ? 'bg-[#E9ECFF] text-[#4F46E5]'
                                      : 'bg-[#FFF7E9] text-[#B45309]'
                                  }`}
                                >
                                  {source.teacherRoleType === 'class-teacher'
                                    ? 'Class Teacher'
                                    : `Subject Teacher (${source.teacherSubject})`}
                                </span>
                                <span className="text-[#677489]">Priority {source.priority}</span>
                              </div>
                            </div>

                            {source.won && (
                              <div className="inline-flex items-center gap-1 rounded-full border border-[#BFE7CF] bg-white px-2 py-1 text-[11px] font-semibold text-[#15803D]">
                                <ChevronRight className="h-3.5 w-3.5" />
                                Winner
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-[#F8D7A7] bg-[#FFF7E9] p-4">
          <p className="mb-1 inline-flex items-center gap-1 text-[13px] font-semibold text-[#B45309]">
            <AlertTriangle className="h-4 w-4" />
            Resolution Rules
          </p>
          <p className="text-[13px] text-[#8A5A15]">Class teachers have priority 2 and override subject teachers (priority 1) on conflicts.</p>
        </section>
      </div>
    </div>
  );
}
