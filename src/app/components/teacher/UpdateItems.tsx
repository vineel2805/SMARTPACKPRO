import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowLeft,
  Ban,
  BookOpen,
  BookText,
  Calculator,
  Check,
  CircleMinus,
  Compass,
  GraduationCap,
  Info,
  Lock,
  NotebookPen,
  PencilRuler,
  Plus,
  Proportions,
  Send,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { getClasses, getQuickSuggestions, submitTeacherUpdates } from '../../services/firestoreService';

interface Item {
  id: string;
  name: string;
  type: 'bring' | 'do-not-bring';
  subject?: string;
}

export function UpdateItems() {
  const { user } = useAuth();

  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [action, setAction] = useState<'bring' | 'do-not-bring'>('bring');
  const [items, setItems] = useState<Item[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const teacherSubject = (user?.subject ?? '').trim();

  const availableClasses = useMemo(() => {
    const assigned = user?.assignedClasses ?? [];
    return assigned.length ? assigned : classes;
  }, [user?.assignedClasses, classes]);

  useEffect(() => {
    async function loadClasses() {
      try {
        const fromDb = await getClasses();
        setClasses(fromDb);

        const defaultClass = user?.assignedClasses?.[0] ?? fromDb[0] ?? '';
        setSelectedClasses(defaultClass ? [defaultClass] : []);
      } catch {
        toast.error('Unable to load classes from database');
      }
    }

    loadClasses();
  }, [user?.assignedClasses]);

  const quickSuggestions = useMemo(
    () => getQuickSuggestions({ subject: teacherSubject, scope: teacherSubject ? 'subject' : 'general' }),
    [teacherSubject],
  );

  const toggleClassSelection = (className: string) => {
    setSelectedClasses(prev =>
      prev.includes(className)
        ? prev.filter(item => item !== className)
        : [...prev, className],
    );
  };

  const normalizeName = (name: string) => name.trim().toLowerCase();

  const setItemType = (name: string, type: Item['type']) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const itemSubject = teacherSubject || undefined;

    setItems(prev => {
      const sameIndex = prev.findIndex(
        item =>
          normalizeName(item.name) === normalizeName(trimmed) &&
          (item.subject ?? '') === (itemSubject ?? ''),
      );

      if (sameIndex >= 0) {
        const cloned = [...prev];
        cloned[sameIndex] = {
          ...cloned[sameIndex],
          type,
        };
        return cloned;
      }

      return [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: trimmed,
          type,
          subject: itemSubject,
        },
      ];
    });

    setInputValue('');
  };

  const addFromCurrentAction = (name: string) => {
    setItemType(name, action);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const bringItems = items.filter(item => item.type === 'bring');
  const doNotBringItems = items.filter(item => item.type === 'do-not-bring');

  const suggestionUsed = (name: string) =>
    items.some(item => normalizeName(item.name) === normalizeName(name));

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (selectedClasses.length === 0) {
      toast.error('Please select at least one class');
      return;
    }

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsSaving(true);

    try {
      const roleType: 'class-teacher' | 'subject-teacher' = teacherSubject ? 'subject-teacher' : 'class-teacher';

      await submitTeacherUpdates({
        classNames: selectedClasses,
        items,
        teacherId: user.id,
        teacherName: user.name,
        teacherRoleType: roleType,
        teacherSubject: teacherSubject || undefined,
      });

      toast.success('Update sent successfully', {
        description: `${selectedClasses.length} class(es) updated`,
      });

      setItems([]);
      setInputValue('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save items to database';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const quickIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('textbook')) return BookText;
    if (n.includes('notebook')) return NotebookPen;
    if (n.includes('calculator')) return Calculator;
    if (n.includes('ruler')) return PencilRuler;
    if (n.includes('compass')) return Compass;
    if (n.includes('protractor')) return Proportions;
    return BookOpen;
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#1E2A44]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mx-auto w-full max-w-md px-4 pt-4 pb-28">
        <header className="mb-4 flex items-center gap-3">
          <Link
            to="/teacher"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D9DEE8] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-semibold leading-7 text-[#1E2A44]">Update Packing Items</h1>
            <p className="text-[13px] leading-5 text-[#677489]">Send instructions for students today.</p>
          </div>

          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] text-white shadow-[0_10px_18px_rgba(79,70,229,0.35)]">
            <Lock className="h-5 w-5" />
          </div>
        </header>

        {teacherSubject && (
          <section className="mb-4 rounded-2xl bg-[#EEF0F7] p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#DDE2FF] text-[#4F46E5]">
                  <BookOpen className="h-5 w-5" />
                </span>
                <p className="text-[16px] font-semibold text-[#1E2A44]">Subject: {teacherSubject}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E6E8FF] px-2.5 py-1 text-[12px] font-medium text-[#6366F1]">
                <Info className="h-3.5 w-3.5" />
                Auto-selected
              </span>
            </div>
          </section>
        )}

        <section className="mb-4 rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.07)]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#DDE2FF] text-[#5B5FF2]">
                <GraduationCap className="h-5 w-5" />
              </span>
              <h2 className="text-[17px] font-semibold text-[#1E2A44]">Classes</h2>
            </div>
            <span className="rounded-full bg-[#E9ECFF] px-3 py-1 text-[13px] font-semibold text-[#4F46E5]">
              {selectedClasses.length} selected {selectedClasses.length > 0 ? '✓' : ''}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableClasses.map(cls => {
              const selected = selectedClasses.includes(cls);
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => toggleClassSelection(cls)}
                  className={`inline-flex h-11 items-center gap-1.5 rounded-full border px-4 text-[14px] font-medium transition-colors ${
                    selected
                      ? 'border-transparent bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] text-white shadow-[0_8px_16px_rgba(79,70,229,0.3)]'
                      : 'border-[#C8CEDB] bg-white text-[#303C53]'
                  }`}
                >
                  {selected && <Check className="h-4 w-4" />}
                  {cls}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-4 rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.07)]">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#DDF6E8] text-[#16A34A]">
              <Check className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-[17px] font-semibold text-[#1E2A44]">Instruction</h2>
              <p className="text-[13px] text-[#677489]">What should students do?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAction('bring')}
              className={`h-12 rounded-2xl border px-4 text-[15px] font-semibold transition-colors ${
                action === 'bring'
                  ? 'border-transparent bg-[#16A34A] text-white'
                  : 'border-[#C8CEDB] bg-white text-[#303C53]'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Check className="h-4.5 w-4.5" />
                Bring
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAction('do-not-bring')}
              className={`h-12 rounded-2xl border px-4 text-[15px] font-semibold transition-colors ${
                action === 'do-not-bring'
                  ? 'border-[#EF4444] bg-[#FDECEC] text-[#DC2626]'
                  : 'border-[#EF4444] bg-white text-[#DC2626]'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Ban className="h-4.5 w-4.5" />
                Don't bring
              </span>
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.07)]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#DDE2FF] text-[#5B5FF2]">
                <Lock className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-[17px] font-semibold text-[#1E2A44]">Items</h2>
                <p className="text-[13px] text-[#677489]">Choose what to bring or not to bring</p>
              </div>
            </div>
            <span className="rounded-full bg-[#E9ECFF] px-3 py-1 text-[13px] font-semibold text-[#4F46E5]">
              {items.length} items selected
            </span>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {quickSuggestions.map(suggestion => {
              const selected = suggestionUsed(suggestion);
              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addFromCurrentAction(suggestion)}
                  className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    selected
                      ? 'border-[#B8C0D0] bg-[#F3F5FA] text-[#4A556A]'
                      : 'border-[#C8CEDB] bg-white text-[#4A556A]'
                  }`}
                >
                  {suggestion}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#BFE7CF] bg-[#EAF8F0] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[13px] font-bold text-[#15803D]">BRING ITEMS</p>
                <span className="text-[12px] font-semibold text-[#15803D]">{bringItems.length} items</span>
              </div>

              <div className="space-y-2">
                {bringItems.map(item => {
                  const Icon = quickIcon(item.name);
                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-white/80 px-2.5 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#DDF6E8] text-[#16A34A]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate text-[14px] font-medium text-[#1E2A44]">{item.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setItemType(item.name, 'do-not-bring')}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#16A34A] text-white"
                        aria-label={`Move ${item.name} to don't bring`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-[#F4C4C4] bg-[#FDEEEE] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[13px] font-bold text-[#DC2626]">DON'T BRING ITEMS</p>
                <span className="text-[12px] font-semibold text-[#DC2626]">{doNotBringItems.length} items</span>
              </div>

              <div className="space-y-2">
                {doNotBringItems.map(item => {
                  const Icon = quickIcon(item.name);
                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-white/80 px-2.5 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#FBD4D4] text-[#DC2626]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate text-[14px] font-medium text-[#1E2A44]">{item.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setItemType(item.name, 'bring')}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#EF4444] text-white"
                        aria-label={`Move ${item.name} to bring`}
                      >
                        <CircleMinus className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <>
              <div className="my-4 h-px bg-[#E3E7EE]" />

              

              
            </>
          )}

          <div className="mt-4">
            <p className="mb-2 text-[16px] font-semibold text-[#1E2A44]">Add Custom Item</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={event => setInputValue(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && addFromCurrentAction(inputValue)}
                placeholder="Enter item name..."
                className="h-12 flex-1 rounded-xl border border-[#C8CEDB] bg-white px-3.5 text-[14px] text-[#1E2A44] outline-none placeholder:text-[#8A94A8] focus:border-[#6366F1]"
              />
              <button
                type="button"
                onClick={() => addFromCurrentAction(inputValue)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] text-white"
                aria-label="Add custom item"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <div className="fixed bottom-16 left-0 right-0 z-20 px-4 pb-3">
          <div className="mx-auto w-full max-w-md">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={items.length === 0 || isSaving || selectedClasses.length === 0}
              className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(79,70,229,0.32)] disabled:opacity-50 disabled:shadow-none"
            >
              <Send className="mr-2 h-4.5 w-4.5" />
              {isSaving
                ? 'Sending...'
                : `Send Update to ${selectedClasses[0] ?? 'Class'}${selectedClasses.length > 1 ? ` +${selectedClasses.length - 1}` : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
