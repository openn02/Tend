"use client";

import { Suspense, useState } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import SignalsOverview from "../components/dashboard/SignalsOverview";
import ManagerDashboard from "../components/dashboard/ManagerDashboard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useRole } from "../contexts/RoleContext";
import OverallWellbeingTrend from "../components/dashboard/OverallWellbeingTrend";

// Mock data for incoming nudge request
const mockIncomingNudgeRequest = {
  detected: true,
  message: "Your manager is concerned about team wellbeing trends and has sent a general request for check-ins. Would you like to share your recent wellbeing insights with them for a brief chat?",
};

export default function DashboardPage() {
  const { role } = useRole();
  const [incomingRequestState, setIncomingRequestState] = useState<'pending' | 'accepted' | 'declined' | 'none'>(mockIncomingNudgeRequest.detected ? 'pending' : 'none');
  const pendingNudgeRequestsCount = incomingRequestState === 'pending' ? 1 : 0;

  // Placeholder for user's name
  const userName = "Ollie"; // Replace with dynamic user name later
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-tr from-purple-200/80 via-purple-100/50 to-white/50" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <DashboardHeader
          pendingNudgeRequestsCount={pendingNudgeRequestsCount}
          incomingRequest={{ detected: mockIncomingNudgeRequest.detected, message: mockIncomingNudgeRequest.message, state: incomingRequestState }}
          setIncomingRequestState={setIncomingRequestState}
        />

        {/* Main Content Area */}
        <div className="mx-auto max-w-7xl px-8 pb-8">
          {/* Welcome Message */}
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8 mt-8">Welcome back, {userName}</h1>

          <Suspense fallback={<LoadingSpinner />}>
            {role === 'individual' ? (
              <>
                {/* Main Summary Area (Individual View Only) */}
                <div className="space-y-8 mb-8">
                  {/* Hero Banner: Weekly Message */}
                  <div className="w-full rounded-2xl p-6 bg-white shadow-sm border border-gray-200 text-gray-800 flex flex-col md:flex-row items-center justify-between">
                    <div className="text-xl font-semibold">You might be feeling a bit overloaded this week.</div>
                  </div>

                  {/* Overall Insight Card */}
                  <div className="w-full rounded-xl p-6 bg-white shadow-sm border border-gray-200 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl text-purple-500">🔻</span>
                      <span className="text-xl font-semibold text-gray-900">Overall wellbeing has dipped slightly this week.</span>
                    </div>
                    <div className="text-base text-gray-700 mb-4">
                      <span className="font-semibold">💡 Insight of the Week:</span> Prioritize recovery and focus time.
                    </div>
                    <button className="self-start px-4 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition">Try this: Block a no-meeting Friday [Add to calendar]</button>
                  </div>
                </div>

                {/* Individual Dashboard */}
                <SignalsOverview
                  incomingRequest={{ detected: mockIncomingNudgeRequest.detected, message: mockIncomingNudgeRequest.message, state: incomingRequestState }}
                  setIncomingRequestState={setIncomingRequestState}
                />

                {/* Overall Wellbeing Trend */}
                <div className="mt-8">
                  <OverallWellbeingTrend />
                </div>
              </>
            ) : role === 'manager' ? (
              <ManagerDashboard />
            ) : ( // HR View
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900">HR Dashboard</h2>
                <p className="mt-2 text-gray-600">Organization-wide wellbeing insights coming soon...</p>
              </div>
            )}
          </Suspense>

          {/* Privacy Note */}
          <div className="mt-8 text-xs text-gray-400 text-center">
            {role === 'manager' 
              ? "These insights reflect overall team trends. Tend does not track or share individual behavior."
              : "Your wellbeing insights are private to you."
            }
          </div>
        </div>
      </div>
    </div>
  );
}
