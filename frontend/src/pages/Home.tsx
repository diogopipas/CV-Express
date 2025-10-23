import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Zap, 
  Target, 
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

const Home = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-lg bg-card border border-border">
        <div className="px-8 py-24 md:py-32">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              AI-Powered Job Search Platform
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Land Your Dream Job with{' '}
              <span className="text-gradient-purple-cyan">
                AI Automation
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Upload your resume, let AI analyze your skills, and automatically apply to thousands of 
              matching jobs across multiple job platforms. Your personal job application assistant.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/jobs">
                <Button 
                  size="lg" 
                  className="group text-base px-8"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-8">
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  10K+
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Jobs Scanned</div>
              </div>
              <div className="space-y-1 border-x border-border/50">
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  3
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Platforms</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-bold text-foreground">
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Everything You Need to{' '}
            <span className="text-gradient-purple-cyan">
              Succeed
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From resume analysis to automated applications, we've got you covered
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="p-6 hover:border-primary/30 transition-all duration-300">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted w-fit border border-border">
                <Brain className="h-6 w-6 text-primary" />
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
          <Card className="p-6 hover:border-primary/30 transition-all duration-300">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted w-fit border border-border">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Multi-Platform Search</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Search jobs from multiple platforms simultaneously. One search, unlimited opportunities
                </p>
              </div>
            </div>
          </Card>

          {/* Feature 3 */}
          <Card className="p-6 hover:border-primary/30 transition-all duration-300">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted w-fit border border-border">
                <Rocket className="h-6 w-6 text-primary" />
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
          <Card className="p-6 hover:border-primary/30 transition-all duration-300">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted w-fit border border-border">
                <Target className="h-6 w-6 text-primary" />
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
          <Card className="p-6 hover:border-primary/30 transition-all duration-300">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted w-fit border border-border">
                <BarChart3 className="h-6 w-6 text-primary" />
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
          <Card className="p-6 hover:border-primary/30 transition-all duration-300">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted w-fit border border-border">
                <Shield className="h-6 w-6 text-primary" />
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Get Started in{' '}
            <span className="text-gradient-purple-cyan">
              3 Easy Steps
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="space-y-4 text-center">
            <div className="mx-auto p-4 rounded-lg bg-muted w-fit border border-border">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Upload Resume</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload your PDF resume and let our AI analyze your skills, experience, and career goals
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-4 text-center">
            <div className="mx-auto p-4 rounded-lg bg-muted w-fit border border-border">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">AI Finds Jobs</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our system searches thousands of jobs across multiple platforms matching your profile
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-4 text-center">
            <div className="mx-auto p-4 rounded-lg bg-muted w-fit border border-border">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Auto-Apply</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sit back while we automatically apply to matching jobs. Track everything in real-time
            </p>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">Supported Platforms</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Search Across{' '}
            <span className="text-gradient-purple-cyan">
              Top Platforms
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-3 px-6 py-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-all">
            <Briefcase className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">Adzuna</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-all">
            <Briefcase className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">Arbeitnow</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-all">
            <Briefcase className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">JSearch</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-lg bg-card border border-border">
        <div className="px-8 py-20 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to{' '}
              <span className="text-gradient-purple-cyan">
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
                className="group text-base px-8"
              >
                Start Applying Now
                <Rocket className="ml-2 h-5 w-5 group-hover:translate-y-[-2px] transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Free plan available</span>
            </div>
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

