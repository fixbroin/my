
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CircleUser, Menu, Bell, Search, LogOut, User as UserIcon, Settings } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/firebase";
import { User, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { logout } from "./profile/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUnreadNotificationsCount, markAllNotificationsAsRead } from "./notifications/actions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function AdminHeader({ user }: { user: User | null }) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const fetchNotifications = async () => {
            const count = await getUnreadNotificationsCount();
            if (isMounted) {
                setNotificationCount(count);
            }
        };
        
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); 
        
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            await logout(); 
            toast({
                title: 'Logged Out',
                description: 'Session ended successfully.',
            });
            router.replace('/admin/login');
        } catch (error) {
            console.error('Logout Error:', error);
            toast({
                title: 'Logout Failed',
                description: 'An error occurred while logging out.',
                variant: 'destructive',
            });
        }
    }
    
    const handleNotificationClick = async () => {
        await markAllNotificationsAsRead();
        setNotificationCount(0);
        router.push('/admin/notifications');
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-white/80 dark:bg-background/60 backdrop-blur-xl px-4 lg:px-8 shadow-sm dark:shadow-none">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 md:hidden hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                        <Menu className="h-5 w-5 text-slate-600 dark:text-gray-400" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0 bg-card text-card-foreground border-border">
                   <SheetHeader className="sr-only">
                        <SheetTitle>Admin Menu</SheetTitle>
                   </SheetHeader>
                   <AdminSidebar onLinkClick={() => setIsSheetOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="flex-1 flex items-center max-w-md">
                <div className="relative w-full hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
                    <Input 
                        placeholder="Search dashboard..." 
                        className="bg-slate-50 dark:bg-white/5 border-border pl-10 focus-visible:ring-primary/20 h-9 transition-all hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-900 dark:text-white"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative bg-slate-100/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl h-10 w-10 transition-colors border border-slate-200/50 dark:border-white/5" 
                    onClick={handleNotificationClick}
                >
                    <Bell className="h-5 w-5 text-slate-600 dark:text-gray-400" />
                    {notificationCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-1 text-[10px] font-bold bg-primary hover:bg-primary border-2 border-white dark:border-[#0b0d12] text-white rounded-full">
                            {notificationCount}
                        </Badge>
                    )}
                </Button>

                <ThemeSwitcher />

                <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center gap-3 transition-all">
                            <Avatar className="h-8 w-8 rounded-lg shadow-sm border border-border">
                                <AvatarImage src={user?.photoURL || undefined} alt="Admin" />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs rounded-lg">
                                    {user?.email?.charAt(0).toUpperCase() || <CircleUser className="h-5 w-5" />}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden lg:block text-left mr-2">
                                <p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">Admin</p>
                                <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-1 leading-none font-medium">{user?.email?.split('@')[0]}</p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2 bg-card text-card-foreground border-border text-slate-600 dark:text-gray-300 shadow-xl">
                        <DropdownMenuLabel className="font-normal p-4">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">Signed in as</p>
                                <p className="text-xs leading-none text-slate-500 dark:text-muted-foreground mt-1 truncate">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5" />
                        <DropdownMenuItem asChild className="hover:bg-slate-50 dark:hover:bg-white/5 focus:bg-slate-50 dark:focus:bg-white/5 cursor-pointer py-2.5 px-4 font-medium">
                            <Link href="/admin/profile" className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                <span>Profile Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-slate-50 dark:hover:bg-white/5 focus:bg-slate-50 dark:focus:bg-white/5 cursor-pointer py-2.5 px-4 font-medium">
                            <Link href="/admin/settings" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                <span>Site Configuration</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5" />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer py-2.5 px-4 font-semibold">
                            <div className="flex items-center gap-2">
                                <LogOut className="h-4 w-4" />
                                <span>End Session</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
