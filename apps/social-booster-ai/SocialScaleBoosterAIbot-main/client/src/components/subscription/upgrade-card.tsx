import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Infinity, BarChart3, Zap, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function UpgradeCard() {
  const { data: userStatus } = useQuery({
    queryKey: ["/api/user/status"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user/status');
        if (!response.ok) {
          return { isPremium: false };
        }
        return response.json();
      } catch (error) {
        return { isPremium: false };
      }
    },
  });

  if (userStatus?.isPremium) {
    return null; // Don't show upgrade card if user is already premium
  }

  const handleUpgrade = () => {
    window.location.href = "/subscribe";
  };

  return (
    <Card className="bg-gradient-to-br from-accentGold/10 to-goldTrim/5 border-accentGold relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <Badge className="bg-accentGold text-primaryBlack font-bold">
          UPGRADE
        </Badge>
      </div>
      
      <CardHeader>
        <CardTitle className="text-accent-gold flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Unlock Pro Features
        </CardTitle>
        <div className="text-2xl font-bold text-white">
          £49<span className="text-lg text-neutral-gray">/month</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-accent-gold" />
            <span className="text-white font-medium">Unlimited bots</span>
            <Infinity className="w-4 h-4 text-accent-gold" />
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-accent-gold" />
            <span className="text-white font-medium">Advanced analytics</span>
            <BarChart3 className="w-4 h-4 text-accent-gold" />
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-accent-gold" />
            <span className="text-white font-medium">Premium templates</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-accent-gold" />
            <span className="text-white font-medium">Priority support</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-accent-gold" />
            <span className="text-white font-medium">Advanced scheduling</span>
            <Zap className="w-4 h-4 text-accent-gold" />
          </div>
        </div>
        
        <Button 
          onClick={handleUpgrade}
          className="w-full bg-accent-gold text-primary-black hover:opacity-90 font-bold text-lg py-6"
        >
          <Crown className="w-5 h-5 mr-2" />
          Upgrade to Pro
        </Button>
        
        <div className="text-center">
          <p className="text-xs text-neutral-gray">
            Cancel anytime • No hidden fees
          </p>
        </div>
      </CardContent>
    </Card>
  );
}