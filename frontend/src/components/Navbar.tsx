import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, BookmarkIcon, FileText, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import UploadResumeDialog from './UploadResumeDialog';
import { useAuthStore } from '@/store/useAuthStore';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
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
              <span>Search Jobs</span>
            </Link>
            
            <Link
              to="/saved"
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                location.pathname === '/saved' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <BookmarkIcon className="h-4 w-4" />
              <span>Saved Jobs</span>
            </Link>

            <UploadResumeDialog />

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 border-l pl-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
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

