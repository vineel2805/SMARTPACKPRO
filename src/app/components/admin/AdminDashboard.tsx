import { useEffect, useMemo, useState } from 'react';
import { Users, School, AlertTriangle, Settings } from 'lucide-react';
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
          getRecentHistory(3),
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r border-border min-h-screen bg-card">
          <div className="p-6">
            <h1 className="text-xl font-semibold text-foreground">Smart Pack App</h1>
            <p className="text-sm text-muted-foreground mt-1">Admin Panel</p>
          </div>
          <nav className="px-3 space-y-1">
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary"
            >
              <School className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              to="/admin/teachers"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Users className="w-5 h-5" />
              Teachers
            </Link>
            <Link
              to="/admin/checklist-audit"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <AlertTriangle className="w-5 h-5" />
              Checklist Audit
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <header className="border-b border-border px-6 py-4 flex justify-between items-center bg-card">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Overview of school management</p>
            </div>
            <Button
              onClick={() => setShowKeywordSettings(true)}
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-secondary"
            >
              <Settings className="w-4 h-4 mr-2" />
              Subject Keywords
            </Button>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-secondary rounded-xl border border-border p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground">{totalTeachers}</p>
                    <p className="text-sm text-muted-foreground">Total Teachers</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary rounded-xl border border-border p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <School className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground">{totalClasses}</p>
                    <p className="text-sm text-muted-foreground">Total Classes</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary rounded-xl border border-border p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground">{classTeachers}</p>
                    <p className="text-sm text-muted-foreground">Class Teachers</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Alerts */}
            {unassignedClasses > 0 && (
              <section>
                <h3 className="font-semibold mb-3 text-foreground">Alerts</h3>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-600 dark:text-yellow-500">Missing Class Teachers</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {unassignedClasses} {unassignedClasses === 1 ? 'class has' : 'classes have'} no assigned class teacher
                      </p>
                    </div>
                    <Link to="/admin/teachers">
                      <Button size="sm" variant="outline" className="border-yellow-500/20 hover:bg-yellow-500/10">
                        Assign
                      </Button>
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Recent Activity */}
            <section>
              <h3 className="font-semibold mb-3 text-foreground">Recent Activity</h3>
              <div className="bg-card rounded-xl border border-border divide-y divide-border">
                {recentHistory.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground">No recent activity found.</div>
                )}

                {recentHistory.map(entry => (
                  <div key={entry.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{entry.teacherName || 'Teacher'}</p>
                        <p className="text-sm text-muted-foreground">Updated items for Class {entry.class}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Keyword Settings Dialog */}
      <Dialog open={showKeywordSettings} onOpenChange={setShowKeywordSettings}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Subject Keyword Configuration</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Configure keywords for each subject to prevent cross-subject teacher updates
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
