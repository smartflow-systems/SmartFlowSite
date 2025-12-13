/**
 * SocialScaleBooster Hamburger Menu
 *
 * Comprehensive slide-in sidebar navigation for marketing/social media automation
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  Home,
  Bot,
  Calendar,
  BarChart3,
  FileText,
  Hash,
  Users,
  Zap,
  TrendingUp,
  Settings,
  CreditCard,
  HelpCircle,
  MessageSquare,
  Mail,
  BookOpen,
  Target,
  Activity,
  Share2,
  Globe,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "MAIN",
    items: [
      { id: "home", label: "Home", href: "/", icon: Home },
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: BarChart3 },
      { id: "ai-studio", label: "AI Studio", href: "/ai-studio", icon: Bot },
      { id: "calendar", label: "Content Calendar", href: "/calendar", icon: Calendar },
      { id: "analytics", label: "Analytics", href: "/analytics", icon: Activity },
    ]
  },
  {
    title: "CONTENT & CREATION",
    items: [
      { id: "create", label: "Create Post", href: "/create", icon: FileText },
      { id: "templates", label: "Templates", href: "/templates", icon: FileText },
      { id: "hashtags", label: "Hashtag Research", href: "/hashtags", icon: Hash },
      { id: "captions", label: "Caption Generator", href: "/captions", icon: MessageSquare },
    ]
  },
  {
    title: "SOCIAL AUTOMATION",
    items: [
      { id: "scheduler", label: "Post Scheduler", href: "/scheduler", icon: Calendar },
      { id: "auto-engage", label: "Auto Engagement", href: "/auto-engage", icon: Zap },
      { id: "dm-automation", label: "DM Automation", href: "/dm-automation", icon: MessageSquare },
      { id: "social-accounts", label: "Connected Accounts", href: "/accounts", icon: Globe },
    ]
  },
  {
    title: "GROWTH & INSIGHTS",
    items: [
      { id: "competitors", label: "Competitor Tracker", href: "/competitors", icon: Target },
      { id: "trends", label: "Trending Topics", href: "/trends", icon: TrendingUp },
      { id: "audience", label: "Audience Builder", href: "/audience", icon: Users },
      { id: "performance", label: "Performance Score", href: "/performance", icon: BarChart3 },
    ]
  },
  {
    title: "MARKETPLACE",
    items: [
      { id: "marketplace", label: "Browse Marketplace", href: "/marketplace", icon: Share2 },
      { id: "subscribe", label: "Subscription Plans", href: "/subscribe", icon: CreditCard },
      { id: "checkout", label: "Checkout", href: "/checkout", icon: CreditCard },
    ]
  },
  {
    title: "SETTINGS & SUPPORT",
    items: [
      { id: "settings", label: "Settings", href: "/settings", icon: Settings },
      { id: "help", label: "Help Center", href: "/help", icon: HelpCircle },
      { id: "tutorials", label: "Tutorials", href: "/tutorials", icon: BookOpen },
      { id: "support", label: "Contact Support", href: "/support", icon: Mail },
    ]
  }
];

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/" && location === "/") {
      return true;
    }
    if (href === "/dashboard" && location === "/dashboard") {
      return true;
    }
    return location.startsWith(href) && href !== "/";
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-accent-gold hover:text-gold-trim transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold rounded-md"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-80 z-50",
          "bg-primary-black/95 backdrop-blur-xl border-r border-accent-gold/30",
          "transform transition-transform duration-300 ease-in-out",
          "shadow-2xl shadow-accent-gold/10",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-accent-gold/20 bg-gradient-to-r from-rich-brown to-primary-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-gold to-gold-trim rounded-lg flex items-center justify-center shadow-lg shadow-accent-gold/30">
              <Bot className="w-6 h-6 text-primary-black" />
            </div>
            <div>
              <h1 className="text-accent-gold font-bold text-sm">SmartFlow AI</h1>
              <p className="text-xs text-neutral-gray">Social Automation</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-accent-gold/70 hover:text-accent-gold transition-colors rounded-md"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Sections */}
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="py-4">
            {menuSections.map((section, sectionIndex) => (
              <div key={section.title} className={sectionIndex > 0 ? "mt-6" : ""}>
                <div className="px-4 mb-2">
                  <h3 className="text-accent-gold/60 text-xs font-bold uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-1 px-2">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={handleLinkClick}
                      >
                        <a
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden",
                            active
                              ? "bg-accent-gold/20 text-accent-gold border-l-2 border-accent-gold"
                              : "text-neutral-gray hover:bg-accent-gold/10 hover:text-accent-gold"
                          )}
                        >
                          {/* Hover shimmer effect */}
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-accent-gold/10 to-transparent" />

                          <Icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-accent-gold" : "")} />
                          <span className="font-medium text-sm relative z-10">{item.label}</span>
                        </a>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-accent-gold/20 bg-gradient-to-r from-rich-brown to-primary-black">
          <div className="text-xs text-neutral-gray text-center">
            <p className="font-semibold text-accent-gold">SmartFlow Systems</p>
            <p>© 2025 Social Automation</p>
          </div>
        </div>
      </div>
    </>
  );
}
