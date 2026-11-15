import {
  Bell,
  Bot,
  Brain,
  Bug,
  ClipboardList,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  Network,
  Plug,
  ScrollText,
  Settings2,
  ShieldAlert,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Features",
    items: [
      { id: "dashboard", title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { id: "chat", title: "Chat", url: "/chat", icon: MessageSquare },
      { id: "tasks", title: "Tasks", url: "/function/tasks", icon: Target },
      { id: "findings", title: "Findings", url: "/function/findings", icon: Bug },
      { id: "assets", title: "Assets", url: "/function/assets", icon: Network },
    ],
  },
  {
    id: 2,
    label: "System",
    items: [
      { id: "llm", title: "LLM", url: "/system/llm", icon: Brain },
      { id: "agents", title: "Agent", url: "/system/agents", icon: Bot },
      { id: "tools", title: "Tools", url: "/system/tools", icon: Wrench },
      { id: "skills", title: "Skills", url: "/system/skills", icon: Sparkles },
      { id: "mcp", title: "MCP", url: "/system/mcp", icon: Plug },
      { id: "intercept", title: "Intercept rules", url: "/system/intercept", icon: ShieldAlert },
      { id: "approvals", title: "Approval records", url: "/system/intercept/approvals", icon: ClipboardList },
      { id: "notify", title: "Notifications", url: "/system/notify", icon: Bell },
      { id: "logs", title: "Logs", url: "/system/logs", icon: ScrollText },
      { id: "settings", title: "System settings", url: "/system/settings", icon: Settings2 },
    ],
  },
];
