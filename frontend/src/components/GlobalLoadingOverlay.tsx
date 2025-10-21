import { useEffect } from 'react';
import { Loader2, FileText } from 'lucide-react';
import { useLoadingStore } from '../store/useLoadingStore';

const GlobalLoadingOverlay = () => {
  const { isLoading, loadingMessage, loadingSubMessage } = useLoadingStore();

  // Prevent scrolling when loading overlay is active
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" />
      
      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center space-y-6 p-8 rounded-2xl bg-card border border-border shadow-2xl max-w-md mx-4 animate-in zoom-in-95 duration-300">
        {/* Animated Icon Container */}
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin" 
               style={{ animationDuration: '3s' }} />
          
          {/* Middle pulsing ring */}
          <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" />
          
          {/* Inner icon container */}
          <div className="relative rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 p-6 border border-primary/30">
            <FileText className="h-10 w-10 text-primary animate-pulse" />
          </div>
          
          {/* Spinning loader overlay */}
          <div className="absolute -top-1 -right-1">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-3">
          <h3 className="text-xl font-semibold text-foreground">
            {loadingMessage}
          </h3>
          
          {loadingSubMessage && (
            <p className="text-sm text-muted-foreground max-w-sm">
              {loadingSubMessage}
            </p>
          )}
          
          {/* Progress dots animation */}
          <div className="flex items-center justify-center space-x-1.5 pt-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Additional info */}
        <div className="text-xs text-muted-foreground text-center">
          Please wait, do not close this window
        </div>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;

