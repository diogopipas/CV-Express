import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Zap, 
  Target, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  FileText,
  Search,
  Rocket,
  Shield,
  Clock,
  BarChart3,
  Brain,
  Globe
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const Home = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-purple-500/10 border border-teal-500/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]"></div>
        
        {/* Animated Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative px-8 py-24 md:py-32">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-sm font-medium animate-fade-in-up">
              <Sparkles className="h-4 w-4" />
              AI-Powered Job Search Platform
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Land Your Dream Job with{' '}
              <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Automation
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Upload your resume, let AI analyze your skills, and automatically apply to thousands of 
              matching jobs across LinkedIn, Indeed, and Glassdoor. Your personal job application assistant.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/jobs">
                <Button 
                  size="lg" 
                  className="group bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-lg shadow-teal-500/30 text-base px-8"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Jobs Scanned</div>
              </div>
              <div className="space-y-1 border-x border-border/50">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  3
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Platforms</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Automation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30">
            <Zap className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From resume analysis to automated applications, we've got you covered
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 p-6 hover:border-teal-500/30 transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
            <div className="relative space-y-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 w-fit border border-teal-500/30">
                <Brain className="h-6 w-6 text-teal-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">AI Resume Analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Advanced AI extracts your skills, experience, and suggests perfect job roles tailored to your profile
                </p>
              </div>
            </div>
          </Card>

          {/* Feature 2 */}
          <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 p-6 hover:border-blue-500/30 transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <div className="relative space-y-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 w-fit border border-blue-500/30">
                <Search className="h-6 w-6 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Multi-Platform Search</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Scrape jobs from LinkedIn, Indeed, and Glassdoor simultaneously. One search, unlimited opportunities
                </p>
              </div>
            </div>
          </Card>

          {/* Feature 3 */}
          <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 p-6 hover:border-purple-500/30 transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
            <div className="relative space-y-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 w-fit border border-purple-500/30">
                <Rocket className="h-6 w-6 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Auto-Apply System</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Automatically apply to matching jobs with your resume. Save hours of manual applications
                </p>
              </div>
            </div>
          </Card>

          {/* Feature 4 */}
          <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 p-6 hover:border-emerald-500/30 transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="relative space-y-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 w-fit border border-emerald-500/30">
                <Target className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Smart Matching</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI matches your skills with job requirements. Only apply to jobs where you're a great fit
                </p>
              </div>
            </div>
          </Card>

          {/* Feature 5 */}
          <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 p-6 hover:border-amber-500/30 transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
            <div className="relative space-y-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 w-fit border border-amber-500/30">
                <BarChart3 className="h-6 w-6 text-amber-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Real-Time Analytics</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Track applications, success rates, and queue status. Full transparency on your job search progress
                </p>
              </div>
            </div>
          </Card>

          {/* Feature 6 */}
          <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 p-6 hover:border-rose-500/30 transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
            <div className="relative space-y-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 w-fit border border-rose-500/30">
                <Shield className="h-6 w-6 text-rose-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Secure & Private</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your resume and data are encrypted and secure. We never share your information with third parties
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
            <Clock className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Get Started in{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              3 Easy Steps
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 text-8xl font-bold text-teal-500/10">1</div>
            <div className="relative space-y-4 text-center">
              <div className="mx-auto p-4 rounded-2xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 w-fit border border-teal-500/30">
                <FileText className="h-10 w-10 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold">Upload Resume</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload your PDF resume and let our AI analyze your skills, experience, and career goals
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 text-8xl font-bold text-blue-500/10">2</div>
            <div className="relative space-y-4 text-center">
              <div className="mx-auto p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 w-fit border border-blue-500/30">
                <Search className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">AI Finds Jobs</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our system searches thousands of jobs across multiple platforms matching your profile
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 text-8xl font-bold text-purple-500/10">3</div>
            <div className="relative space-y-4 text-center">
              <div className="mx-auto p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 w-fit border border-purple-500/30">
                <CheckCircle className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold">Auto-Apply</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sit back while we automatically apply to matching jobs. Track everything in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/30">
            <Globe className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-medium text-teal-400">Supported Platforms</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Search Across{' '}
            <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              Top Platforms
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="group flex items-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all hover:scale-105">
            <Briefcase className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-semibold text-blue-400">LinkedIn</span>
          </div>
          <div className="group flex items-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:scale-105">
            <Briefcase className="h-8 w-8 text-emerald-400" />
            <span className="text-xl font-semibold text-emerald-400">Indeed</span>
          </div>
          <div className="group flex items-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105">
            <Briefcase className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-semibold text-purple-400">Glassdoor</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-purple-500/10 border border-teal-500/20">
        <div className="absolute inset-0 bg-grid-white/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative px-8 py-20 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to{' '}
              <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Transform
              </span>
              <br />
              Your Job Search?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of job seekers who are landing their dream jobs with AI-powered automation
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/jobs">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-lg shadow-teal-500/30 text-base px-8"
              >
                Start Applying Now
                <Rocket className="ml-2 h-5 w-5 group-hover:translate-y-[-2px] transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-teal-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <span>Free plan available</span>
            </div>
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-purple-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

