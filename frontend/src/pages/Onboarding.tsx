import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Check, Briefcase, MapPin, DollarSign, FileText } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Predefined job roles for the dropdown
const PREDEFINED_ROLES = [
  'Software Engineer',
  'Senior Software Engineer',
  'Staff Software Engineer',
  'Principal Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Site Reliability Engineer',
  'Data Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'AI Engineer',
  'Product Manager',
  'Technical Product Manager',
  'Engineering Manager',
  'Director of Engineering',
  'CTO',
  'QA Engineer',
  'Test Engineer',
  'Security Engineer',
  'Mobile Developer',
  'iOS Developer',
  'Android Developer',
  'UI/UX Designer',
  'Product Designer',
  'System Administrator',
  'Database Administrator',
  'Cloud Architect',
  'Solutions Architect',
  'Business Analyst',
  'Technical Writer'
].sort();

// Predefined countries
const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Netherlands',
  'Spain',
  'Italy',
  'Switzerland',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Ireland',
  'Belgium',
  'Austria',
  'Portugal',
  'Poland',
  'Australia',
  'New Zealand',
  'Singapore',
  'Japan',
  'South Korea',
  'India',
  'Brazil',
  'Mexico',
  'Argentina',
  'Chile',
  'Remote'
].sort();

interface OnboardingData {
  // Work Preferences
  desiredRoles: string[];
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'any';
  
  // Location
  location: string;
  desiredLocations: string[];
  willingToRelocate: boolean;
  
  // Salary & Availability
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  availabilityDate?: string;
  noticePeriod?: string;
  
  // Additional
  workAuthorization: string;
  yearsOfExperience: number;
  currentJobTitle?: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [emailConnected, setEmailConnected] = useState(false);
  const [emailProvider, setEmailProvider] = useState<'gmail' | 'outlook' | null>(null);

  const [formData, setFormData] = useState<OnboardingData>({
    desiredRoles: [],
    remotePreference: 'any',
    location: '',
    desiredLocations: [],
    willingToRelocate: false,
    salaryCurrency: 'USD',
    workAuthorization: '',
    yearsOfExperience: 0,
  });

