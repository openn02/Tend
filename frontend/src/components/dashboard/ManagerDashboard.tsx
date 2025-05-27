"use client";

import { InformationCircleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon, LockClosedIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Disclosure } from "@headlessui/react";

// Mock data for team wellbeing metrics
const mockTeamMetrics = {
  overall: {
    status: "declining",
    message: "Team wellbeing declined slightly this week. Tend detected elevated workload and reduced recovery across 3+ team members.",
    insight: "Consider implementing a no-meeting Wednesday.",
    action: "Share this with the team",
  },
  dimensions: [
    {
      name: "Workload",
      label: "Elevated",
      labelColor: "text-yellow-600",
      trend: "rising",
      change: "+14%",
      description: "Tracks team calendar and comms overload.",
      contributors: "More meetings, later Slack hours this week",
      action: "Try limiting cross-functional syncs",
      heatmap: [
        { week: 1, status: "High", color: "bg-red-500" },
        { week: 2, status: "Elevated", color: "bg-yellow-500" },
        { week: 3, status: "Elevated", color: "bg-yellow-500" },
        { week: 4, status: "High", color: "bg-red-500" },
      ],
    },
    {
      name: "Sentiment",
      label: "Neutral",
      labelColor: "text-green-600",
      trend: "stable",
      change: "0%",
      description: "Detects team emotional tone and mood shifts.",
      contributors: "Stable team communication patterns",
      action: "Continue regular 1:1s",
      heatmap: [
        { week: 1, status: "Neutral", color: "bg-green-500" },
        { week: 2, status: "Neutral", color: "bg-green-500" },
        { week: 3, status: "Neutral", color: "bg-green-500" },
        { week: 4, status: "Neutral", color: "bg-green-500" },
      ],
    },
    {
      name: "Engagement",
      label: "Steady",
      labelColor: "text-green-600",
      trend: "stable",
      change: "+5%",
      description: "Monitors team rhythm and participation.",
      contributors: "Consistent meeting participation",
      action: "Maintain current meeting cadence",
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
      description: "Reflects team time away and recharge habits.",
      contributors: "Fewer breaks, more after-hours work",
      action: "Consider implementing mandatory break times",
      heatmap: [
        { week: 1, status: "Moderate", color: "bg-yellow-500" },
        { week: 2, status: "Low", color: "bg-red-500" },
        { week: 3, status: "Low", color: "bg-red-500" },
        { week: 4, status: "Low", color: "bg-red-500" },
      ],
    },
  ],
  burnoutRisk: {
    detected: true,
    message: "⚠️ Burnout Risk Detected: Tend has observed persistent high workload + low recovery patterns across the team.",
    recommendation: "Consider pausing Friday standups and implementing mandatory break times.",
  },
  teamBreakdown: [
    { name: "Design", workload: "Elevated", sentiment: "Neutral", engagement: "Steady", recovery: "Low" },
    { name: "Engineering", workload: "High", sentiment: "Caution", engagement: "Steady", recovery: "Low" },
    { name: "Product", workload: "Moderate", sentiment: "Neutral", engagement: "Steady", recovery: "Moderate" },
  ],
};

// Mock data for team breakdown - replace with real data from API
const mockTeamBreakdown = [
  { teamName: "Alpha", workloadChange: "+5%", sentimentChange: "-3%", engagementChange: "+2%", recoveryChange: "+8%" },
  { teamName: "Beta", workloadChange: "-2%", sentimentChange: "+7%", engagementChange: "-1%", recoveryChange: "+3%" },
  { teamName: "Gamma", workloadChange: "+10%", sentimentChange: "-5%", engagementChange: "+5%", recoveryChange: "-4%" },
  { teamName: "Delta", workloadChange: "-8%", sentimentChange: "+12%", engagementChange: "+3%", recoveryChange: "+10%" },
];

