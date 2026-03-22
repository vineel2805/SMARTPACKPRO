import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Check, Package, User, X } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  getTodayPackingItems,
  recordStudentSeen,
  recordStudentProgress,
  recordStudentCompleted,
} from '../../services/firestoreService';
import type { StudentChecklistItem } from '../../types/models';

export function TodaysBag() {
  const { user } = useAuth();
  const [items, setItems] = useState<StudentChecklistItem[]>([]);
  const [customItems, setCustomItems] = useState<StudentChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllItems, setShowAllItems] = useState(false);
  const [transitionState, setTransitionState] = useState<'idle' | 'checking' | 'exiting' | 'entering'>('idle');
  const [animatingItemId, setAnimatingItemId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTodayItems() {
      if (!user?.class) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      try {
        // Record that student has opened the app
        await recordStudentSeen(user.id, user.name, user.class);

        const dailyItems = await getTodayPackingItems(user.class);
        setItems(
          dailyItems.map(item => ({
            ...item,
            checked: false,
          })),
        );
      } catch (error) {
        console.error(error);
        toast.error('Unable to load today\'s bag from database');
      } finally {
        setIsLoading(false);
      }
    }

    const stored = localStorage.getItem('customItems');
    if (stored) {
      setCustomItems(JSON.parse(stored));
    }

    loadTodayItems();
  }, [user?.class, user?.id, user?.name]);

  const bringItems = items.filter(item => item.type === 'bring');
  const doNotBringItems = items.filter(item => item.type === 'do-not-bring');
  const guidedItems = [...bringItems, ...customItems];
  const checkedCount = guidedItems.filter(item => item.checked).length;
  const totalCount = guidedItems.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
  const currentIndex = guidedItems.findIndex(item => !item.checked);
  const currentItem = currentIndex >= 0 ? guidedItems[currentIndex] : null;
  const nextItem = currentIndex >= 0 ? guidedItems.slice(currentIndex + 1).find(item => !item.checked) ?? null : null;
  const isComplete = totalCount > 0 && currentIndex === -1;
  const estimatedSavedWeightKg = (doNotBringItems.length * 0.4).toFixed(1);

  const markCurrentItemAsChecked = (id: string) => {
    const isCustom = customItems.some(item => item.id === id);

    if (isCustom) {
      const updated = customItems.map(item =>
        item.id === id ? { ...item, checked: true } : item,
      );
      setCustomItems(updated);
      localStorage.setItem('customItems', JSON.stringify(updated));
      return;
    }

    setItems(prev => prev.map(item => (item.id === id ? { ...item, checked: true } : item)));
  };

  const handleFocusCheck = () => {
    if (!currentItem || transitionState !== 'idle') {
      return;
    }

    const targetId = currentItem.id;
    const markedCount = Math.min(checkedCount + 1, totalCount);

    setAnimatingItemId(targetId);
    setTransitionState('checking');

    window.setTimeout(() => {
      setTransitionState('exiting');
    }, 120);

    window.setTimeout(() => {
      markCurrentItemAsChecked(targetId);

      if (user?.id && user?.name && user?.class) {
        recordStudentProgress(user.id, user.name, user.class, markedCount).catch(console.error);
      }

      setTransitionState('entering');
    }, 270);

    window.setTimeout(() => {
      setTransitionState('idle');
      setAnimatingItemId(null);
    }, 430);
  };

  const handleDonePacking = async () => {
    if (progress === 100) {
      // Record completion
      if (user?.id && user?.name && user?.class) {
        await recordStudentCompleted(user.id, user.name, user.class);
      }
      toast.success('Great job! Your bag is ready! 🎒', {
        description: 'Have a wonderful day at school!',
      });
    } else {
      toast.warning('Almost there!', {
        description: `You have ${totalCount - checkedCount} items left to pack.`,
      });
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const cardIsChecking = currentItem?.id === animatingItemId && transitionState === 'checking';
  const checkboxIsFilled = Boolean(currentItem?.checked || cardIsChecking || transitionState === 'exiting');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] text-white flex items-start justify-center">
        <div className="w-full max-w-[360px] h-screen max-h-[800px] px-4 pt-5 pb-6">
          <p className="text-sm text-[#9CA3AF]">Loading your packing list...</p>
        </div>
      </div>
    );
  }

  if (totalCount === 0 && doNotBringItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] text-white flex items-start justify-center">
        <div className="w-full max-w-[360px] h-screen max-h-[800px] px-4 pt-5 pb-6 flex flex-col">
          <h1 className="text-[20px] font-semibold">Today's Bag</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-1">{today}</p>
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <Package className="w-10 h-10 mx-auto text-[#9CA3AF]" />
              <p className="mt-4 text-sm text-[#9CA3AF]">No items assigned today.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0B1220_55%,#0B0F1A_100%)] text-white flex items-start justify-center">
      <div className="w-full max-w-[360px] h-screen max-h-[800px] px-4 pt-5 pb-6 flex flex-col overflow-hidden">
        <header>
          <div className="flex items-center justify-between pb-2">
            <h1 className="text-[20px] font-semibold text-white">Today's Bag</h1>
            <Link to="/student/profile" aria-label="Open profile">
              <span className="w-10 h-10 rounded-full bg-[#111827] border border-[#1F2937] flex items-center justify-center transition-all duration-150 hover:bg-[#1F2937] active:scale-95">
                <User className="w-[18px] h-[18px] text-[#D1D5DB]" />
              </span>
            </Link>
          </div>
          <p className="text-[13px] text-[#94A3B8] mt-1">{today}</p>

          <div className="mt-4 mb-6">
            <div className="flex items-center justify-between text-[12px] text-[#94A3B8]">
              <span>Progress</span>
              <span>{checkedCount} of {totalCount}</span>
            </div>
            <div className="mt-2 h-[10px] rounded-full bg-[#1E293B] overflow-hidden">
              <div
                className="h-full bg-[linear-gradient(90deg,#22C55E_0%,#4ADE80_100%)] shadow-[0_0_12px_rgba(34,197,94,0.4)] transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-[12px] text-[#94A3B8]">
              {checkedCount} of {totalCount} packed
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          <section className="mt-8">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-3 rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_70%)]" />
            {currentItem ? (
              <div
                className={`relative w-full p-7 rounded-[20px] bg-[linear-gradient(145deg,#111827_0%,#0B1220_100%)] border border-[#1F2937] text-center transition-all duration-200 shadow-[0_20px_40px_rgba(0,0,0,0.5)] active:scale-[0.97] ${
                  transitionState === 'exiting'
                    ? 'scale-[0.96] opacity-0 translate-y-2'
                    : transitionState === 'entering'
                    ? 'translate-x-5 opacity-0'
                    : 'scale-100 opacity-100 translate-x-0'
                }`}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checkboxIsFilled}
                  onClick={handleFocusCheck}
                  className={`mx-auto w-9 h-9 rounded-[11px] border-2 flex items-center justify-center transition-all duration-120 ${
                    checkboxIsFilled
                      ? 'bg-[#22C55E] border-[#22C55E] shadow-[0_0_0_5px_rgba(34,197,94,0.2),0_0_18px_rgba(34,197,94,0.35)]'
                      : 'bg-transparent border-[#4B5563] hover:border-[#6B7280] hover:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]'
                  }`}
                >
                  {checkboxIsFilled && <Check className="w-4 h-4 text-white" />}
                </button>

                <p className="mt-[18px] text-[20px] leading-tight font-semibold text-white">{currentItem.name}</p>
                <p className="mt-1.5 text-[13px] text-[#94A3B8]">{currentItem.subject ?? 'School Item'}</p>
              </div>
            ) : (
              <div className="relative w-full p-7 rounded-[20px] bg-[linear-gradient(145deg,#111827_0%,#0B1220_100%)] border border-[#1F2937] text-center shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                <p className="text-[18px] font-semibold text-white">🎉 All Packed!</p>
                <p className="mt-1 text-[13px] text-[#94A3B8]">You're ready for school</p>
              </div>
            )}
            </div>

            {nextItem && (
              <div className="mt-6 text-center">
                <p className="text-[11px] uppercase tracking-wide text-[#6B7280]">Up Next</p>
                <p className="mt-1 text-[16px] font-medium text-[#E2E8F0]">{nextItem.name}</p>
              </div>
            )}

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllItems(true)}
                className="h-11 px-4 rounded-xl border border-[#1F2937] bg-[rgba(255,255,255,0.02)] hover:bg-[#162133] text-[13px] text-[#60A5FA] flex items-center gap-2 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {doNotBringItems.length > 0 && (
              <div className="mt-8 p-4 rounded-2xl border border-[rgba(239,68,68,0.15)] bg-[linear-gradient(145deg,rgba(239,68,68,0.08),rgba(239,68,68,0.02))]">
                <p className="text-[14px] font-semibold text-[#F87171]">🚫 Skip These Today</p>
                <p className="mt-1 text-[12px] text-[#FCA5A5]">Save weight: ~{estimatedSavedWeightKg} kg</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {doNotBringItems.map(item => (
                    <span
                      key={item.id}
                      className="px-2.5 py-1.5 rounded-full bg-[rgba(239,68,68,0.12)] text-[12px] text-[#FCA5A5]"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {isComplete && (
            <section className="mt-auto text-center pb-1 animate-[bounce_400ms_ease-out_1]">
              <p className="text-[18px] font-semibold text-white">🎉 All Packed!</p>
              <p className="mt-1 text-[13px] text-[#94A3B8]">You're ready for school</p>
              <Button
                onClick={handleDonePacking}
                className="mt-5 w-full h-[52px] rounded-[14px] bg-[linear-gradient(90deg,#3B82F6,#2563EB)] hover:brightness-110 text-[15px] font-semibold text-white shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-all duration-150 active:scale-[0.97]"
              >
                Finish
              </Button>
            </section>
          )}

          {!isComplete && <div className="mt-auto h-8" />}
        </main>

        {showAllItems && (
          <div className="fixed inset-0 z-20 bg-black/60 p-4 flex items-center justify-center">
            <div className="w-full max-w-[360px] max-h-[80vh] overflow-y-auto rounded-2xl bg-[#111827] border border-[#1F2937] p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Full Checklist</h2>
                <button
                  type="button"
                  onClick={() => setShowAllItems(false)}
                  className="w-7 h-7 rounded-full border border-[#374151] flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[#9CA3AF]" />
                </button>
              </div>

              <div className="space-y-3">
                {guidedItems.map(item => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className={`${item.checked ? 'text-[#6B7280] line-through' : 'text-white'}`}>{item.name}</p>
                      {item.subject && <p className="text-xs text-[#9CA3AF] mt-0.5">{item.subject}</p>}
                    </div>
                    <span className={`text-xs ${item.checked ? 'text-[#22C55E]' : 'text-[#9CA3AF]'}`}>
                      {item.checked ? 'Packed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}