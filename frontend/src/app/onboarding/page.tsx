"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { Checkbox } from "../../components/ui/checkbox";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [preferences, setPreferences] = useState({
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Tend</h1>
          <p className="mt-2 text-gray-600">Let's set up your preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="dataConsent"
                    checked={dataConsent}
                    onCheckedChange={(checked) => setDataConsent(checked as boolean)}
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

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="weeklyInsights"
                        checked={preferences.weeklyInsights}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, weeklyInsights: checked as boolean }))}
                      />
                      <Label htmlFor="weeklyInsights">Weekly wellbeing insights</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="managerCheckIns"
                        checked={preferences.managerCheckIns}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, managerCheckIns: checked as boolean }))}
                      />
                      <Label htmlFor="managerCheckIns">Manager check-in requests</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="teamTrends"
                        checked={preferences.teamTrends}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, teamTrends: checked as boolean }))}
                      />
                      <Label htmlFor="teamTrends">Team wellbeing trends</Label>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !dataConsent}
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 