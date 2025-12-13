import { Button } from "@/components/ui/button";
import { Bot, Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Navigation() {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-secondaryBrown">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setLocation("/")}>
            <Bot className="text-accentGold w-8 h-8" />
            <span className="text-xl font-bold text-accentGold">SmartFlow AI</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => {
                const element = document.getElementById('features');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setLocation("/#features");
                }
              }}
              className="text-neutralGray hover:text-accentGold transition-colors bg-transparent border-none cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('pricing');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setLocation("/#pricing");
                }
              }}
              className="text-neutralGray hover:text-accentGold transition-colors bg-transparent border-none cursor-pointer"
            >
              Pricing
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('marketplace');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setLocation("/#marketplace");
                }
              }}
              className="text-neutralGray hover:text-accentGold transition-colors bg-transparent border-none cursor-pointer"
            >
              Marketplace
            </button>
            <Button 
              onClick={() => setLocation("/dashboard")}
              className="bg-richBrown text-goldTrim border border-accentGold font-semibold hover:bg-accentGold hover:text-primaryBlack transition-all"
            >
              Dashboard
            </Button>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-accentGold w-6 h-6 p-1 rounded-md hover:bg-secondaryBrown transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-secondaryBrown">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-cardBg">
              <button 
                onClick={() => {
                  const element = document.getElementById('features');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setLocation("/#features");
                  }
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-neutralGray hover:text-accentGold transition-colors rounded-md hover:bg-secondaryBrown"
              >
                Features
              </button>
              <button 
                onClick={() => {
                  const element = document.getElementById('pricing');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setLocation("/#pricing");
                  }
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-neutralGray hover:text-accentGold transition-colors rounded-md hover:bg-secondaryBrown"
              >
                Pricing
              </button>
              <button 
                onClick={() => {
                  const element = document.getElementById('marketplace');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setLocation("/#marketplace");
                  }
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-neutralGray hover:text-accentGold transition-colors rounded-md hover:bg-secondaryBrown"
              >
                Marketplace
              </button>
              
              {/* New Options */}
              <div className="border-t border-secondaryBrown my-2 pt-2">
                <button 
                  onClick={() => {
                    setLocation("/subscribe");
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-accentGold hover:text-goldTrim transition-colors rounded-md hover:bg-secondaryBrown font-medium"
                >
                  🆓 Start Free Trial
                </button>
                <button 
                  onClick={() => {
                    const element = document.getElementById('pricing');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      setLocation("/#pricing");
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-neutralGray hover:text-accentGold transition-colors rounded-md hover:bg-secondaryBrown"
                >
                  💎 View Packages
                </button>
                <button 
                  onClick={() => {
                    window.open("https://docs.smartflow.ai", "_blank");
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-neutralGray hover:text-accentGold transition-colors rounded-md hover:bg-secondaryBrown"
                >
                  📚 Documentation
                </button>
                <button 
                  onClick={() => {
                    window.open("https://support.smartflow.ai", "_blank");
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-neutralGray hover:text-accentGold transition-colors rounded-md hover:bg-secondaryBrown"
                >
                  🎧 Support
                </button>
              </div>
              
              <Button 
                onClick={() => {
                  setLocation("/dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full mt-2 bg-richBrown text-goldTrim border border-accentGold font-semibold hover:bg-accentGold hover:text-primaryBlack transition-all"
              >
                Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
