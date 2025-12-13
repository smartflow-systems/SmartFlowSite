import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Instagram, Edit, BarChart3, Play, Pause, Square } from "lucide-react";
import { Bot } from "@shared/schema";
import BotStatsDialog from "./bot-stats-dialog";
import EditBotDialog from "./edit-bot-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BotCardProps {
  bot: Bot;
}

export default function BotCard({ bot }: BotCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return apiRequest("PATCH", `/api/bots/${bot.id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({
        title: "Bot Updated",
        description: `Bot status changed to ${bot.status}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bot status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'stopped': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStatusToggle = () => {
    const newStatus = bot.status === 'active' ? 'paused' : 'active';
    updateStatusMutation.mutate(newStatus);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok': return <ShoppingBag className="text-primary-black w-6 h-6" />;
      case 'instagram': return <Instagram className="text-primary-black w-6 h-6" />;
      default: return <ShoppingBag className="text-primary-black w-6 h-6" />;
    }
  };

  const metrics = bot.metrics as any || { posts: 0, engagement: 0 };

  return (
    <Card className="bg-card-bg border-secondary-brown hover:border-accent-gold transition-colors">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-accent-gold rounded-lg flex items-center justify-center">
            {getPlatformIcon(bot.platform)}
          </div>
          <Badge className={`${getStatusColor(bot.status)} text-white text-xs font-semibold`}>
            {bot.status?.charAt(0).toUpperCase() + bot.status?.slice(1) || 'Active'}
          </Badge>
        </div>
        
        <h3 className="text-xl font-bold mb-2">{bot.name}</h3>
        <p className="text-neutral-gray mb-4">{bot.description}</p>
        
        <div className="flex justify-between items-center text-sm mb-4">
          <span className="text-accent-gold font-semibold">{metrics.posts} posts</span>
          <span className="text-green-400 font-semibold">+{metrics.engagement}% engagement</span>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <Button 
            onClick={handleStatusToggle}
            disabled={updateStatusMutation.isPending}
            className={`flex-1 ${bot.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white transition-colors`}
          >
            {bot.status === 'active' ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Start
              </>
            )}
          </Button>
          <Button 
            onClick={() => updateStatusMutation.mutate('stopped')}
            disabled={updateStatusMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex space-x-2">
          <EditBotDialog bot={bot}>
            <Button className="flex-1 bg-secondary-brown text-accent-gold hover:bg-accent-gold hover:text-primary-black transition-colors">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </EditBotDialog>
          <BotStatsDialog botId={bot.id}>
            <Button className="flex-1 bg-accent-gold text-primary-black hover:opacity-90 transition-opacity">
              <BarChart3 className="w-4 h-4 mr-1" />
              Stats
            </Button>
          </BotStatsDialog>
        </div>
      </CardContent>
    </Card>
  );
}