const trendIcons = {
  rising: <ArrowTrendingUpIcon className="h-5 w-5 text-orange-500 inline-block ml-1" title="Rising" />,
  declining: <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 inline-block ml-1" title="Declining" />,
  stable: <MinusIcon className="h-5 w-5 text-gray-400 inline-block ml-1" title="Stable" />,
};

export default function ManagerDashboard() {
  return (
    <div className="space-y-8">
      {/* Hero Banner: Team Wellbeing Summary */}
      <div className="w-full rounded-2xl p-6 bg-gradient-to-tr from-purple-500 to-indigo-400 shadow-lg text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-2xl font-semibold mb-2">{mockTeamMetrics.overall.message}</div>
            <div className="text-base opacity-90">
              <span className="font-semibold">💡 Insight of the Week:</span> {mockTeamMetrics.overall.insight}
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-white text-purple-700 font-medium hover:bg-purple-50 transition">
            {mockTeamMetrics.overall.action}
          </button>
        </div>
      </div>

      {/* Burnout Risk Alert */}
      {mockTeamMetrics.burnoutRisk.detected && (
        <div className="w-full rounded-xl p-6 bg-red-50 border border-red-100">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mt-1" />
            <div>
              <div className="text-red-700 font-semibold mb-1">{mockTeamMetrics.burnoutRisk.message}</div>
              <div className="text-red-600">{mockTeamMetrics.burnoutRisk.recommendation}</div>
              <button className="mt-4 px-4 py-2 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition text-sm"
                onClick={() => alert("Simulating sending a wellbeing check-in request to potentially impacted team members.")}
              >
                Send Wellbeing Check-in Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Dimension Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {mockTeamMetrics.dimensions.map((dimension) => (
          <div key={dimension.name} className="relative flex flex-col justify-between overflow-hidden rounded-lg bg-white px-6 py-6 shadow-sm border border-gray-100 min-h-[240px]">
            <div className="flex items-center mb-2">
              <p className="text-lg font-semibold text-gray-900 mr-2">{dimension.name}</p>
              <span className="relative group">
                <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-pointer" aria-hidden="true" />
                <span className="absolute left-1/2 z-10 hidden w-64 -translate-x-1/2 rounded-md bg-white p-2 text-xs text-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
                  Heatmap reflects aggregate signal trends across your team. Not tied to individuals.
                </span>
              </span>
            </div>
            
            <div className="flex items-center mb-1">
              <span className={`text-xl font-bold ${dimension.labelColor}`}>{dimension.label}</span>
              {trendIcons[dimension.trend as keyof typeof trendIcons]}
              <span className="ml-2 text-xs text-gray-500">{dimension.change} from last week</span>
            </div>

            {/* Description */}
            <div className="mb-2 text-sm text-gray-600">{dimension.description}</div>

            {/* Heatmap */}
            <div className="flex gap-1 mb-4">
              {dimension.heatmap.map((week) => (
                <div
                  key={week.week}
                  className={`w-8 h-2 rounded-full ${week.color}`}
                  title={`Week ${week.week}: ${week.status}`}
                />
              ))}
            </div>

            {/* Collapsible Details */}
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="mt-2 text-xs text-purple-600 hover:underline focus:outline-none">
                    {open ? "Hide Details" : "View Details & Actions"}
                  </Disclosure.Button>
                  <Disclosure.Panel className="mt-2 text-xs text-gray-500 bg-purple-50 rounded p-3 space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Contributing Factors:</span> {dimension.contributors}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Suggested Action:</span> {dimension.action}
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </div>
        ))}
      </div>

      {/* Team Breakdown */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Team Breakdown</h3>
          <p className="text-sm text-gray-500 mt-1">Aggregate trends by team (anonymized)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workload</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recovery</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockTeamMetrics.teamBreakdown.map((team) => (
                <tr key={team.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.workload}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.sentiment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.engagement}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.recovery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="mt-6 text-xs text-gray-400 text-center">
        These insights reflect overall team trends. Tend does not track or share individual behavior.
      </div>
    </div>
  );
} 