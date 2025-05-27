"use client";

import { InformationCircleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Disclosure } from "@headlessui/react";

// Mock data - replace with API calls later
const mockScores = [
  {
    name: "Workload",
    label: "Elevated",
    labelColor: "text-yellow-600",
    trend: "rising",
    change: "+14%",
    description: "Tracks calendar and comms overload.",
    contributing: "18 meetings, 3 late nights, high Slack volume",
    nudge: "Block 2 hours of focus time on Friday.",
    actionType: "calendar",
    actionLabel: "Block in Calendar",
    actionUrl: "https://calendar.google.com/calendar/u/0/0/r/eventedit?text=Focus+Time&dates=20240614T090000Z/20240614T110000Z&details=Blocked+by+Tend+for+wellbeing&location=&sf=true",
    sources: "Calendar, Slack, After-hours activity",
    tooltip: "Workload is calculated from your meeting count, after-hours work, and Slack volume. Higher workload can increase stress.",
    heatmap: [
      { week: 1, status: "High", color: "bg-red-500" },
      { week: 2, status: "Elevated", color: "bg-yellow-500" },
      { week: 3, status: "Elevated", color: "bg-yellow-500" },
      { week: 4, status: "High", color: "bg-red-500" },
    ],
  },
  {
    name: "Sentiment",
    label: "Caution",
    labelColor: "text-orange-600",
    trend: "declining",
    change: "-8%",
    description: "Detects emotional tone and mood shifts.",
    contributing: "Tone dip, fewer emojis, less positive language",
    nudge: "Check in with yourself or a teammate.",
    actionType: "reflection",
    actionLabel: "Start Reflection",
    sources: "Slack, Email, Emoji/Reactions",
    tooltip: "Sentiment is based on the tone and emoji in your recent Slack, Email, and Team messages.",
    heatmap: [
      { week: 1, status: "Neutral", color: "bg-green-500" },
      { week: 2, status: "Neutral", color: "bg-green-500" },
      { week: 3, status: "Caution", color: "bg-orange-500" },
      { week: 4, status: "Caution", color: "bg-orange-500" },
    ],
  },
  {
    name: "Engagement",
    label: "Steady",
    labelColor: "text-green-600",
    trend: "stable",
    change: "+5%",
    description: "Monitors your rhythm and participation.",
    contributing: "Consistent replies, few missed meetings",
    nudge: "Take a break or try an async check-in.",
    actionType: "calendar",
    actionLabel: "Schedule Break",
    actionUrl: "https://calendar.google.com/calendar/u/0/0/r/eventedit?text=Break+Time&dates=20240614T120000Z/20240614T123000Z&details=Break+scheduled+by+Tend&location=&sf=true",
    sources: "Slack, Meetings, Response times",
    tooltip: "Engagement is based on your participation, meeting attendance, and response times.",
    heatmap: [
      { week: 1, status: "Steady", color: "bg-green-500" },
      { week: 2, status: "Steady", color: "bg-green-500" },
      { week: 3, status: "Steady", color: "bg-green-500" },
      { week: 4, status: "Steady", color: "bg-green-500" },
    ],
  },
  {
    name: "Recovery",
    label: "Low",
    labelColor: "text-red-600",
    trend: "declining",
    change: "-12%",
    description: "Reflects time away and recharge habits.",
    contributing: "4 late nights, no PTO, few breaks",
    nudge: "Take Friday morning to recover.",
    actionType: "calendar",
    actionLabel: "Block Recovery Time",
    actionUrl: "https://calendar.google.com/calendar/u/0/0/r/eventedit?text=Recovery+Time&dates=20240614T090000Z/20240614T120000Z&details=Recovery+time+blocked+by+Tend&location=&sf=true",
    sources: "Calendar, PTO, Digital silence windows",
    tooltip: "Recovery is based on your time away from work, PTO, and digital silence windows.",
    heatmap: [
      { week: 1, status: "Moderate", color: "bg-yellow-500" },
      { week: 2, status: "Low", color: "bg-red-500" },
      { week: 3, status: "Low", color: "bg-red-500" },
      { week: 4, status: "Low", color: "bg-red-500" },
    ],
  },
];

const trendIcons = {
  rising: <ArrowTrendingUpIcon className="h-5 w-5 text-orange-500 inline-block ml-1" title="Rising" />,
  declining: <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 inline-block ml-1" title="Declining" />,
  stable: <MinusIcon className="h-5 w-5 text-gray-400 inline-block ml-1" title="Stable" />,
};

const whyMatters = {
  Workload: "High workload can lead to stress and burnout. Balancing meetings, after-hours work, and Slack volume helps maintain wellbeing.",
  Sentiment: "Your emotional tone reflects your mood and engagement. Positive sentiment is linked to better wellbeing and team connection.",
  Engagement: "Staying engaged helps you feel connected and valued. Dips in engagement can signal the need for rest or support.",
  Recovery: "Recovery is essential for long-term wellbeing. Time away from work, breaks, and PTO help you recharge and prevent burnout.",
};

