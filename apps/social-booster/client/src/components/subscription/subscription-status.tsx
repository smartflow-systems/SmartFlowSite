import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["/api/subscription-status"],
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cancel-subscription");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-status"] });
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will end at the current billing period.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!subscriptionStatus?.isPremium) {
    return null; // Don't show if user is not premium
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel your subscription? You'll lose access to Pro features at the end of your billing period.")) {
      cancelMutation.mutate();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-accent-gold/10 to-gold-trim/5 border-accent-gold">
      <CardHeader>
        <CardTitle className="text-accent-gold flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Pro Subscription
          <Badge className="bg-green-600 text-white ml-auto">
            {subscriptionStatus.status?.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-gold" />
              <span className="text-sm text-neutral-gray">Next billing</span>
            </div>
            <p className="text-white font-medium">
              {subscriptionStatus.currentPeriodEnd ? formatDate(subscriptionStatus.currentPeriodEnd) : 'N/A'}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-accent-gold" />
              <span className="text-sm text-neutral-gray">Amount</span>
            </div>
            <p className="text-white font-medium">£49.00/month</p>
          </div>
        </div>
        
        {subscriptionStatus.cancelAtPeriodEnd && (
          <div className="flex items-center gap-2 p-3 bg-yellow-600/20 border border-yellow-600/50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-200 text-sm">
              Your subscription will end on {formatDate(subscriptionStatus.currentPeriodEnd)}
            </span>
          </div>
        )}
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1 border-accent-gold/50 text-accent-gold hover:bg-accent-gold/10"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Billing
          </Button>
          
          {!subscriptionStatus.cancelAtPeriodEnd && (
            <Button
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              variant="outline"
              className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              Cancel Subscription
            </Button>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-neutral-gray">
            🔒 Secure billing managed by Stripe
          </p>
        </div>
      </CardContent>
    </Card>
  );
}