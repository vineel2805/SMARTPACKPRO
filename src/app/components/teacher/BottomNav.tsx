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
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-border">
      <div className="max-w-md mx-auto grid grid-cols-3">
        {links.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive ? 'text-indigo-400' : 'text-muted-foreground hover:text-foreground/80'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
