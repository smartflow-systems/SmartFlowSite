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
  });

  const handlePurchase = () => {
    if (template.isPremium && !userStatus?.isPremium) {
      // Redirect to subscription page for premium templates
      window.location.href = "/subscribe";
    } else if (template.price > 0) {
      // Redirect to checkout for paid templates
      window.location.href = `/checkout?amount=${template.price * 100}`;
    } else {
      // Apply free template
      console.log("Applying free template:", template.name);
    }
  };

  const canAccess = !template.isPremium || userStatus?.isPremium;

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      template.isPremium 
        ? "bg-gradient-to-br from-accent-gold/10 to-gold-trim/5 border-accent-gold hover:border-accent-gold/80" 
        : "bg-card-bg border-secondary-brown hover:border-accent-gold/50"
    }`}>
      {/* Premium Badge */}
      {template.isPremium && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-accent-gold text-primary-black font-bold">
            <Crown className="w-3 h-3 mr-1" />
            PRO
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <CardTitle className={`flex items-center gap-2 ${
          template.isPremium ? "text-accent-gold" : "text-white"
        }`}>
          {template.isPremium ? <Crown className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          {template.name}
        </CardTitle>
        
        {/* Rating and Sales */}
        <div className="flex items-center gap-4 text-sm text-neutral-gray">
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
        <p className="text-neutral-gray text-sm">{template.description}</p>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-white font-semibold text-sm">Key Features:</h4>
          <div className="space-y-1">
            {template.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Zap className="w-3 h-3 text-accent-gold" />
                <span className="text-neutral-gray">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div className="flex flex-wrap gap-2">
          {template.platforms.map((platform) => (
            <Badge key={platform} variant="outline" className="text-xs border-secondary-brown text-neutral-gray">
              {platform}
            </Badge>
          ))}
        </div>

        {/* Pricing and Action */}
        <div className="flex items-center justify-between pt-4 border-t border-secondary-brown">
          <div className="flex flex-col">
            {template.price > 0 ? (
              <span className="text-lg font-bold text-accent-gold">
                £{template.price.toFixed(2)}
              </span>
            ) : (
              <span className="text-lg font-bold text-green-500">Free</span>
            )}
            {template.isPremium && (
              <span className="text-xs text-neutral-gray">Pro Plan Required</span>
            )}
          </div>

          <Button
            onClick={handlePurchase}
            disabled={!canAccess}
            className={`${
              template.isPremium && !canAccess
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : template.isPremium
                ? "bg-accent-gold text-primary-black hover:opacity-90"
                : "bg-secondary-brown text-white hover:bg-accent-gold hover:text-primary-black"
            } font-semibold`}
          >
            {!canAccess ? (
              <>
                <Lock className="w-4 h-4 mr-2" style={{color: '#000000'}} />
                <span style={{color: '#000000', fontWeight: 'bold'}}>Locked</span>
              </>
            ) : template.price > 0 ? (
              <>
                <Crown className="w-4 h-4 mr-2" style={{color: '#000000'}} />
                <span style={{color: '#000000', fontWeight: 'bold'}}>Purchase</span>
              </>
            ) : (
              <span style={{color: '#000000', fontWeight: 'bold'}}>Apply Template</span>
            )}
          </Button>
        </div>

        {/* Premium Upgrade Prompt */}
        {template.isPremium && !userStatus?.isPremium && (
          <div className="bg-accent-gold/10 border border-accent-gold/20 rounded-lg p-3 text-center">
            <p className="text-xs text-accent-gold">
              Upgrade to Pro to unlock this premium template
            </p>
            <Button
              onClick={() => window.location.href = "/subscribe"}
              className="bg-accent-gold text-primary-black hover:opacity-90 text-xs mt-2 h-8"
            >
              <span style={{color: '#000000', fontWeight: 'bold'}}>Upgrade Now</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}