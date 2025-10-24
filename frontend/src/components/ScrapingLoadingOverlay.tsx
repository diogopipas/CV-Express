import { useEffect, useState } from 'react';
import { Search, Globe, Database, Zap } from 'lucide-react';
import { Progress } from './ui/progress';
import { useLoadingStore } from '../store/useLoadingStore';

interface ScrapingStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // in milliseconds
}

const ScrapingLoadingOverlay = () => {
  const { isLoading, loadingMessage, loadingSubMessage } = useLoadingStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const scrapingSteps: ScrapingStep[] = [
    {
      id: 'search',
      name: 'Searching Jobs',
      description: 'Querying multiple job platforms',
      icon: <Search className="h-5 w-5" />,
      duration: 3000
    },
    {
      id: 'scrape',
      name: 'Scraping Data',
      description: 'Extracting job details and requirements',
      icon: <Globe className="h-5 w-5" />,
      duration: 4000
    },
    {
      id: 'process',
      name: 'Processing',
      description: 'Analyzing and matching jobs',
      icon: <Database className="h-5 w-5" />,
      duration: 3000
    },
    {
      id: 'complete',
      name: 'Finalizing',
      description: 'Preparing results for display',
      icon: <Zap className="h-5 w-5" />,
      duration: 2000
    }
  ];

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    let stepIndex = 0;
    let stepStartTime = Date.now();
    const totalDuration = scrapingSteps.reduce((sum, step) => sum + step.duration, 0);

    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - stepStartTime;
      const currentStepDuration = scrapingSteps[stepIndex]?.duration || 1000;

      // Update overall progress
      let totalElapsed = 0;
      for (let i = 0; i < stepIndex; i++) {
        totalElapsed += scrapingSteps[i].duration;
      }
      totalElapsed += elapsed;
      const overallProgress = Math.min((totalElapsed / totalDuration) * 100, 100);
      setProgress(overallProgress);

      // Move to next step if current step is complete
      if (elapsed >= currentStepDuration && stepIndex < scrapingSteps.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
        stepStartTime = now;
      }
    };

    const interval = setInterval(updateProgress, 50);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm animate-in fade-in duration-200" />
      
      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 p-8 rounded-2xl bg-card border border-border shadow-2xl max-w-lg mx-4 animate-in zoom-in-95 duration-300">
        {/* Animated Icon Container */}
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin" 
               style={{ animationDuration: '2s' }} />
          
          {/* Middle pulsing ring */}
          <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" />
          
          {/* Inner icon container */}
          <div className="relative rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 p-6 border border-primary/30">
            <Search className="h-10 w-10 text-primary animate-pulse" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-semibold text-foreground">
            {loadingMessage || 'Searching for Jobs'}
          </h3>
          
          {loadingSubMessage && (
            <p className="text-sm text-muted-foreground max-w-sm">
              {loadingSubMessage}
            </p>
          )}
        </div>

        {/* Progress Section */}
        <div className="w-full space-y-6">
          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Current Step */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg border transition-all duration-300 ${
                  currentStep < scrapingSteps.length 
                    ? 'bg-primary/10 border-primary/30 text-primary' 
                    : 'bg-muted border-border text-muted-foreground'
                }`}>
                  {scrapingSteps[currentStep]?.icon}
                </div>
                <div>
                  <h4 className="font-medium text-sm">
                    {scrapingSteps[currentStep]?.name || 'Complete'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {scrapingSteps[currentStep]?.description || 'All done!'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-2">
            {scrapingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index < currentStep 
                    ? 'bg-green-500' 
                    : index === currentStep 
                    ? 'bg-primary animate-pulse' 
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Additional info */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <div>Please wait, do not close this window</div>
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapingLoadingOverlay;
