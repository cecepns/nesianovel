import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { mainNavigationItems, resolveActiveNavId } from '../config/navigation';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = resolveActiveNavId(location.pathname);

  const handleNavigation = (item) => {
    navigate(item.path);
  };

  const nav = (
    <nav
      aria-label="Navigasi utama"
      className="md:hidden fixed bottom-0 left-0 right-0 z-[49] w-full bg-[#0d071c]/95 border-t border-purple-900/30 backdrop-blur-lg pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
    >
      <div className="flex w-full items-center justify-around px-1 py-1.5">
        {mainNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigation(item)}
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-200 ${
                isActive
                  ? 'text-purple-400 font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`shrink-0 ${isActive ? 'h-5 w-5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'h-4 w-4'}`}
                  strokeWidth={isActive ? 2.3 : 1.8}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 text-[8px] font-extrabold bg-gradient-to-r from-purple-500 to-amber-500 text-white rounded-full leading-tight">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`line-clamp-1 w-full text-center text-[10px] leading-tight ${
                  isActive ? 'font-bold text-purple-300' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  return createPortal(nav, document.body);
};

export default BottomNavigation;
