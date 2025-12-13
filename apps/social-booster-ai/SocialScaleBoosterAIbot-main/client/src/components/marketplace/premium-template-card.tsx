import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock, Star, TrendingUp, Target, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PremiumTemplateCardProps {
  template: {
    id: number;
    name: string;
    description: string;
    category: string;
    price: number;
    isPremium: boolean;
    rating: number;
    totalSales: number;
    features: string[];
    platforms: string[];
  };
}

export default function PremiumTemplateCard({ template }: PremiumTemplateCardProps) {
  const { data: userStatus } = useQuery({
    queryKey: ["/api/user/status"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user/status');
        if (!response.ok) {
          // Mock fallback for development
          return { isPremium: true };
        }
        return response.json();
      } catch (error) {
        // Mock fallback for development  
        return { isPremium: true };
      }
    },
  });

  const handlePurchase = () => {
    if (template.isPremium && !userStatus?.isPremium) {
      // Redirect to subscription page for premium templates
      window.location.href = "/subscribe";
    } else if (template.price > 0) {
      // Redirect to checkout for paid templates - convert to GBP pence
      window.location.href = `/checkout?amount=${Math.round(template.price * 100)}`;
    } else {
      // Apply free template
      console.log("Applying free template:", template.name);
    }
  };

  const canAccess = !template.isPremium || userStatus?.isPremium;

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      template.isPremium 
        ? "bg-gradient-to-br from-accentGold/10 to-goldTrim/5 border-accentGold hover:border-accentGold/80" 
        : "bg-cardBg border-secondaryBrown hover:border-accentGold/50"
    }`}>
      {/* Premium Badge */}
      {template.isPremium && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-accentGold text-primaryBlack font-bold">
            <Crown className="w-3 h-3 mr-1" />
            PRO
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <CardTitle className={`flex items-center gap-2 ${
          template.isPremium ? "text-accentGold" : "text-white"
        }`}>
          {template.isPremium ? <Crown className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          {template.name}
        </CardTitle>
        
        {/* Rating and Sales */}
        <div className="flex items-center gap-4 text-sm text-neutralGray">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>{template.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>{template.totalSales} sales</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-neutralGray text-sm">{template.description}</p>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-white font-semibold text-sm">Key Features:</h4>
          <div className="space-y-1">
            {template.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Zap className="w-3 h-3 text-accentGold" />
                <span className="text-neutralGray">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div className="flex flex-wrap gap-2">
          {template.platforms.map((platform) => (
            <Badge key={platform} variant="outline" className="text-xs border-secondaryBrown text-neutralGray">
              {platform}
            </Badge>
          ))}
        </div>

        {/* Pricing and Action */}
        <div className="flex items-center justify-between pt-4 border-t border-secondaryBrown">
          <div className="flex flex-col">
            {template.price > 0 ? (
              <span className="text-lg font-bold text-accentGold">
                £{template.price.toFixed(2)}
              </span>
            ) : (
              <span className="text-lg font-bold text-green-500">Free</span>
            )}
            {template.isPremium && (
              <span className="text-xs text-neutralGray">Pro Plan Required</span>
            )}
          </div>

          <Button
            onClick={handlePurchase}
            disabled={!canAccess}
            className={`${
              template.isPremium && !canAccess
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : template.isPremium
                ? "bg-accentGold text-primaryBlack hover:opacity-90"
                : "bg-secondaryBrown text-white hover:bg-accentGold hover:text-primaryBlack"
            } font-semibold`}
          >
            {!canAccess ? (
              <>
                <Lock className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-400 font-bold">Locked</span>
              </>
            ) : template.price > 0 ? (
              <>
                <Crown className="w-4 h-4 mr-2 text-primaryBlack" />
                <span className="text-primaryBlack font-bold">Purchase</span>
              </>
            ) : (
              <span className="text-primaryBlack font-bold">Apply Template</span>
            )}
          </Button>
        </div>

        {/* Premium Upgrade Prompt */}
        {template.isPremium && !userStatus?.isPremium && (
          <div className="bg-accentGold/10 border border-accentGold/20 rounded-lg p-3 text-center">
            <p className="text-xs text-accentGold">
              Upgrade to Pro to unlock this premium template
            </p>
            <Button
              onClick={() => window.location.href = "/subscribe"}
              className="bg-accentGold text-primaryBlack hover:opacity-90 text-xs mt-2 h-8"
            >
              <span className="text-primaryBlack font-bold">Upgrade Now</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}