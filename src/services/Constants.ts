import {
  BriefcaseBusinessIcon,
  Calendar,
  Code2Icon,
  LayoutDashboardIcon,
  List,
  Presentation,
  Puzzle,
  Settings,
  User2Icon,
  Wallet,
} from "lucide-react";

export const SidebarOptions = [
  {
    name: "Dashboard",
    icon: LayoutDashboardIcon,
    path: "/dashboard",
  },
  {
    name: "Scheduled Interview",
    icon: Calendar,
    path: "/scheduled-interview",
  },
  {
    name: "All Interview",
    icon: List,
    path: "/all-interview",
  },
  {
    name: "Billing",
    icon: Wallet,
    path: "/billing",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export const InterviewType = [
  {
    title: "Technical",
    icon: Code2Icon,
  },
  {
    title: "Behavorial",
    icon: User2Icon,
  },
  {
    title: "Experience",
    icon: BriefcaseBusinessIcon,
  },
  {
    title: "Problem Solving",
    icon: Puzzle,
  },
  {
    title: "Leadership",
    icon: Presentation,
  },
];