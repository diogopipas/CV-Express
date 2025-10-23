import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, FileText, LogOut, User, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">
              CV-Express
            </span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link
              to="/jobs"
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                location.pathname === '/jobs' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <FileText className="h-4 w-4" />
              <span>Jobs</span>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 border-l pl-4">
                <Link
                  to="/profile"
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === '/profile' ? 'text-primary' : 'text-foreground'
                  )}
                >
                  <User className="h-4 w-4" />
                  <span>{user?.name}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 border-l pl-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

