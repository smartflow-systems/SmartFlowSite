import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Download } from "lucide-react";
import { BotTemplate } from "@shared/schema";

interface TemplateCardProps {
  template: BotTemplate;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className={`bg-card-bg border-secondary-brown hover:border-accent-gold transition-colors relative overflow-hidden ${template.isPremium ? 'border-accent-gold' : ''}`}>
      {template.isPremium && (
        <div className="absolute top-4 right-4 bg-accent-gold text-primary-black px-3 py-1 rounded-full text-xs font-bold z-10">
          PREMIUM
        </div>
      )}
      
      <CardContent className="p-6">
        {template.imageUrl && (
          <img 
            src={template.imageUrl} 
            alt={template.name}
            className="w-full h-40 object-cover rounded-lg mb-4" 
          />
        )}
        
        <h3 className="text-xl font-bold mb-2">{template.name}</h3>
        <p className="text-neutral-gray mb-4">{template.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <span className={`font-bold text-lg ${template.isPremium ? 'text-accent-gold' : 'text-green-400'}`}>
            {template.isPremium ? `£${template.price}/month` : 'Free'}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="text-accent-gold w-4 h-4 fill-current" />
            <span className="text-sm">{template.rating} ({template.reviewCount} reviews)</span>
          </div>
        </div>
        
        <Button 
          className={`w-full font-bold transition-all ${
            template.isPremium 
              ? 'bg-accent-gold text-primary-black gold-glow-hover' 
              : 'bg-secondary-brown text-accent-gold hover:bg-accent-gold hover:text-primary-black'
          }`}
        >
          {template.isPremium ? (
            <>
              <Crown className="w-4 h-4 mr-2" />
              Unlock Premium
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Install Free
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
