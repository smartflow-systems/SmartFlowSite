import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Crown, Download, Search, Filter, Lock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  platform: string;
  isPremium: boolean;
  price: string;
  rating: string;
  reviewCount: number;
  config: any;
  imageUrl?: string;
}

interface EnhancedMarketplaceProps {
  userStatus: any;
}

export default function EnhancedMarketplace({ userStatus }: EnhancedMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const toast = useToast();

  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
  });

  const applyTemplate = (template: Template) => {
    if (template.isPremium && !userStatus?.isPremium) {
      toast.toastPremium(
        "👑 Premium Template",
        "Upgrade to SmartFlow Pro to access premium templates and unlock unlimited automation!"
      );
      return;
    }

    // Apply template logic here
    toast.toastSuccess(
      `🚀 Template Applied: ${template.name}`,
      "Your new automation bot is being configured with this template!"
    );
  };

  const categories = ["all", "E-commerce", "Beauty", "Fashion", "Technology", "Lifestyle"];
  const platforms = ["all", "tiktok", "instagram", "facebook", "twitter", "youtube", "multi"];

  // Filter and sort templates
  const filteredTemplates = templates?.filter((template: Template) => {
    const matchesSearch = searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesPremium = !showPremiumOnly || template.isPremium;
    
    return matchesSearch && matchesCategory && matchesPremium;
  }).sort((a: Template, b: Template) => {
    switch (sortBy) {
      case "rating":
        return parseFloat(b.rating) - parseFloat(a.rating);
      case "downloads":
        return b.reviewCount - a.reviewCount;
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      default: // popular
        return b.reviewCount - a.reviewCount;
    }
  });

  const featuredTemplates = templates?.filter((t: Template) => 
    ["TikTok Product Booster Pro", "Instagram Flash Sale Creator", "Multi-Platform Testimonial Showcase"].includes(t.name)
  );

  return (
    <div className="space-y-6">
      {/* Featured Templates */}
      <Card className="bg-gradient-to-r from-accent-gold to-yellow-500 border-accent-gold">
        <CardHeader>
          <CardTitle className="text-primary-black flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Featured Premium Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredTemplates?.slice(0, 3).map((template: Template) => (
              <div key={template.id} className="bg-primary-black rounded-lg p-4 border border-secondary-brown">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-accent-gold text-lg mb-1">{template.name}</h4>
                    <p className="text-neutral-gray text-sm">{template.description.slice(0, 100)}...</p>
                  </div>
                  {template.isPremium && <Crown className="w-5 h-5 text-accent-gold ml-2" />}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < Math.floor(parseFloat(template.rating)) ? 'text-accent-gold fill-current' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-neutral-gray">({template.reviewCount})</span>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-accent-gold text-primary-black hover:bg-yellow-500 font-semibold"
                    onClick={() => applyTemplate(template)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="bg-card-bg border-secondary-brown">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-gray" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary-brown border-secondary-brown text-white"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-secondary-brown border-secondary-brown text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-secondary-brown border-secondary-brown text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="downloads">Most Downloaded</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showPremiumOnly ? "default" : "outline"}
              onClick={() => setShowPremiumOnly(!showPremiumOnly)}
              className={showPremiumOnly 
                ? "bg-accent-gold text-primary-black hover:bg-yellow-500" 
                : "border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-primary-black"
              }
            >
              <Crown className="w-4 h-4 mr-2" />
              Premium Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates?.map((template: Template) => (
          <Card key={template.id} className="bg-card-bg border-secondary-brown hover:border-accent-gold transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white text-lg flex items-center">
                    {template.name}
                    {template.isPremium && <Crown className="w-4 h-4 text-accent-gold ml-2" />}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-secondary-brown text-accent-gold">
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className="border-accent-gold text-accent-gold">
                      {template.platform}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-accent-gold font-bold text-lg">
                    {template.isPremium ? `£${template.price}` : 'Free'}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-accent-gold fill-current mr-1" />
                    <span className="text-xs text-neutral-gray">{template.rating} ({template.reviewCount})</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-gray text-sm mb-4 line-clamp-3">
                {template.description}
              </p>
              
              {/* Template Features */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {Object.keys(template.config || {}).slice(0, 3).map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs bg-accent-gold bg-opacity-20 text-accent-gold">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button 
                  className="flex-1 bg-accent-gold text-primary-black hover:bg-yellow-500 font-semibold"
                  onClick={() => applyTemplate(template)}
                  disabled={template.isPremium && !userStatus?.isPremium}
                >
                  {template.isPremium && !userStatus?.isPremium ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" style={{color: '#000000'}} />
                      <span style={{color: '#000000', fontWeight: 'bold'}}>Premium</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" style={{color: '#000000'}} />
                      <span style={{color: '#000000', fontWeight: 'bold'}}>Apply Template</span>
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-secondary-brown text-neutral-gray hover:border-accent-gold hover:text-accent-gold"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Stats */}
      <Card className="bg-card-bg border-secondary-brown">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-accent-gold">{templates?.length || 0}</div>
              <div className="text-neutral-gray text-sm">Total Templates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-gold">
                {templates?.filter((t: Template) => t.isPremium).length || 0}
              </div>
              <div className="text-neutral-gray text-sm">Premium Templates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-gold">
                {templates?.reduce((sum: number, t: Template) => sum + t.reviewCount, 0) || 0}
              </div>
              <div className="text-neutral-gray text-sm">Total Downloads</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-gold">4.7</div>
              <div className="text-neutral-gray text-sm">Average Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}