import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, BarChart3, User } from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { path: "/add-transaction", icon: PlusCircle, label: "Add" },
  { path: "/reports", icon: BarChart3, label: "Reports" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-strong border-t border-white/20 z-50 pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-mobile-${item.label.toLowerCase()}`}
            >
              <div
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isActive ? "gradient-primary shadow-md" : ""
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${isActive ? "text-white" : ""}`}
                  />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
