import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  BookOpen,
  BookText,
  ChartNoAxesColumn,
  Check,
  ChevronRight,
  CircleHelp,
  LogOut,
  Menu,
  NotebookPen,
  Package,
  Settings,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  getTodayPackingItems,
  recordStudentSeen,
  recordStudentProgress,
} from '../../services/firestoreService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import type { StudentChecklistItem } from '../../types/models';

export function TodaysBag() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<StudentChecklistItem[]>([]);
  const [customItems, setCustomItems] = useState<StudentChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllItems, setShowAllItems] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSubjects, setShowSubjects] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const progressSectionRef = useRef<HTMLElement | null>(null);

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
  const requiredItems = [...bringItems, ...customItems];
  const checkedCount = requiredItems.filter(item => item.checked).length;
  const totalCount = requiredItems.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
  const estimatedSavedWeightKg = (doNotBringItems.length * 0.4).toFixed(1);
  const subjects = useMemo(
    () => Array.from(new Set(requiredItems.map(item => item.subject).filter(Boolean))),
    [requiredItems],
  );
  const studentName = user?.name ?? 'Student';
  const studentClass = user?.class ? `Grade ${String(user.class).replace(/^Grade\s*/i, '')}` : 'Class';
  const initials = studentName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const notifications = useMemo(
    () => [
      `${checkedCount} of ${totalCount} items packed today.`,
      doNotBringItems.length > 0
        ? `${doNotBringItems.length} items can be skipped to reduce bag weight.`
        : 'No skip recommendations for today.',
      totalCount - checkedCount > 0
        ? `${totalCount - checkedCount} required items still pending.`
        : 'Great job! All required items are packed.',
    ],
    [checkedCount, totalCount, doNotBringItems.length],
  );

  const toggleItemChecked = (id: string) => {
    const isCustom = customItems.some(item => item.id === id);

    let nextCheckedCount = checkedCount;

    if (isCustom) {
      const updated = customItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      );

      const nextCustom = updated.filter(item => item.checked).length;
      const nextBring = bringItems.filter(item => item.checked).length;
      nextCheckedCount = nextCustom + nextBring;

      setCustomItems(updated);
      localStorage.setItem('customItems', JSON.stringify(updated));
    } else {
      const updatedItems = items.map(item => (item.id === id ? { ...item, checked: !item.checked } : item));
      const nextBring = updatedItems.filter(item => item.type === 'bring' && item.checked).length;
      const nextCustom = customItems.filter(item => item.checked).length;
      nextCheckedCount = nextBring + nextCustom;
      setItems(updatedItems);
    }

    if (user?.id && user?.name && user?.class) {
      recordStudentProgress(user.id, user.name, user.class, nextCheckedCount).catch(console.error);
    }
  };

  const closeMenuAnd = (callback: () => void) => {
    setShowMenu(false);
    window.setTimeout(callback, 120);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProgressMenuTap = () => {
    closeMenuAnd(() => {
      progressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] text-[#1F2937]">
        <div className="mx-auto w-full max-w-md px-5 pt-5 pb-6">
          <p className="text-[13px] text-[#6B7280]">Loading your packing list...</p>
        </div>
      </div>
    );
  }

  if (totalCount === 0 && doNotBringItems.length === 0) {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] text-[#1F2937]">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-5 pb-6">
          <header className="flex h-16 items-center justify-between">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setShowMenu(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#1F2937]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-[22px] font-semibold">Today's Bag</h1>
            <button
              type="button"
              aria-label="Open notifications"
              onClick={() => setShowNotifications(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#1F2937]"
            >
              <Bell className="h-5 w-5" />
            </button>
          </header>

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="rounded-full bg-[#E8EEF9] px-4 py-2 text-[13px] font-medium text-[#1F2937]">
              {today}
            </div>
            <button
              type="button"
              onClick={() => setShowAllItems(true)}
              className="h-10 rounded-full border border-[#2563EB] px-4 text-[13px] font-medium text-[#2563EB]"
            >
              View Full List
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <Package className="mx-auto h-10 w-10 text-[#6B7280]" />
              <p className="mt-4 text-[13px] text-[#6B7280]">No items assigned today.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC] text-[#1F2937]">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-5 pb-6">
        <header className="h-16">
          <div className="flex h-full items-center justify-between">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setShowMenu(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#1F2937] transition-colors hover:bg-[#E8EEF9] active:scale-95"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-[22px] font-semibold">Today's Bag</h1>
            <button
              type="button"
              aria-label="Open notifications"
              onClick={() => setShowNotifications(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#1F2937] transition-colors hover:bg-[#E8EEF9] active:scale-95"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-4 min-w-4 rounded-full bg-[#EF4444] px-1 text-[10px] leading-4 text-white">
                2
              </span>
            </button>
          </div>
        </header>

        <main className="mt-4 flex flex-1 flex-col gap-4">
          <section className="flex items-center justify-between gap-3">
            <div className="rounded-full bg-[#E8EEF9] px-4 py-2 text-[13px] font-medium text-[#1F2937]">
              {today}
            </div>
            <button
              type="button"
              onClick={() => setShowAllItems(true)}
              className="h-10 rounded-full border border-[#2563EB] px-4 text-[13px] font-medium text-[#2563EB] transition-colors hover:bg-[#EFF6FF]"
            >
              View Full List
            </button>
          </section>

          <section ref={progressSectionRef} className="rounded-2xl bg-white px-4 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-[6px] border-[#DBEAFE] text-[24px] font-semibold text-[#1F2937]">
                {checkedCount}/{totalCount || 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-medium text-[#1F2937]">Packing Progress</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-full rounded-full bg-[#2563EB] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-[13px] text-[#6B7280]">{Math.round(progress)}% Completed</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[16px] font-medium tracking-[0.02em] text-[#1E3A8A]">PACK THESE TODAY</h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">These items are required for today's classes</p>

            <div className="mt-3 space-y-3">
              {requiredItems.map(item => {
                const Icon = (item.subject || '').toLowerCase().includes('math') ? NotebookPen : BookText;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItemChecked(item.id)}
                    className="flex h-[68px] w-full items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-3 text-left shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-all duration-150 hover:-translate-y-[1px] hover:shadow-[0_8px_18px_rgba(15,23,42,0.10)] active:scale-[0.99]"
                    aria-label={`${item.checked ? 'Unmark' : 'Mark'} ${item.name} as packed`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-[#1F2937]">{item.name}</p>
                      <p className="truncate text-[13px] text-[#6B7280]">{item.subject ?? 'School Item'}</p>
                    </div>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl border-2 transition-colors ${
                        item.checked
                          ? 'border-[#22C55E] bg-[#22C55E] text-white'
                          : 'border-[#9CA3AF] bg-white text-transparent'
                      }`}
                      role="checkbox"
                      aria-checked={item.checked}
                    >
                      <Check className="h-4 w-4" />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {doNotBringItems.length > 0 && (
            <section>
              <h2 className="text-[16px] font-medium tracking-[0.02em] text-[#B45309]">SKIP THESE TODAY</h2>
              <p className="mt-1 text-[13px] text-[#6B7280]">Not required - leave these at home & save weight</p>

              <div className="mt-3 rounded-2xl bg-[#FFF7ED] p-4">
                <p className="text-[15px] font-medium text-[#92400E]">Save ~{estimatedSavedWeightKg} kg</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {doNotBringItems.map(item => (
                    <span
                      key={item.id}
                      className="rounded-full border border-[#FDBA74] bg-white px-3 py-1.5 text-[13px] text-[#92400E]"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
          </section>
          )}

          <section className="mt-auto rounded-xl bg-[#EFF6FF] px-4 py-3 text-[13px] text-[#1E3A8A]">
            Tap an item to mark it packed
          </section>
        </main>

        {showAllItems && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
            <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-[0_20px_48px_rgba(15,23,42,0.22)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-medium text-[#1F2937]">Full Checklist</h2>
                <button
                  type="button"
                  onClick={() => setShowAllItems(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB]"
                >
                  <X className="h-4 w-4 text-[#6B7280]" />
                </button>
              </div>

              <div className="space-y-3">
                {requiredItems.map(item => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className={`${item.checked ? 'text-[#6B7280] line-through' : 'text-[#1F2937]'}`}>{item.name}</p>
                      {item.subject && <p className="mt-0.5 text-xs text-[#6B7280]">{item.subject}</p>}
                    </div>
                    <span className={`text-xs ${item.checked ? 'text-[#22C55E]' : 'text-[#6B7280]'}`}>
                      {item.checked ? 'Packed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showNotifications && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-[0_20px_48px_rgba(15,23,42,0.22)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[16px] font-medium text-[#1F2937]">Notifications</h2>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB]"
                >
                  <X className="h-4 w-4 text-[#6B7280]" />
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map((note, index) => (
                  <div key={index} className="rounded-xl bg-[#F8FAFC] px-3 py-2 text-[13px] text-[#374151]">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showSubjects && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-[0_20px_48px_rgba(15,23,42,0.22)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[16px] font-medium text-[#1F2937]">My Subjects</h2>
                <button
                  type="button"
                  onClick={() => setShowSubjects(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB]"
                >
                  <X className="h-4 w-4 text-[#6B7280]" />
                </button>
              </div>

              <div className="space-y-2">
                {(subjects.length ? subjects : ['General']).map(subject => (
                  <div key={subject} className="rounded-xl bg-[#F8FAFC] px-3 py-2 text-[13px] font-medium text-[#1F2937]">
                    {subject}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showMenu && (
          <div className="fixed inset-0 z-30 flex bg-black/35" onClick={() => setShowMenu(false)}>
            <aside
              className="flex h-full w-[82%] max-w-[320px] flex-col bg-[#F8FAFC] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.22)]"
              onClick={event => event.stopPropagation()}
            >
              <div className="rounded-2xl bg-[#EAF0FF] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-[16px] font-semibold text-white">
                    {initials}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#1F2937]">{studentName}</p>
                    <p className="text-[13px] text-[#4B5563]">{studentClass}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => closeMenuAnd(() => setShowSubjects(true))}
                  className="flex h-12 w-full items-center justify-between rounded-xl px-3 text-left text-[#1F2937] hover:bg-white"
                >
                  <span className="flex items-center gap-3 text-[15px]">
                    <BookOpen className="h-5 w-5 text-[#2563EB]" />
                    My Subjects
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                </button>

                <button
                  type="button"
                  onClick={() => closeMenuAnd(() => setShowNotifications(true))}
                  className="flex h-12 w-full items-center justify-between rounded-xl px-3 text-left text-[#1F2937] hover:bg-white"
                >
                  <span className="flex items-center gap-3 text-[15px]">
                    <Bell className="h-5 w-5 text-[#2563EB]" />
                    Notifications
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                </button>
              </div>

              <div className="my-3 h-px bg-[#E5E7EB]" />

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleProgressMenuTap}
                  className="flex h-12 w-full items-center justify-between rounded-xl px-3 text-left text-[#1F2937] hover:bg-white"
                >
                  <span className="flex items-center gap-3 text-[15px]">
                    <ChartNoAxesColumn className="h-5 w-5 text-[#2563EB]" />
                    Progress
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                </button>
              </div>

              <div className="my-3 h-px bg-[#E5E7EB]" />

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => closeMenuAnd(() => navigate('/student/profile'))}
                  className="flex h-12 w-full items-center justify-between rounded-xl px-3 text-left text-[#1F2937] hover:bg-white"
                >
                  <span className="flex items-center gap-3 text-[15px]">
                    <Settings className="h-5 w-5 text-[#2563EB]" />
                    Settings
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                </button>

                <button
                  type="button"
                  onClick={() => closeMenuAnd(() => navigate('/help'))}
                  className="flex h-12 w-full items-center justify-between rounded-xl px-3 text-left text-[#1F2937] hover:bg-white"
                >
                  <span className="flex items-center gap-3 text-[15px]">
                    <CircleHelp className="h-5 w-5 text-[#2563EB]" />
                    Help / Support
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                </button>
              </div>

              <div className="mt-auto pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] text-[#EF4444] hover:bg-white"
                >
                  <LogOut className="h-5 w-5" />
                  Log Out
                </button>
              </div>
            </aside>
          </div>
        )}

        <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Log out of Smart Pack?</AlertDialogTitle>
              <AlertDialogDescription>
                You will need to sign in again to access your student dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}