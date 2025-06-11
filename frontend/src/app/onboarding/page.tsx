"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { Checkbox } from "../../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";

type Role = 'employee' | 'manager' | 'hr';

interface Preferences {
  weeklyInsights: boolean;
  managerCheckIns: boolean;
  teamTrends: boolean;
  teamAlerts?: boolean;
  orgTrends?: boolean;
  teamReports?: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'role' | 'consent' | 'preferences'>('role');
  const [role, setRole] = useState<Role>('employee');
  const [dataConsent, setDataConsent] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    weeklyInsights: true,
    managerCheckIns: true,
    teamTrends: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role: role,
          data_consent_given: dataConsent,
          preferences: preferences
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Preferences saved successfully!');
      router.push('/'); // Redirect to dashboard after onboarding
    } catch (error) {
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">What's your role?</h2>
        <p className="text-gray-600">This helps us personalize your experience</p>
      </div>

      <RadioGroup value={role} onValueChange={(value: Role) => setRole(value)} className="space-y-4">
        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value="employee" id="employee" />
          <div className="space-y-1">
            <Label htmlFor="employee" className="text-base font-medium">Individual Contributor</Label>
            <p className="text-sm text-gray-500">
              Track your personal wellbeing, receive insights, and share with your manager when comfortable.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value="manager" id="manager" />
          <div className="space-y-1">
            <Label htmlFor="manager" className="text-base font-medium">Team Manager</Label>
            <p className="text-sm text-gray-500">
              Monitor team wellbeing trends, receive alerts, and support your team's mental health.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value="hr" id="hr" />
          <div className="space-y-1">
            <Label htmlFor="hr" className="text-base font-medium">HR Professional</Label>
            <p className="text-sm text-gray-500">
              Access organization-wide insights and support company-wide wellbeing initiatives.
            </p>
          </div>
        </div>
      </RadioGroup>

      <Button
        onClick={() => setStep('consent')}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );

  const renderDataConsent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Data & Privacy</h2>
        <p className="text-gray-600">Your data is private and secure</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="dataConsent"
            checked={dataConsent}
            onCheckedChange={(checked: boolean) => setDataConsent(checked)}
          />
          <div className="space-y-1">
            <Label htmlFor="dataConsent" className="text-base">
              I consent to Tend collecting and processing my wellbeing data
            </Label>
            <p className="text-sm text-gray-500">
              This includes calendar data, communication patterns, and wellbeing insights. Your data is private and secure.
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep('role')}
          >
            Back
          </Button>
          <Button
            onClick={() => setStep('preferences')}
            disabled={!dataConsent}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Notification Preferences</h2>
        <p className="text-gray-600">Choose what you'd like to be notified about</p>
      </div>

      <div className="space-y-4">
        {role === 'employee' && (
          <>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="weeklyInsights"
                checked={preferences.weeklyInsights}
                onCheckedChange={(checked: boolean) => setPreferences(prev => ({ ...prev, weeklyInsights: checked }))}
              />
              <Label htmlFor="weeklyInsights">Weekly wellbeing insights</Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="managerCheckIns"
                checked={preferences.managerCheckIns}
                onCheckedChange={(checked: boolean) => setPreferences(prev => ({ ...prev, managerCheckIns: checked }))}
              />
              <Label htmlFor="managerCheckIns">Manager check-in requests</Label>
            </div>
          </>
        )}

        {role === 'manager' && (
          <>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="teamTrends"
                checked={preferences.teamTrends}
                onCheckedChange={(checked: boolean) => setPreferences(prev => ({ ...prev, teamTrends: checked }))}
              />
              <Label htmlFor="teamTrends">Team wellbeing trends</Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="teamAlerts"
                checked={preferences.teamAlerts}
                onCheckedChange={(checked: boolean) => setPreferences(prev => ({ ...prev, teamAlerts: checked }))}
              />
              <Label htmlFor="teamAlerts">Team wellbeing alerts</Label>
            </div>
          </>
        )}

        {role === 'hr' && (
          <>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="orgTrends"
                checked={preferences.orgTrends}
                onCheckedChange={(checked: boolean) => setPreferences(prev => ({ ...prev, orgTrends: checked }))}
              />
              <Label htmlFor="orgTrends">Organization-wide trends</Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="teamReports"
                checked={preferences.teamReports}
                onCheckedChange={(checked: boolean) => setPreferences(prev => ({ ...prev, teamReports: checked }))}
              />
              <Label htmlFor="teamReports">Team wellbeing reports</Label>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('consent')}
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Complete Setup'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Tend</h1>
          <p className="mt-2 text-gray-600">Let's set up your experience</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {step === 'role' && renderRoleSelection()}
            {step === 'consent' && renderDataConsent()}
            {step === 'preferences' && renderPreferences()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 