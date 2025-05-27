"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BellIcon, Cog6ToothIcon, UserCircleIcon, ChartBarIcon, SparklesIcon, UsersIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";

interface DashboardHeaderProps {
  pendingNudgeRequestsCount: number;
  incomingRequest: {
    detected: boolean;
    message: string;
    state: 'pending' | 'accepted' | 'declined' | 'none';
  };
  setIncomingRequestState: (state: 'pending' | 'accepted' | 'declined' | 'none') => void;
}

const individualNavigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Insights', href: '/insights' },
  { name: 'Settings', href: '/settings' },
  { name: 'Profile', href: '/profile' },
];

const managerNavigation = [
  { name: 'Team Dashboard', href: '/' }, // Assuming / is the dashboard for all roles
  { name: 'Team Insights', href: '/team-insights' },
  { name: 'Settings', href: '/settings' },
  { name: 'Profile', href: '/profile' },
];

const hrNavigation = [
  { name: 'Org Dashboard', href: '/' }, // Assuming / is the dashboard for all roles
  { name: 'Reports', href: '/reports' },
  { name: 'Settings', href: '/settings' },
  { name: 'Profile', href: '/profile' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardHeader({ pendingNudgeRequestsCount, incomingRequest, setIncomingRequestState }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { role, setRole } = useRole();

  const currentNavigation = role === 'individual' ? individualNavigation : role === 'manager' ? managerNavigation : hrNavigation;

  return (
    <header className="bg-white shadow-sm rounded-full max-w-7xl mx-auto mt-4 px-8">
      <div className="h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0 mr-6">
          <span className="text-2xl font-bold text-gray-900">Tend</span>
        </div>

        {/* Right section: Navigation and Utility Icons */}
        <div className="flex items-center space-x-6">

          {/* Main Navigation Links (Grouped) */}
          <div className="hidden sm:flex space-x-3 bg-gray-100 rounded-full p-1">
            {currentNavigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <span
                  className={classNames(
                    pathname === item.href
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900',
                    'rounded-full px-4 py-1 text-sm font-medium transition-colors flex items-center gap-1'
                  )}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Utility Icons: Role, Notifications, Profile (Grouped) */}
          <div className="flex items-center space-x-3">

            {/* Role Selector (styled as a button) */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                 {role.charAt(0).toUpperCase() + role.slice(1)} View
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setRole('individual')}
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block w-full px-4 py-2 text-left text-sm text-gray-700'
                        )}
                      >
                        Individual View
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setRole('manager')}
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block w-full px-4 py-2 text-left text-sm text-gray-700'
                        )}
                      >
                        Manager View
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setRole('hr')}
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block w-full px-4 py-2 text-left text-sm text-gray-700'
                        )}
                      >
                        HR View
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* Notifications Button */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-5 w-5" aria-hidden="true" />
                {pendingNudgeRequestsCount > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                )}
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {/* Notification items go here */}
                   {incomingRequest.detected && incomingRequest.state === 'pending' && (
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-700">{incomingRequest.message}</p>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => setIncomingRequestState('accepted')}
                            className="flex-1 rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => setIncomingRequestState('declined')}
                            className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    )}
                </Menu.Items>
              </Transition>
            </Menu>

            {/* Profile Dropdown Button */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center rounded-full bg-gray-100 p-1 text-gray-600 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                <span className="sr-only">Open user menu</span>
                 <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                   <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/profile"
                          className={classNames(
                            active ? "bg-gray-100" : "",
                            "block px-4 py-2 text-sm text-gray-700"
                          )}
                        >
                          Your Profile
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/settings"
                          className={classNames(
                            active ? "bg-gray-100" : "",
                            "block px-4 py-2 text-sm text-gray-700"
                          )}
                        >
                          Settings
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={classNames(
                            active ? "bg-gray-100" : "",
                            "block w-full px-4 py-2 text-left text-sm text-gray-700"
                          )}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>

          </div>
        </div>
      </div>
    </header>
  );
} 