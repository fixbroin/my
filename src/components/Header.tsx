
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";
import LoadingLink from "./LoadingLink";
import type { GeneralSettings } from "@/app/admin/settings/actions/general-actions";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function HeaderContent({ settings }: { settings?: GeneralSettings | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NavLink = ({ href, label }: { href: string, label: string }) => {
    const isActive = pathname === href;
    return (
      <LoadingLink
        href={href}
        onClick={() => setIsOpen(false)}
        className={cn(
          "relative py-2 text-sm font-black uppercase tracking-widest transition-all hover:text-primary group",
          isActive ? "text-primary" : "text-slate-600 dark:text-white"
        )}
      >
        {label}
        <span className={cn(
            "absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300",
            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        )} />
      </LoadingLink>
    );
  };

  return (
    <header className={cn(
  "sticky top-0 z-50 w-full transition-all duration-300 border-b",
  "bg-background/80 backdrop-blur-xl border-border",
  scrolled ? "h-14 shadow-sm" : "h-16"
)}>
      <div className="container h-full flex items-center justify-between">
        <Logo appName={settings?.website_name} logoUrl={settings?.logo} />
        
        <nav className="hidden items-center space-x-10 lg:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          
          <Button asChild className="hidden md:flex h-11 px-6 rounded-full font-black text-xs uppercase tracking-widest group shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <LoadingLink href="/contact">
                Start Project
                <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </LoadingLink>
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0 bg-white dark:bg-[#0b0d12] border-slate-200 dark:border-white/5">
              <SheetHeader className="p-8 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                    <Logo appName={settings?.website_name} logoUrl={settings?.logo} />
                    <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                </div>
              </SheetHeader>
              <div className="p-8">
                <nav className="flex items-center space-y-8">
                  {navLinks.map((link) => (
                    <LoadingLink
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                            "text-3xl font-black uppercase tracking-tighter transition-all hover:text-primary",
                            pathname === link.href ? "text-primary" : "text-slate-900 dark:text-white"
                        )}
                    >
                        {link.label}
                    </LoadingLink>
                  ))}
                </nav>
                <div className="mt-12 pt-12 border-t border-slate-100 dark:border-white/5">
                    <Button asChild size="lg" className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" onClick={() => setIsOpen(false)}>
                        <LoadingLink href="/contact">Get A Quote</LoadingLink>
                    </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default function Header({ appName, settings }: { appName?: string, settings?: GeneralSettings | null }) {
    const pathname = usePathname();
    if (pathname.startsWith('/admin')) {
        return null;
    }
    return <HeaderContent settings={settings} />;
}
