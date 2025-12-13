import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Plus, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertBotSchema } from "@shared/schema";

interface CreateBotDialogProps {
  isPremium: boolean;
  botCount: number;
  children?: React.ReactNode;
}

const platforms = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter" },
  { value: "youtube", label: "YouTube" }
];

const ecommercePresets = [
  {
    id: "product-showcase",
    name: "Product Showcase",
    description: "Highlight product features with engaging visuals",
    config: { postType: "showcase", autoHashtags: true, productFocus: true }
  },
  {
    id: "sale-announcements",
    name: "Sale Announcements",
    description: "Create urgency with flash sales and limited offers",
    config: { postType: "sale", urgencyMarketing: true, countdownTimers: true }
  },
  {
    id: "customer-testimonials",
    name: "Customer Testimonials",
    description: "Share authentic customer reviews and success stories",
    config: { postType: "testimonial", socialProof: true, customerStories: true }
  },
  {
    id: "behind-scenes",
    name: "Behind the Scenes",
    description: "Show product creation and company culture",
    config: { postType: "bts", authentic: true, storytelling: true }
  }
];

export default function CreateBotDialog({ isPremium, botCount, children }: CreateBotDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    platform: "",
    preset: ""
  });
  const toast = useToast();
  const queryClient = useQueryClient();

  const createBotMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bots", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/status"] });
      toast.toastSuccess(
        "🤖 Bot Created Successfully!",
        "Your new SmartFlow AI bot is ready to start generating sales!"
      );
      setOpen(false);
      setFormData({ name: "", description: "", platform: "", preset: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create bot. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check bot limits for free users
    if (!isPremium && botCount >= 3) {
      toast.toastPremium(
        "👑 Upgrade to SmartFlow Pro",
        "Free plan is limited to 3 bots. Upgrade to Pro for unlimited AI automation!"
      );
      return;
    }

    const selectedPreset = ecommercePresets.find(p => p.id === formData.preset);
    const config = selectedPreset ? selectedPreset.config : {};

    try {
      const botData = insertBotSchema.parse({
        name: formData.name,
        description: formData.description,
        platform: formData.platform,
        config,
        userId: 1 // Mock user ID
      });
      
      createBotMutation.mutate(botData);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
    }
  };

  const canCreateBot = isPremium || botCount < 3;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            className="bg-accentGold text-primaryBlack font-semibold gold-glow-hover"
            disabled={!canCreateBot}
          >
            <Bot className="w-4 h-4 mr-2" />
            Create New Bot
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-cardBg border-secondaryBrown max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Sparkles className="text-accentGold w-6 h-6 mr-2" />
            Create E-Commerce Bot
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bot Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Product Bot"
                className="bg-secondaryBrown border-secondaryBrown focus:border-accentGold"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                <SelectTrigger className="bg-secondary-brown border-secondary-brown focus:border-accent-gold">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent className="bg-card-bg border-secondary-brown">
                  {platforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this bot will do for your e-commerce business..."
              className="bg-secondaryBrown border-secondaryBrown focus:border-accentGold"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>E-Commerce Preset</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ecommercePresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, preset: preset.id })}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    formData.preset === preset.id
                      ? 'border-accentGold bg-accentGold/10'
                      : 'border-secondaryBrown hover:border-accentGold'
                  }`}
                >
                  <h4 className="font-semibold text-sm mb-1">{preset.name}</h4>
                  <p className="text-xs text-neutralGray">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-secondaryBrown text-neutralGray"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBotMutation.isPending}
              className="flex-1 bg-accentGold text-primaryBlack font-bold gold-glow-hover"
            >
              {createBotMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-primaryBlack border-t-transparent rounded-full mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Bot
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}