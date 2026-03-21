import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { createTeacher } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface AddTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeacherCreated?: () => void;
  subjects: string[];
  classes: string[];
}

export function AddTeacherModal({
  open,
  onOpenChange,
  onTeacherCreated,
  subjects,
  classes,
}: AddTeacherModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    subject: '',
    assignedClasses: [] as string[],
    isClassTeacher: false,
    classTeacherOf: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleClassSelection = (className: string) => {
    setFormData(prev => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(className)
        ? prev.assignedClasses.filter(c => c !== className)
        : [...prev.assignedClasses, className],
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Teacher name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Invalid email format';
    if (!formData.password.trim()) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.subject) return 'Subject is required';
    if (formData.assignedClasses.length === 0) return 'At least one class must be assigned';
    if (formData.isClassTeacher && !formData.classTeacherOf) return 'Class teacher assignment required';
    if (formData.isClassTeacher && !formData.assignedClasses.includes(formData.classTeacherOf)) {
      return 'Class teacher class must be in assigned classes';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    if (!user?.school) {
      toast.error('School information not found');
      return;
    }

    setIsLoading(true);
    try {
      await createTeacher({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        subject: formData.subject,
        school: user.school,
        assignedClasses: formData.assignedClasses,
        isClassTeacher: formData.isClassTeacher,
        classTeacherOf: formData.isClassTeacher ? formData.classTeacherOf : null,
      });

      toast.success(`Teacher "${formData.name}" created successfully!`);
      onOpenChange(false);
      onTeacherCreated?.();

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        subject: '',
        assignedClasses: [],
        isClassTeacher: false,
        classTeacherOf: '',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create teacher';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>Create a new teacher account with subject and class assignments</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground/80">Basic Information</h3>

            <div>
              <label className="text-sm text-muted-foreground block mb-2">Full Name *</label>
              <Input
                placeholder="e.g., Nithya Menon"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-2">Email *</label>
              <Input
                type="email"
                placeholder="teacher@school.edu"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-zinc-400 block mb-2">Password *</label>
                <Input
                  type="password"
                  placeholder="Teach@123"
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-2">Confirm Password *</label>
                <Input
                  type="password"
                  placeholder="Teach@123"
                  value={formData.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Subject Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-zinc-300">Subject Assignment</h3>

            <div>
              <label className="text-sm text-zinc-400 block mb-2">Subject *</label>
              <Select value={formData.subject} onValueChange={value => handleInputChange('subject', value)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject} className="text-foreground">
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Class Assignment Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-zinc-300">Class Assignment</h3>

            <div>
              <label className="text-sm text-zinc-400 block mb-2">Assign Classes *</label>
              <div className="flex flex-wrap gap-2 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                {classes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No classes available</p>
                ) : (
                  classes.map(cls => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => toggleClassSelection(cls)}
                      disabled={isLoading}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        formData.assignedClasses.includes(cls)
                          ? 'bg-indigo-600 text-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {cls}
                    </button>
                  ))
                )}
              </div>
              {formData.assignedClasses.length > 0 && (
                <p className="text-xs text-muted-foreground/70 mt-2">
                  Selected: {formData.assignedClasses.join(', ')}
                </p>
              )}
            </div>

            {/* Class Teacher Section */}
            <div className="border-t border-zinc-700 pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isClassTeacher"
                  checked={formData.isClassTeacher}
                  onChange={e => {
                    handleInputChange('isClassTeacher', e.target.checked ? 'true' : 'false');
                    if (!e.target.checked) {
                      handleInputChange('classTeacherOf', '');
                    }
                  }}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 cursor-pointer"
                />
                <label htmlFor="isClassTeacher" className="text-sm font-medium text-muted-foreground/80 cursor-pointer">
                  Make this teacher a class teacher
                </label>
              </div>

              {formData.isClassTeacher && formData.assignedClasses.length > 0 && (
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">Class Teacher Of *</label>
                  <Select value={formData.classTeacherOf} onValueChange={value => handleInputChange('classTeacherOf', value)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {formData.assignedClasses.map(cls => (
                        <SelectItem key={cls} value={cls} className="text-foreground">
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end border-t border-zinc-700 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-border text-muted-foreground hover:bg-muted/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isLoading ? 'Creating...' : 'Create Teacher'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
