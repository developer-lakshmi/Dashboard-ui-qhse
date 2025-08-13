import {
  BarChart2, ClipboardList, Users, CalendarDays, FileText, Search,
  ShieldCheck, AlertTriangle, Eye, BookOpen, GraduationCap, File, Lightbulb,
  TrendingUp, UserCheck, UserPlus, Package, PackagePlus, ShoppingBag,
  PieChart, Activity, Leaf, Zap, DollarSign
} from "lucide-react";

export const sidebarLinks = [
  {
    title: "Dashboard Overview",
    links: [
      { label: "Summary View", icon: PieChart, path: "/dashboard/summary", iconColor: "text-blue-500" },
      { label: "Detailed View", icon: ClipboardList, path: "/dashboard/detailed", iconColor: "text-indigo-500" },
      // { label: "Analytics", icon: BarChart2, path: "/dashboard/analytics", iconColor: "text-cyan-500" }
    ]
  },
  // {
  //   title: "Audit Management",
  //   links: [
  //     { label: "Audit Overview", icon: ClipboardList, path: "/audit/overview", iconColor: "text-orange-500" },
  //     { label: "Project Audits", icon: Package, path: "/audit/projects", iconColor: "text-yellow-500" },
  //     { label: "Client Audits", icon: Users, path: "/audit/clients", iconColor: "text-green-500" },
  //     { label: "Audit Schedule", icon: CalendarDays, path: "/audit/schedule", iconColor: "text-blue-400" },
  //     { label: "Audit Reports", icon: FileText, path: "/audit/reports", iconColor: "text-purple-500" },
  //     { label: "Audit Findings", icon: Search, path: "/audit/findings", iconColor: "text-pink-500" }
  //   ]
  // },
  {
    title: "IMS Management",
    links: [
      { label: "Quality Management", icon: ShieldCheck, path: "/qhse/quality", iconColor: "text-green-600" },
      { label: "Health & Safety", icon: AlertTriangle, path: "/qhse/health-safety", iconColor: "text-red-500" },
      { label: "Environmental", icon: Leaf, path: "/qhse/environmental", iconColor: "text-green-400" },
      { label: "Energy", icon: Zap, path: "/qhse/energy", iconColor: "text-yellow-600" },
    ]
  },
  {
    title: "Additional Information",
    links: [
      { label: "Billability Overview", icon: DollarSign, path: "/dashboard/billability", iconColor: "text-blue-500" },
    ]
  }
  // {
  //   title: "Project Management",
  //   links: [
  //     { label: "Project Overview", icon: BarChart2, path: "/projects/overview", iconColor: "text-blue-500" },
  //     { label: "Critical Projects", icon: AlertTriangle, path: "/projects/critical", iconColor: "text-red-600" },
  //     { label: "Project Timeline", icon: CalendarDays, path: "/projects/timeline", iconColor: "text-cyan-600" },
  //     { label: "Resource Management", icon: Users, path: "/projects/resources", iconColor: "text-green-500" },
  //     { label: "Project Reports", icon: FileText, path: "/projects/reports", iconColor: "text-indigo-500" }
  //   ]
  // },
//   {
//     title: "Supporting Information",
//     links: [
//       { label: "Documentation", icon: File, path: "/support/documentation", iconColor: "text-gray-500" },
//       { label: "Procedures", icon: ClipboardList, path: "/support/procedures", iconColor: "text-blue-400" },
//       { label: "Training Materials", icon: GraduationCap, path: "/support/training", iconColor: "text-yellow-500" },
//       { label: "Standards & Guidelines", icon: BookOpen, path: "/support/standards", iconColor: "text-green-500" },
//       { label: "Templates", icon: FileText, path: "/support/templates", iconColor: "text-pink-500" },
//       { label: "Knowledge Base", icon: Lightbulb, path: "/support/knowledge", iconColor: "text-yellow-400" }
//     ]
//   },
//   {
//     title: "Reports & Analytics",
//     links: [
//       { label: "Executive Dashboard", icon: UserCheck, path: "/reports/executive", iconColor: "text-blue-500" },
//       { label: "Performance Metrics", icon: TrendingUp, path: "/reports/performance", iconColor: "text-green-500" },
//       { label: "Trend Analysis", icon: BarChart2, path: "/reports/trends", iconColor: "text-cyan-500" },
//       { label: "Custom Reports", icon: FileText, path: "/reports/custom", iconColor: "text-purple-500" },
//       { label: "Data Export", icon: PackagePlus, path: "/reports/export", iconColor: "text-pink-500" }
//     ]
//   }
];