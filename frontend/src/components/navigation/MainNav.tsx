"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRole } from "@/contexts/RoleContext";
import { 
  HomeIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  UserIcon, 
  Cog6ToothIcon,
  BuildingOfficeIcon,
  DocumentChartBarIcon
} from "@heroicons/react/24/outline";

const individualNavigation = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Insights", href: "/insights", icon: ChartBarIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

const managerNavigation = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Team", href: "/team", icon: UserGroupIcon },
  { name: "Insights", href: "/insights", icon: ChartBarIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

const hrNavigation = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Teams", href: "/teams", icon: UserGroupIcon },
  { name: "Reports", href: "/reports", icon: DocumentChartBarIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
  { name: "Admin", href: "/admin", icon: BuildingOfficeIcon },
];

export default function MainNav() {
  const pathname = usePathname();
  const { role } = useRole();

  const navigation = role === 'individual' 
    ? individualNavigation 
    : role === 'manager' 
      ? managerNavigation 
      : hrNavigation;

  return (
    <nav className="flex space-x-4 px-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive
                ? "bg-purple-100 text-purple-700"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon className="h-5 w-5 mr-2" aria-hidden="true" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
} 