"use client";

import { format } from "date-fns";
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

// Mock data - replace with real data from API
const mockUserNudges = [
  {
    id: "1",
    type: "take_break",
    title: "Time for a Break",
    message: "You've been working for 2 hours straight. Consider taking a short break.",
    priority: "medium",
    is_read: false,
    created_at: "2024-01-05T10:00:00Z",
  },
  {
    id: "2",
    type: "meeting_overload",
    title: "High Meeting Load",
    message: "You have 6 meetings scheduled today. Consider rescheduling some for better focus time.",
    priority: "high",
    is_read: true,
    created_at: "2024-01-05T09:00:00Z",
  },
  {
    id: "3",
    type: "after_hours",
    title: "After Hours Activity",
    message: "You've been active after work hours for 3 days this week. Remember to maintain work-life balance.",
    priority: "low",
    is_read: false,
    created_at: "2024-01-04T18:00:00Z",
  },
];

const mockTeamNudges = [
  {
    id: "1",
    type: "team_burnout",
    title: "Team Burnout Risk",
    message: "3 team members are showing signs of burnout. Consider reviewing workload distribution.",
    priority: "high",
    is_read: false,
    created_at: "2024-01-05T10:00:00Z",
  },
  {
    id: "2",
    type: "meeting_culture",
    title: "Meeting Culture",
    message: "Team has 40% more meetings than last week. Consider implementing meeting-free days.",
    priority: "medium",
    is_read: true,
    created_at: "2024-01-05T09:00:00Z",
  },
  {
    id: "3",
    type: "work_life_balance",
    title: "Work-Life Balance",
    message: "5 team members are working after hours regularly. Consider reviewing deadlines and expectations.",
    priority: "high",
    is_read: false,
    created_at: "2024-01-04T18:00:00Z",
  },
];

const priorityIcons = {
  high: ExclamationCircleIcon,
  medium: InformationCircleIcon,
  low: CheckCircleIcon,
};

const priorityColors = {
  high: "text-red-500",
  medium: "text-yellow-500",
  low: "text-green-500",
};

interface NudgesListProps {
  isManagerView: boolean;
}

export default function NudgesList({ isManagerView }: NudgesListProps) {
  const nudges = isManagerView ? mockTeamNudges : mockUserNudges;

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {nudges.map((nudge, nudgeIdx) => {
          const Icon = priorityIcons[nudge.priority as keyof typeof priorityIcons];
          const color = priorityColors[nudge.priority as keyof typeof priorityColors];
          
          return (
            <li key={nudge.id}>
              <div className="relative pb-8">
                {nudgeIdx !== nudges.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${color}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{nudge.title}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{nudge.message}</p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time dateTime={nudge.created_at}>
                        {format(new Date(nudge.created_at), "MMM d, h:mm a")}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-6">
        <button
          className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          {isManagerView ? "View Team Insights" : "View My Insights"}
        </button>
      </div>
    </div>
  );
} 