"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { InformationCircleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Disclosure } from "@headlessui/react";

const mockHistory = {
  Workload: [
    { label: "High", color: "bg-red-500", trend: "declining" },
    { label: "Elevated", color: "bg-yellow-500", trend: "stable" },
    { label: "Elevated", color: "bg-yellow-500", trend: "rising" },
  ],
  Sentiment: [
    { label: "Neutral", color: "bg-green-500", trend: "declining" },
    { label: "Caution", color: "bg-orange-500", trend: "declining" },
    { label: "Caution", color: "bg-orange-500", trend: "declining" },
  ],
  Engagement: [
    { label: "Steady", color: "bg-green-500", trend: "stable" },
    { label: "Steady", color: "bg-green-500", trend: "stable" },
    { label: "Steady", color: "bg-green-500", trend: "stable" },
  ],
  Recovery: [
    { label: "Moderate", color: "bg-yellow-500", trend: "declining" },
    { label: "Low", color: "bg-red-500", trend: "declining" },
    { label: "Low", color: "bg-red-500", trend: "declining" },
  ],
};

const trendIcons = {
  rising: <ArrowTrendingUpIcon className="h-5 w-5 text-orange-500 inline-block ml-1" title="Rising" />,
  declining: <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 inline-block ml-1" title="Declining" />,
  stable: <MinusIcon className="h-5 w-5 text-gray-400 inline-block ml-1" title="Stable" />,
};

const overallTrendData = [
  { date: "2024-01-01", wellbeing: 70 },
  { date: "2024-01-02", wellbeing: 72 },
  { date: "2024-01-03", wellbeing: 68 },
  { date: "2024-01-04", wellbeing: 69 },
  { date: "2024-01-05", wellbeing: 65 },
];

// Placeholder for a dynamic trend summary
const trendSummary = "Your overall wellbeing trend is slightly declining this week.";

export default function OverallWellbeingTrend() {
  return (
    <div className="bg-white shadow rounded-lg p-6 w-full border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Wellbeing Trend</h2>

      {/* Trend Summary */}
      <p className="text-sm text-gray-700 mb-4">{trendSummary}</p>

      {/* Overall Wellbeing Chart */}
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={overallTrendData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="wellbeingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), "MMM d")}
              axisLine={false}
              tickLine={false}
              className="text-xs text-gray-500"
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              className="text-xs text-gray-500"
            />
            <Tooltip
              labelFormatter={(date) => format(new Date(date), "MMM d, yyyy")}
              formatter={(value: number) => [`Score: ${value}`, 'Wellbeing']}
              wrapperClassName="rounded-md shadow-md border border-gray-200 text-sm text-gray-700"
              labelClassName="font-semibold text-gray-900 mb-1"
            />
            <Area type="monotone" dataKey="wellbeing" stroke="#8b5cf6" fill="url(#wellbeingGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Placeholder for Wellbeing Score Calculation Explanation */}
      {/* TODO: Add actual explanation of how the wellbeing score is calculated */}
      <div className="mt-8">
        <h3 className="text-base font-medium text-gray-900 mb-4">How Your Wellbeing Score is Calculated</h3>
        <p className="text-sm text-gray-700 italic">Details on how your overall wellbeing score is derived will appear here once connected to your data.</p>
      </div>
    </div>
  );
} 