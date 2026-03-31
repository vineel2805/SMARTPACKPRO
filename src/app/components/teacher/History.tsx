import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router';
import { getHistoryByClasses } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import type { HistoryEntry } from '../../types/models';
import { toast } from 'sonner';

export function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!user?.assignedClasses?.length) {
        setHistory([]);
        setIsLoading(false);
        return;
      }

      try {
        const entries = await getHistoryByClasses(user.assignedClasses);
        setHistory(entries);
      } catch {
        toast.error('Failed to load history from database');
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, [user?.assignedClasses]);

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
          <h1 className="text-[20px] font-semibold">History</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-3 px-4 py-5">
        {isLoading && <p className="text-[13px] text-[#677489]">Loading history...</p>}
        {!isLoading && history.length === 0 && <p className="text-[13px] text-[#677489]">No history found yet.</p>}

        {history.map(entry => {
          const date = new Date(entry.date);
          const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });

          return (
            <div key={entry.id} className="rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.07)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF1F6] px-3 py-1 text-[12px] font-medium text-[#4C596F]">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate}
                </div>
                <span className="rounded-full bg-[#E9ECFF] px-2.5 py-1 text-[12px] font-semibold text-[#4F46E5]">
                  {entry.class}
                </span>
              </div>

              <div className="space-y-2">
                {entry.itemsAdded.length > 0 && (
                  <div className="rounded-2xl border border-[#BFE7CF] bg-[#EAF8F0] p-3">
                    <p className="mb-1 inline-flex items-center gap-1 text-[12px] font-semibold text-[#15803D]">
                      <Plus className="h-3.5 w-3.5" />
                      Added ({entry.itemsAdded.length})
                    </p>
                    <p className="text-[13px] text-[#2F3B52]">{entry.itemsAdded.join(', ')}</p>
                  </div>
                )}

                {entry.itemsRemoved.length > 0 && (
                  <div className="rounded-2xl border border-[#F4C4C4] bg-[#FDEEEE] p-3">
                    <p className="mb-1 inline-flex items-center gap-1 text-[12px] font-semibold text-[#DC2626]">
                      <Minus className="h-3.5 w-3.5" />
                      Removed ({entry.itemsRemoved.length})
                    </p>
                    <p className="text-[13px] text-[#2F3B52]">{entry.itemsRemoved.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
