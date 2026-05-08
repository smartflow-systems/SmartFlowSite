import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useLocation } from "wouter";
import HamburgerMenu from "../HamburgerMenu";

export default function Navigation() {
  const [, setLocation] = useLocation();

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-secondary-brown">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section with hamburger and logo */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Menu */}
            <HamburgerMenu />

            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setLocation("/")}>
              <Bot className="text-accent-gold w-8 h-8" />
              <span className="text-xl font-bold text-accent-gold">SmartFlow AI</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-neutral-gray hover:text-accent-gold transition-colors">Features</a>
            <a href="#pricing" className="text-neutral-gray hover:text-accent-gold transition-colors">Pricing</a>
            <a href="#marketplace" className="text-neutral-gray hover:text-accent-gold transition-colors">Marketplace</a>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-rich-brown text-gold-trim border border-accent-gold font-semibold hover:bg-accent-gold hover:text-primary-black transition-all"
            >
              Dashboard
            </Button>
          </div>

          {/* Mobile CTA */}
          <div className="md:hidden">
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-rich-brown text-gold-trim border border-accent-gold font-semibold px-4 py-2 text-sm hover:bg-accent-gold hover:text-primary-black transition-all"
            >
              Go
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
