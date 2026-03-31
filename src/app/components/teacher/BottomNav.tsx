import { Link, useLocation } from 'react-router';
import { Home, Edit, History as HistoryIcon } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();

  const links = [
    { to: '/teacher', label: 'Home', icon: Home },
    { to: '/teacher/update', label: 'Update', icon: Edit },
    { to: '/teacher/history', label: 'History', icon: HistoryIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#DEE3EC] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto grid w-full max-w-md grid-cols-3">
        {links.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`relative flex flex-col items-center gap-1 py-2.5 transition-colors ${
                isActive ? 'text-[#5B5FF2]' : 'text-[#7B879B]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[12px] font-medium">{link.label}</span>
              {isActive && <span className="absolute bottom-0 h-1 w-10 rounded-t-full bg-[#5B5FF2]" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
