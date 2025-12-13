import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentSuccessProps {
  type: "subscription" | "payment";
  onContinue: () => void;
}

export default function PaymentSuccess({ type, onContinue }: PaymentSuccessProps) {
  const { toast } = useToast();

  useEffect(() => {
    // Show success toast
    toast({
      title: type === "subscription" ? "Welcome to Pro!" : "Payment Successful",
      description: type === "subscription" 
        ? "Your Pro subscription is now active. Enjoy unlimited bots and premium features!"
        : "Your purchase has been processed successfully.",
    });
  }, [type, toast]);

  return (
    <div className="min-h-screen bg-primary-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gradient-to-br from-accent-gold/10 to-gold-trim/5 border-accent-gold text-center">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                {type === "subscription" ? "Welcome to SmartFlow AI Pro!" : "Payment Successful!"}
              </h2>
              <p className="text-neutral-gray">
                {type === "subscription" 
                  ? "Your Pro subscription is now active. You now have access to unlimited bots, premium templates, and advanced analytics."
                  : "Your purchase has been processed successfully. Thank you for choosing SmartFlow AI!"
                }
              </p>
            </div>

            {/* Pro Features (for subscription) */}
            {type === "subscription" && (
              <div className="bg-card-bg border border-secondary-brown rounded-lg p-4 space-y-3">
                <h3 className="text-accent-gold font-semibold flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Pro Features Unlocked
                </h3>
                <div className="text-sm text-neutral-gray space-y-1">
                  <div>✓ Unlimited bot creation</div>
                  <div>✓ Premium bot templates</div>
                  <div>✓ Advanced analytics dashboard</div>
                  <div>✓ Priority customer support</div>
                  <div>✓ Advanced scheduling features</div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={onContinue}
              className="w-full bg-accent-gold text-primary-black hover:opacity-90 font-bold text-lg py-6"
            >
              Continue to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Additional Info */}
            <div className="text-center space-y-1">
              <p className="text-xs text-neutral-gray">
                {type === "subscription" 
                  ? "You can manage your subscription in the dashboard settings."
                  : "A confirmation email has been sent to your email address."
                }
              </p>
              {type === "subscription" && (
                <p className="text-xs text-neutral-gray">
                  Billing cycle starts today. Cancel anytime.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}