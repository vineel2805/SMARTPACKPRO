import { Users, School, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { mockTeachers, mockClasses } from '../../data/mockData';

export function AdminDashboard() {
  const totalTeachers = mockTeachers.length;
  const totalClasses = mockClasses.length;
  const classTeachers = mockTeachers.filter(t => t.isClassTeacher).length;
  const unassignedClasses = mockClasses.length - classTeachers;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r border-zinc-800 min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-semibold">Smart Pack App</h1>
            <p className="text-sm text-zinc-500 mt-1">Admin Panel</p>
          </div>
          <nav className="px-3 space-y-1">
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-400"
            >
              <School className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              to="/admin/teachers"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
            >
              <Users className="w-5 h-5" />
              Teachers
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <header className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <p className="text-sm text-zinc-400 mt-0.5">Overview of school management</p>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold">{totalTeachers}</p>
                    <p className="text-sm text-zinc-400">Total Teachers</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <School className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold">{totalClasses}</p>
                    <p className="text-sm text-zinc-400">Total Classes</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold">{classTeachers}</p>
                    <p className="text-sm text-zinc-400">Class Teachers</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Alerts */}
            {unassignedClasses > 0 && (
              <section>
                <h3 className="font-semibold mb-3">Alerts</h3>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-500">Missing Class Teachers</p>
                      <p className="text-sm text-zinc-400 mt-1">
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
              <h3 className="font-semibold mb-3">Recent Activity</h3>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Dr. Sarah Johnson</p>
                      <p className="text-sm text-zinc-400">Updated items for Class 6-A</p>
                    </div>
                    <p className="text-xs text-zinc-500">2 hours ago</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Mr. David Chen</p>
                      <p className="text-sm text-zinc-400">Updated items for Class 6-B</p>
                    </div>
                    <p className="text-xs text-zinc-500">5 hours ago</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Ms. Emily Rodriguez</p>
                      <p className="text-sm text-zinc-400">Updated items for Class 7-A</p>
                    </div>
                    <p className="text-xs text-zinc-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