export default function SignalsOverview({
  incomingRequest,
  setIncomingRequestState,
}: { incomingRequest: any; setIncomingRequestState: (state: any) => void }) {
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [reflectionDone, setReflectionDone] = useState(false);
  const [reflectionValue, setReflectionValue] = useState("");

  const handleAcceptRequest = () => {
    console.log("Request accepted!");
    setIncomingRequestState('accepted');
  };

  const handleDeclineRequest = () => {
    console.log("Request declined.");
    setIncomingRequestState('declined');
  };

  return (
    <div className="space-y-8">

      {/* Incoming Nudge Request Banner */}
      {incomingRequest.detected && incomingRequest.state === 'pending' && (
        <div className="w-full rounded-xl p-4 bg-white shadow-sm border border-gray-200 text-gray-800 flex items-center justify-between">
          <div className="text-sm font-medium">{incomingRequest.message}</div>
          <div className="flex space-x-2">
            <button
              onClick={handleAcceptRequest}
              className="px-3 py-1 rounded-lg bg-purple-500 text-white text-xs font-medium hover:bg-purple-600 transition"
            >
              Accept
            </button>
            <button
              onClick={handleDeclineRequest}
              className="px-3 py-1 rounded-lg bg-gray-200 text-gray-800 text-xs font-medium hover:bg-gray-300 transition"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {mockScores.map((score) => {
          return (
            <div key={score.name} className="relative flex flex-col justify-between rounded-xl bg-white/80 shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-2">
                <p className="text-lg font-semibold text-gray-900 mr-2">{score.name}</p>
                 <span className="relative group mr-2">
                   <LockClosedIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <span className="absolute left-1/2 z-10 hidden w-64 -translate-x-1/2 rounded-md bg-white p-2 text-xs text-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
                      Only you can see this. Tend never shares your insights unless you choose to.
                    </span>
                 </span>
                 <span className="relative group">
                   <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-pointer" aria-hidden="true" />
                   <span className="absolute left-1/2 z-10 hidden w-64 -translate-x-1/2 rounded-md bg-white p-2 text-xs text-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
                     {score.tooltip}<br /><span className="text-gray-400">Data: {score.sources}</span>
                   </span>
                 </span>
              </div>
              <div className="flex items-center mb-1">
                <span className={`text-xl font-bold ${score.labelColor}`}>{score.label}</span>
                {trendIcons[score.trend as keyof typeof trendIcons]}
                <span className="ml-2 text-xs text-gray-500">{score.change} from last week</span>
              </div>
              <div className="mb-2 text-sm text-gray-600">{score.description}</div>

              {/* Heatmap */}
              <div className="flex gap-1 mb-4">
                {score.heatmap.map((week) => (
                  <div
                    key={week.week}
                    className={`w-8 h-2 rounded-full ${week.color}`}
                    title={`Week ${week.week}: ${week.status}`}
                  />
                ))}
              </div>

              {/* Collapsible Actions and Why it Matters */}
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="mt-2 text-xs text-purple-600 hover:underline focus:outline-none">
                      {open ? "Hide Details" : "View Details & Actions"}
                    </Disclosure.Button>
                    <Disclosure.Panel className="mt-2 text-xs text-gray-500 rounded p-3 space-y-3">
                      {/* Contributing Factors */}
                      <div>
                        <span className="font-medium text-gray-700">Contributing:</span> {score.contributing}
                      </div>
                      {/* Nudge and Action */}
                      <div className="text-indigo-700 font-medium flex items-center gap-2">
                         Nudge: {score.nudge}
                         {score.actionType === "calendar" && score.actionUrl && (
                           <a
                             href={score.actionUrl}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="ml-auto px-3 py-1 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-400 text-white text-xs font-semibold shadow hover:from-purple-600 hover:to-indigo-500 transition"
                           >
                             {score.actionLabel}
                           </a>
                         )}
                         {score.actionType === "reflection" && (
                           <>
                             <button
                               className="ml-auto px-3 py-1 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-400 text-white text-xs font-semibold shadow hover:from-purple-600 hover:to-indigo-500 transition"
                               onClick={() => setReflectionOpen(true)}
                              >
                                {score.actionLabel}
                             </button>
                             {/* Reflection Modal */}
                             {reflectionOpen && (
                               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                                 <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                                   <h3 className="text-lg font-semibold mb-2">Reflection</h3>
                                   <p className="text-sm text-gray-600 mb-4">What gave you energy this week?</p>
                                   <textarea
                                     className="w-full border border-gray-300 rounded p-2 mb-4"
                                     rows={4}
                                     value={reflectionValue}
                                     onChange={e => setReflectionValue(e.target.value)}
                                   />
                                   <div className="flex justify-end gap-2">
                                     <button
                                       className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold"
                                       onClick={() => setReflectionOpen(false)}
                                     >
                                       Cancel
                                     </button>
                                     <button
                                       className="px-3 py-1 rounded bg-gradient-to-tr from-purple-500 to-indigo-400 text-white text-xs font-semibold"
                                       onClick={() => { setReflectionDone(true); setReflectionOpen(false); }}
                                     >
                                       Save
                                     </button>
                                   </div>
                                 </div>
                               </div>
                             )}
                             {reflectionDone && (
                               <span className="ml-2 text-green-600 font-semibold flex items-center gap-1">✅ Reflection saved!</span>
                             )}
                           </>
                         )}
                       </div>
                      {/* Why This Matters */}
                      <div>
                        <span className="font-medium text-gray-700">Why this matters:</span> {whyMatters[score.name as keyof typeof whyMatters]}
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            </div>
          );
        })}
      </div>

      {/* Privacy Note */}
      <div className="mt-6 text-xs text-gray-400 text-center">
        Your scores are private. Only you see these details unless you choose to share.
      </div>
    </div>
  );
}