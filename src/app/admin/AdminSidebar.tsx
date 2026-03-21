
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  Home, Settings, Mail, ShoppingBag, 
  Globe, User, Megaphone, MessageSquare, 
  Database, Activity, Users, Bell, 
  ChevronRight, ExternalLink
} from "lucide-react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const adminNavLinks = [
    { group: "Overview", links: [
        { href: "/admin/dashboard", label: "Dashboard", icon: Home },
        { href: "/admin/user-activity", label: "Activity", icon: Activity },
        { href: "/admin/visitor-logs", label: "Visitors", icon: Users },
    ]},
    { group: "Communication", links: [
        { href: "/admin/notifications", label: "Announcements", icon: Bell },
        { href: "/admin/submissions", label: "Inbox", icon: Mail },
        { href: "/admin/testimonials", label: "Reviews", icon: MessageSquare },
    ]},
    { group: "Business", links: [
        { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
        { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
        { href: "/admin/seo-geo-settings", label: "SEO & Geo", icon: Globe },
    ]},
    { group: "System", links: [
        { href: "/admin/settings", label: "Configuration", icon: Settings },
        { href: "/admin/database-tools", label: "Maintenance", icon: Database },
        { href: "/admin/profile", label: "My Profile", icon: User },
    ]},
];

interface AdminSidebarProps {
  className?: string;
  onLinkClick?: () => void;
}

export default function AdminSidebar({ className, onLinkClick }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={cn("bg-white dark:bg-[#0f1117] text-slate-600 dark:text-gray-400 border-r border-slate-200 dark:border-white/5 flex flex-col h-screen sticky top-0 shadow-sm", className)}>
            <div className="p-6 mb-2">
                <div className="flex items-center gap-3 px-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Settings className="text-white h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white tracking-tight text-xl">Admin<span className="text-primary">Panel</span></span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                {adminNavLinks.map((group, idx) => (
                    <div key={idx} className="mb-8">
                        <h3 className="px-4 text-[10px] uppercase tracking-[0.2em] font-bold text-white dark:text-gray-500 mb-4">
                            {group.group}
                        </h3>
                        <ul className="space-y-1">
                            {group.links.map((link) => {
                                const isActive = pathname.startsWith(link.href);
                                return (
                                    <li key={link.href}>
                                        <Link 
                                            href={link.href}
                                            onClick={onLinkClick}
                                            className={cn(
                                                "group flex items-center justify-between rounded-xl px-4 py-2.5 transition-all duration-200 relative overflow-hidden",
                                                isActive 
                                                    ? "bg-primary/5 dark:bg-primary/10 text-primary dark:text-white font-semibold" 
                                                    : "hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-gray-400"
                                            )}
                                        >
                                            {isActive && (
                                                <motion.div 
                                                    layoutId="active-pill"
                                                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                                />
                                            )}
                                            <div className="flex items-center gap-3">
                                                <link.icon className={cn(
                                                    "h-5 w-5 transition-colors duration-200",
                                                    isActive ? "text-primary" : "text-white dark:text-gray-500 group-hover:text-slate-600 dark:group-hover:text-gray-300"
                                                )} />
                                                <span className="text-sm">{link.label}</span>
                                            </div>
                                            {isActive && <ChevronRight className="h-4 w-4 text-primary/50" />}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="p-4 mt-auto border-t border-slate-100 dark:border-white/5">
                <Link 
                    href="/" 
                    target="_blank"
                    className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors text-xs text-white dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                >
                    <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        <span>View Website</span>
                    </div>
                    <ChevronRight className="h-3 w-3" />
                </Link>
            </div>
        </aside>
    )
}
