import { useEffect, useState } from 'react';
import { Award, Plus, Users } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { AddTeacherModal } from './AddTeacherModal';
import { toast } from 'sonner';
import { getClasses, getTeachers, updateTeacherAssignments } from '../../services/firestoreService';
import type { AppUser } from '../../types/models';

export function TeachersManagement() {
  const [teachers, setTeachers] = useState<AppUser[]>([]);
  const [allClasses, setAllClasses] = useState<string[]>([]);
  const [savingTeacherId, setSavingTeacherId] = useState<string | null>(null);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editAssignedClasses, setEditAssignedClasses] = useState<string[]>([]);
  const [editClassTeacherOf, setEditClassTeacherOf] = useState('');
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);

  async function loadTeachers() {
    try {
      const [teacherData, classData] = await Promise.all([getTeachers(), getClasses()]);
      setTeachers(teacherData);
      setAllClasses(classData);
    } catch {
      toast.error('Failed to load teachers from database');
    }
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleTeacherCreated = async () => {
    await loadTeachers();
  };

  const startEditingTeacher = (teacher: AppUser) => {
    setEditingTeacherId(teacher.id);
    setEditAssignedClasses(teacher.assignedClasses ?? []);
    setEditClassTeacherOf(teacher.classTeacherOf ?? '');
  };

  const cancelEditingTeacher = () => {
    setEditingTeacherId(null);
    setEditAssignedClasses([]);
    setEditClassTeacherOf('');
  };

  const toggleClassSelection = (className: string) => {
    setEditAssignedClasses(prev =>
      prev.includes(className) ? prev.filter(item => item !== className) : [...prev, className],
    );
  };

  const handleSaveAssignments = async (teacher: AppUser) => {
    const normalizedClassTeacherOf = editClassTeacherOf.trim();
    const assignedClasses = Array.from(new Set(editAssignedClasses));

    if (normalizedClassTeacherOf && !assignedClasses.includes(normalizedClassTeacherOf)) {
      toast.error('Class teacher class must be in assigned classes');
      return;
    }

    setSavingTeacherId(teacher.id);
    try {
      await updateTeacherAssignments({
        teacherId: teacher.id,
        assignedClasses,
        isClassTeacher: Boolean(normalizedClassTeacherOf),
        classTeacherOf: normalizedClassTeacherOf || undefined,
      });

      toast.success('Teacher assignments updated');
      cancelEditingTeacher();
      await loadTeachers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update teacher assignments';
      toast.error(message);
    } finally {
      setSavingTeacherId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#1E2A44]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
        <header className="mb-5 rounded-3xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#667085]">Admin Panel</p>
              <h1 className="text-[24px] font-semibold">Teachers Management</h1>
              <p className="mt-1 text-[14px] text-[#677489]">Manage teacher roles and class assignments</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#DCE2EC] bg-white px-4 text-[13px] font-semibold text-[#2F3B52]"
              >
                Back to Dashboard
              </Link>
              <Button
                onClick={() => setShowAddTeacherModal(true)}
                className="h-10 rounded-xl bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] px-4 text-[13px] font-semibold text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
            </div>
          </div>
        </header>

        <section className="rounded-3xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#E9ECFF] text-[#4F46E5]">
              <Users className="h-4.5 w-4.5" />
            </span>
            <h2 className="text-[17px] font-semibold">Teachers ({teachers.length})</h2>
          </div>

          <div className="space-y-3">
            {teachers.map(teacher => (
              <div key={teacher.id} className="rounded-2xl border border-[#E3E7EE] bg-[#F8FAFC] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[15px] font-semibold text-[#2F3B52]">{teacher.name}</p>
                    <p className="text-[13px] text-[#677489]">{teacher.subject || 'No subject assigned'}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(teacher.assignedClasses ?? []).map(cls => (
                        <span
                          key={cls}
                          className="rounded-full border border-[#C8CEFC] bg-[#E9ECFF] px-2.5 py-1 text-[11px] font-semibold text-[#4F46E5]"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-[12px]">
                      {teacher.isClassTeacher ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#BFE7CF] bg-[#EAF8F0] px-2.5 py-1 font-semibold text-[#15803D]">
                          <Award className="h-3.5 w-3.5" />
                          Class Teacher ({teacher.classTeacherOf})
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-[#DCE2EC] bg-white px-2.5 py-1 font-semibold text-[#677489]">
                          Subject Teacher
                        </span>
                      )}
                    </div>
                  </div>

                  {editingTeacherId === teacher.id ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleSaveAssignments(teacher)}
                        disabled={savingTeacherId === teacher.id}
                        className="h-9 rounded-lg border-[#DCE2EC] bg-white text-[#2F3B52]"
                      >
                        {savingTeacherId === teacher.id ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={cancelEditingTeacher}
                        disabled={savingTeacherId === teacher.id}
                        className="h-9 rounded-lg text-[#677489]"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => startEditingTeacher(teacher)}
                      className="h-9 rounded-lg border-[#DCE2EC] bg-white text-[#2F3B52]"
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {editingTeacherId === teacher.id && (
                  <div className="mt-4 space-y-3 rounded-xl border border-[#E3E7EE] bg-white p-3">
                    <div>
                      <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#677489]">Assign Classes</p>
                      <div className="flex flex-wrap gap-2">
                        {allClasses.map(className => (
                          <button
                            key={className}
                            onClick={() => toggleClassSelection(className)}
                            className={`h-8 rounded-full border px-3 text-[12px] font-semibold ${
                              editAssignedClasses.includes(className)
                                ? 'border-transparent bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] text-white'
                                : 'border-[#DCE2EC] bg-white text-[#2F3B52]'
                            }`}
                          >
                            {className}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#677489]">Class Teacher Of (Optional)</p>
                      <select
                        value={editClassTeacherOf}
                        onChange={event => setEditClassTeacherOf(event.target.value)}
                        className="h-10 w-full rounded-xl border border-[#DCE2EC] bg-white px-3 text-[13px] text-[#2F3B52] outline-none focus:border-[#5B5FF2]"
                      >
                        <option value="">Not a class teacher</option>
                        {editAssignedClasses.map(className => (
                          <option key={className} value={className}>
                            {className}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <AddTeacherModal
        open={showAddTeacherModal}
        onOpenChange={setShowAddTeacherModal}
        onTeacherCreated={handleTeacherCreated}
        subjects={[
          'Mathematics',
          'Science',
          'English',
          'Social Studies',
          'Hindi',
          'Physics',
          'Chemistry',
          'Biology',
          'Computer Science',
        ]}
        classes={allClasses}
      />
    </div>
  );
}