  const [roleInput, setRoleInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [filteredRoles, setFilteredRoles] = useState(PREDEFINED_ROLES);

  const totalSteps = 5;

  const handleAddRole = () => {
    if (roleInput.trim() && !formData.desiredRoles.includes(roleInput.trim())) {
      setFormData({
        ...formData,
        desiredRoles: [...formData.desiredRoles, roleInput.trim()]
      });
      setRoleInput('');
    }
  };

  const handleRemoveRole = (role: string) => {
    setFormData({
      ...formData,
      desiredRoles: formData.desiredRoles.filter(r => r !== role)
    });
  };

  const handleAddLocation = () => {
    if (locationInput.trim() && !formData.desiredLocations.includes(locationInput.trim())) {
      setFormData({
        ...formData,
        desiredLocations: [...formData.desiredLocations, locationInput.trim()]
      });
      setLocationInput('');
    }
  };

  const handleRemoveLocation = (location: string) => {
    setFormData({
      ...formData,
      desiredLocations: formData.desiredLocations.filter(l => l !== location)
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEmailConnect = (provider: 'gmail' | 'outlook') => {
    setEmailProvider(provider);
    // Redirect to OAuth flow
    window.location.href = `${API_URL}/api/email-oauth/connect?provider=${provider}`;
  };

  // Check for OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('email_oauth') === 'success') {
      setEmailConnected(true);
      toast.success('Email connected successfully!');
      // Remove the query parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error') === 'email_oauth_failed') {
      toast.error('Failed to connect email. Please try again.');
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Prepare profile update payload
      const profileUpdate = {
        profile: {
          location: formData.location,
          yearsOfExperience: formData.yearsOfExperience,
          currentJobTitle: formData.currentJobTitle,
        },
        jobPreferences: {
          desiredRoles: formData.desiredRoles,
          desiredLocations: formData.desiredLocations,
          remotePreference: formData.remotePreference,
          salaryExpectations: {
            min: formData.salaryMin,
            max: formData.salaryMax,
            currency: formData.salaryCurrency
          },
          workAuthorization: formData.workAuthorization,
          availabilityDate: formData.availabilityDate ? new Date(formData.availabilityDate) : undefined,
          willingToRelocate: formData.willingToRelocate,
          noticePeriod: formData.noticePeriod
        },
        onboardingCompleted: true
      };

      await axios.patch(`${API_URL}/auth/profile`, profileUpdate, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Profile setup completed!');
      navigate('/');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.response?.data?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect Your Email</h2>
              <p className="text-muted-foreground">Connect your email to receive application updates and notifications</p>
            </div>

            {!emailConnected ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-6">
                    Choose your email provider to get started
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    onClick={() => handleEmailConnect('gmail')}
                    variant="outline"
                    className="h-16 text-left justify-start"
                    disabled={loading}
                  >
                    <div className="flex items-center space-x-4">
                      <svg className="w-8 h-8" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <div>
                        <div className="font-semibold">Connect Gmail</div>
                        <div className="text-sm text-muted-foreground">Use your Gmail account</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleEmailConnect('outlook')}
                    variant="outline"
                    className="h-16 text-left justify-start"
                    disabled={loading}
                  >
                    <div className="flex items-center space-x-4">
                      <svg className="w-8 h-8" viewBox="0 0 24 24">
                        <path fill="#0078D4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      <div>
                        <div className="font-semibold">Connect Outlook</div>
                        <div className="text-sm text-muted-foreground">Use your Outlook/Microsoft account</div>
                      </div>
                    </div>
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    We'll only access your email to sync job-related notifications. Your data is secure and encrypted.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Email Connected!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your {emailProvider} account is now connected and ready to receive job notifications.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                <Briefcase className="w-8 h-8 text-purple-600 dark:text-purple-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Work Preferences</h2>
              <p className="text-muted-foreground">Tell us what kind of roles you're looking for</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Desired Roles</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Input
                      list="roles-datalist"
                      placeholder="Search and select a role"
                      value={roleInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setRoleInput(value);
                        // Filter roles based on input
                        if (value) {
                          const filtered = PREDEFINED_ROLES.filter(role =>
                            role.toLowerCase().includes(value.toLowerCase())
                          );
                          setFilteredRoles(filtered);
                        } else {
                          setFilteredRoles(PREDEFINED_ROLES);
                        }
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                    />
                    <datalist id="roles-datalist">
                      {filteredRoles.map((role) => (
                        <option key={role} value={role} />
                      ))}
                    </datalist>
                  </div>
                  <Button onClick={handleAddRole} type="button">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.desiredRoles.map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-1"
                    >
                      {role}
                      <button onClick={() => handleRemoveRole(role)} className="hover:text-red-600">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>Work Arrangement Preference</Label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {['remote', 'hybrid', 'onsite', 'any'].map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setFormData({ ...formData, remotePreference: pref as any })}
                      className={`p-3 border rounded-lg text-center capitalize ${
                        formData.remotePreference === pref
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Current Job Title (Optional)</Label>
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.currentJobTitle || ''}
                  onChange={(e) => setFormData({ ...formData, currentJobTitle: e.target.value })}
                />
              </div>

              <div>
                <Label>Years of Experience *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 5"
                  min="0"
                  required
                  value={formData.yearsOfExperience}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      setFormData({ ...formData, yearsOfExperience: value });
                    } else if (e.target.value === '') {
                      setFormData({ ...formData, yearsOfExperience: 0 });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Location Preferences</h2>
              <p className="text-muted-foreground">Where would you like to work?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Current Location</Label>
                <div className="relative">
                  <Input
                    list="countries-datalist"
                    placeholder="Search and select a country"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                  <datalist id="countries-datalist">
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <Label>Desired Locations (Optional)</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Input
                      list="desired-countries-datalist"
                      placeholder="Search and select locations"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                    />
                    <datalist id="desired-countries-datalist">
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country} />
                      ))}
                    </datalist>
                  </div>
                  <Button onClick={handleAddLocation} type="button">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.desiredLocations.map((location) => (
                    <span
                      key={location}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-1"
                    >
                      {location}
                      <button onClick={() => handleRemoveLocation(location)} className="hover:text-red-600">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="relocate"
                  checked={formData.willingToRelocate}
                  onChange={(e) => setFormData({ ...formData, willingToRelocate: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="relocate" className="cursor-pointer">
                  I'm willing to relocate for the right opportunity
                </Label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <DollarSign className="w-8 h-8 text-green-600 dark:text-green-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Salary & Availability</h2>
              <p className="text-muted-foreground">Help us find the right matches</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Salary Expectations (Optional)</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={formData.salaryMin || ''}
                    onChange={(e) => setFormData({ ...formData, salaryMin: parseInt(e.target.value) || undefined })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={formData.salaryMax || ''}
                    onChange={(e) => setFormData({ ...formData, salaryMax: parseInt(e.target.value) || undefined })}
                  />
                  <Select
                    value={formData.salaryCurrency}
                    onValueChange={(value) => setFormData({ ...formData, salaryCurrency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="CHF">CHF</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Available Start Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.availabilityDate || ''}
                  onChange={(e) => setFormData({ ...formData, availabilityDate: e.target.value })}
                />
              </div>

              <div>
                <Label>Notice Period (Optional)</Label>
                <Select
                  value={formData.noticePeriod || ''}
                  onValueChange={(value) => setFormData({ ...formData, noticePeriod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select notice period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="2-weeks">2 weeks</SelectItem>
                    <SelectItem value="1-month">1 month</SelectItem>
                    <SelectItem value="2-months">2 months</SelectItem>
                    <SelectItem value="3-months">3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 mb-4">
                <FileText className="w-8 h-8 text-orange-600 dark:text-orange-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Additional Details</h2>
              <p className="text-muted-foreground">Just a few more things</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Work Authorization</Label>
                <Input
                  placeholder="e.g., US Citizen, EU Work Permit, H1B"
                  value={formData.workAuthorization}
                  onChange={(e) => setFormData({ ...formData, workAuthorization: e.target.value })}
                />
              </div>

              <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-semibold mb-2">What's Next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>We'll use this information to match you with relevant jobs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Your dedicated application email has been generated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You can update these preferences anytime in settings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-cyan-50 dark:from-purple-950 dark:via-indigo-950 dark:to-cyan-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[0, 1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  step <= currentStep ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button 
              onClick={handleNext}
              disabled={currentStep === 0 && !emailConnected}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Complete Setup'}
            </Button>
          )}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
        </div>
      </Card>
    </div>
  );
}

