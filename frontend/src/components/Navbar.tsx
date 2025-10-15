import { Link, useLocation } from 'react-router-dom';
import { Briefcase, BookmarkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CV-Express
            </span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Briefcase className="h-4 w-4" />
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

