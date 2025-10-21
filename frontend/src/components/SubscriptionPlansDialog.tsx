import { useState } from 'react';
import { Check, Zap, Crown, Sparkles, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface SubscriptionPlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanSelected: (plan: 'free' | 'pro' | 'enterprise') => void;
  title?: string;
  description?: string;
}

const SubscriptionPlansDialog = ({
  open,
  onOpenChange,
  onPlanSelected,
  title = 'Choose Your Plan',
  description = 'Select the perfect plan for your job search journey'
}: SubscriptionPlansDialogProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'enterprise' | null>(null);

  const plans = [
    {
      id: 'free' as const,
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      icon: Sparkles,
      color: 'from-gray-500 to-gray-600',
      borderColor: 'border-gray-500/30',
      bgColor: 'bg-gray-500/10',
      features: [
        { text: 'Up to 5 CVs', included: true },
        { text: '50 job searches per month', included: true },
        { text: 'Basic AI matching', included: true },
        { text: 'Email support', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Priority support', included: false },
        { text: 'Custom branding', included: false },
      ],
      popular: false,
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      price: '$19',
      period: 'per month',
      description: 'Best for serious job seekers',
      icon: Zap,
      color: 'from-teal-500 to-blue-500',
      borderColor: 'border-teal-500/50',
      bgColor: 'bg-teal-500/10',
      features: [
        { text: 'Unlimited CVs', included: true },
        { text: 'Unlimited job searches', included: true },
        { text: 'Advanced AI matching', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Resume optimization tips', included: true },
        { text: 'Application tracking', included: true },
      ],
      popular: true,
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      description: 'For teams and agencies',
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-500/30',
      bgColor: 'bg-purple-500/10',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Team collaboration (10 users)', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'White-label options', included: true },
        { text: 'Advanced reporting', included: true },
        { text: '24/7 phone support', included: true },
      ],
      popular: false,
    },
  ];

  const handleSelectPlan = (planId: 'free' | 'pro' | 'enterprise') => {
    setSelectedPlan(planId);
    // Small delay for visual feedback
    setTimeout(() => {
      onPlanSelected(planId);
      setSelectedPlan(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl border-border/50 bg-gradient-to-b from-background to-muted/20 p-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/30">
              <Crown className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{title}</DialogTitle>
              <DialogDescription className="text-base mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 bg-card p-6 transition-all duration-300 ${
                    isSelected
                      ? 'scale-105 shadow-2xl ' + plan.borderColor
                      : plan.popular
                      ? 'border-teal-500/50 shadow-lg shadow-teal-500/20'
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-teal-500 to-blue-500 text-white border-0 shadow-lg">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-5">
                    {/* Plan Header */}
                    <div className="text-center space-y-3">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.bgColor} border ${plan.borderColor}`}>
                        <Icon className="h-8 w-8 text-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.description}
                        </p>
                      </div>
                      <div className="pt-2">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold">{plan.price}</span>
                          <span className="text-muted-foreground text-sm">
                            / {plan.period}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 pt-4 border-t border-border/50">
                      {plan.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 ${
                            !feature.included ? 'opacity-40' : ''
                          }`}
                        >
                          {feature.included ? (
                            <div className="rounded-full bg-teal-500/20 p-1 mt-0.5">
                              <Check className="h-3 w-3 text-teal-400" />
                            </div>
                          ) : (
                            <div className="rounded-full bg-muted p-1 mt-0.5">
                              <X className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                          <span className="text-sm flex-1">{feature.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isSelected}
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-lg shadow-teal-500/30'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      {isSelected ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                          Loading...
                        </>
                      ) : plan.id === 'free' ? (
                        'Continue with Free'
                      ) : (
                        `Get ${plan.name}`
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include secure data storage and GDPR compliance
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              You can upgrade, downgrade, or cancel anytime
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionPlansDialog;

