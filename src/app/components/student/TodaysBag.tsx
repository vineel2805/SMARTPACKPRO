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
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto w-full max-w-md px-4 pt-5 pb-6">
          <p className="text-sm text-muted-foreground">Loading your packing list...</p>
        </div>
      </div>
    );
  }

  if (totalCount === 0 && doNotBringItems.length === 0) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-5 pb-6">
          <h1 className="text-[20px] font-semibold">Today's Bag</h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <Package className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">No items assigned today.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-5 pb-6">
        <header>
          <div className="flex items-center justify-between pb-2">
            <h1 className="text-[20px] font-semibold text-foreground">Today's Bag</h1>
            <Link to="/student/profile" aria-label="Open profile">
              <span className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center transition-all duration-150 hover:bg-muted active:scale-95">
                <User className="w-[18px] h-[18px] text-muted-foreground" />
              </span>
            </Link>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>

          <div className="mt-4 mb-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{checkedCount} of {totalCount}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-success transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {checkedCount} of {totalCount} packed
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <section className="mt-8">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-3 rounded-[28px] bg-accent/10" />
            {currentItem ? (
              <div
                className={`relative w-full rounded-[20px] border border-border bg-card p-7 text-center shadow-sm transition-all duration-200 active:scale-[0.97] ${
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
                  aria-label={checkboxIsFilled ? `${currentItem.name} packed` : `Mark ${currentItem.name} as packed`}
                  className={`mx-auto w-9 h-9 rounded-[11px] border-2 flex items-center justify-center transition-all duration-120 ${
                    checkboxIsFilled
                      ? 'border-success bg-success'
                      : 'bg-transparent border-border hover:border-muted-foreground hover:shadow-[0_0_0_4px_rgba(96,165,250,0.15)]'
                  }`}
                >
                  {checkboxIsFilled && <Check className="w-4 h-4 text-primary-foreground" />}
                </button>

                <p className="mt-[18px] text-[20px] leading-tight font-semibold text-foreground">{currentItem.name}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{currentItem.subject ?? 'School Item'}</p>
              </div>
            ) : (
              <div className="relative w-full rounded-[20px] border border-border bg-card p-7 text-center shadow-sm">
                <p className="text-[18px] font-semibold text-foreground">🎉 All Packed!</p>
                <p className="mt-1 text-sm text-muted-foreground">You're ready for school</p>
              </div>
            )}
            </div>

            {currentItem && (
              <Button
                type="button"
                onClick={handleFocusCheck}
                disabled={transitionState !== 'idle'}
                className="mt-4 h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Mark Packed
              </Button>
            )}

            {nextItem && (
              <div className="mt-6 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Up Next</p>
                <p className="mt-1 text-[16px] font-medium text-foreground">{nextItem.name}</p>
              </div>
            )}

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllItems(true)}
                className="h-10 rounded-lg px-4 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {doNotBringItems.length > 0 && (
              <div className="mt-8 rounded-2xl border border-warning/35 bg-warning/10 p-4">
                <p className="text-sm font-semibold text-warning">Skip These Today</p>
                <p className="mt-1 text-sm text-text-secondary">Save weight: ~{estimatedSavedWeightKg} kg</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {doNotBringItems.map(item => (
                    <span
                      key={item.id}
                      className="rounded-full border border-warning/30 bg-surface px-2.5 py-1.5 text-xs text-text-secondary"
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
              <p className="text-[18px] font-semibold text-foreground">🎉 All Packed!</p>
              <p className="mt-1 text-sm text-muted-foreground">You're ready for school</p>
              <Button
                onClick={handleDonePacking}
                className="mt-5 h-[52px] w-full rounded-[14px] bg-primary text-[15px] font-semibold text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.97]"
              >
                Finish
              </Button>
            </section>
          )}

          {!isComplete && <div className="mt-auto h-8" />}
        </main>

        {showAllItems && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-foreground/40 p-4">
            <div className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Full Checklist</h2>
                <button
                  type="button"
                  onClick={() => setShowAllItems(false)}
                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-3">
                {guidedItems.map(item => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className={`${item.checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{item.name}</p>
                      {item.subject && <p className="text-xs text-muted-foreground mt-0.5">{item.subject}</p>}
                    </div>
                    <span className={`text-xs ${item.checked ? 'text-emerald-500' : 'text-muted-foreground'}`}>
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