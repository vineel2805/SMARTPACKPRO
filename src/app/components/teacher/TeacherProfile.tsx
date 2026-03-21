import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import { ArrowLeft, Sun, Moon, Monitor, LogOut, User as UserIcon, HelpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

export function TeacherProfile() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <header className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link to="/teacher">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-semibold">Profile</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* User Info */}
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{user?.name}</h2>
              <p className="text-sm text-zinc-400">{user?.email}</p>
            </div>
          </div>
          
          <div className="space-y-2 pt-4 border-t border-zinc-800">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Subject</span>
              <span className="font-medium">{user?.subject}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">School</span>
              <span className="font-medium">{user?.school}</span>
            </div>
          </div>
        </section>

        {/* Assigned Classes */}
        <section>
          <h3 className="font-semibold mb-3">Assigned Classes</h3>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <div className="flex flex-wrap gap-2">
              {user?.assignedClasses?.map(cls => (
                <div
                  key={cls}
                  className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-sm border border-indigo-500/20"
                >
                  {cls}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <h3 className="font-semibold mb-3">Appearance</h3>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            {themeOptions.map((option, index) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`w-full flex items-center justify-between p-4 transition-colors ${
                    index !== themeOptions.length - 1 ? 'border-b border-zinc-800' : ''
                  } ${isSelected ? 'bg-indigo-500/10' : 'hover:bg-zinc-800/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-zinc-400'}`} />
                    <span className={isSelected ? 'text-white' : 'text-zinc-300'}>
                      {option.label}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Help & Support */}
        <section>
          <Link to="/help">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 border-zinc-800 hover:bg-zinc-800/50"
            >
              <HelpCircle className="w-5 h-5" />
              Help & Support
            </Button>
          </Link>
        </section>

        {/* Logout */}
        <section>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3 border-zinc-800 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </section>
      </main>
    </div>
  );
}
