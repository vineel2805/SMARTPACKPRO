import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Sun, Moon, Monitor, LogOut, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

export function StudentProfile() {
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
    <div className="min-h-screen bg-[#F3F5F9] text-[#1E2A44] pb-20" style={{ fontFamily: 'Inter, sans-serif' }}>
      <header className="sticky top-0 z-10 border-b border-[#E1E6EF] bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          <Link
            to="/student"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D9DEE8] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[20px] font-semibold">Profile</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-4 px-4 py-5">
        <section className="rounded-3xl bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.07)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4F46E5,#5B5FF2)] text-white">
              <UserIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold">{user?.name}</h2>
              <p className="text-[13px] text-[#677489]">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-2 border-t border-[#E3E7EE] pt-3 text-[14px]">
            <div className="flex items-center justify-between">
              <span className="text-[#677489]">Class</span>
              <span className="font-medium">{user?.class}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#677489]">School</span>
              <span className="font-medium">{user?.school}</span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.07)]">
          <h3 className="mb-3 text-[16px] font-semibold">Appearance</h3>
          <div className="space-y-2">
            {themeOptions.map(option => {
              const Icon = option.icon;
              const isSelected = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-[14px] ${
                    isSelected
                      ? 'border-[#5B5FF2] bg-[#E9ECFF] text-[#4F46E5]'
                      : 'border-[#DCE2EC] bg-white text-[#2F3B52]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-4.5 w-4.5" />
                    {option.label}
                  </span>
                  {isSelected && <span className="text-[12px] font-semibold">Selected</span>}
                </button>
              );
            })}
          </div>
        </section>

        <button
          onClick={handleLogout}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#F4C4C4] bg-[#FDEEEE] text-[14px] font-semibold text-[#DC2626]"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </main>
    </div>
  );
}
