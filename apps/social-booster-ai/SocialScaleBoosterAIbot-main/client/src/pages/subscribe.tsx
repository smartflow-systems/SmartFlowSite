import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Zap, Bot, BarChart3, Infinity } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?upgrade=success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Welcome to SmartFlow AI Pro!",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="p-4 bg-card-bg border border-secondary-brown rounded-lg" />
      <Button 
        type="submit" 
        disabled={!stripe}
        className="w-full bg-accent-gold text-primary-black hover:opacity-90 font-bold text-lg py-6"
      >
        <Crown className="w-5 h-5 mr-2" />
        Subscribe to Pro Plan - £49/month
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create subscription as soon as the page loads
    apiRequest("POST", "/api/create-subscription")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error creating subscription:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent-gold border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center">
        <Card className="max-w-md bg-card-bg border-secondary-brown">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Unable to load payment</h2>
            <p className="text-neutral-gray mb-4">Please try again or contact support.</p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-accent-gold text-primary-black hover:opacity-90"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <Button 
            onClick={() => window.location.href = "/"}
            className="absolute left-0 top-0 bg-card-bg text-accent-gold border border-accent-gold hover:bg-accent-gold hover:text-primary-black"
          >
            ← Home
          </Button>
          <h1 className="text-4xl font-bold text-white mb-4">
            Upgrade to <span className="text-accent-gold">SmartFlow AI Pro</span>
          </h1>
          <p className="text-xl text-neutral-gray">
            Unlock unlimited bots and premium features
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Plan Comparison */}
          <div className="space-y-6">
            <Card className="bg-card-bg border-secondary-brown">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Free Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-neutral-gray">Up to 3 bots</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-neutral-gray">Basic analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-neutral-gray">Community templates</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent-gold/10 to-gold-trim/5 border-accent-gold relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-accent-gold text-primary-black font-bold">
                  RECOMMENDED
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-accent-gold flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Pro Plan
                </CardTitle>
                <div className="text-3xl font-bold text-white">
                  £49<span className="text-lg text-neutral-gray">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent-gold" />
                  <span className="text-white font-medium">Unlimited bots</span>
                  <Infinity className="w-4 h-4 text-accent-gold" />
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent-gold" />
                  <span className="text-white font-medium">Advanced analytics & insights</span>
                  <BarChart3 className="w-4 h-4 text-accent-gold" />
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent-gold" />
                  <span className="text-white font-medium">Premium bot templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent-gold" />
                  <span className="text-white font-medium">Priority customer support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent-gold" />
                  <span className="text-white font-medium">Advanced scheduling features</span>
                  <Zap className="w-4 h-4 text-accent-gold" />
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent-gold" />
                  <span className="text-white font-medium">AI personality customization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent-gold" />
                  <span className="text-white font-medium">Multi-platform integrations</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <Card className="bg-card-bg border-secondary-brown">
              <CardHeader>
                <CardTitle className="text-accent-gold flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Complete Your Upgrade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              </CardContent>
            </Card>

            <div className="text-center space-y-2">
              <p className="text-sm text-neutral-gray">
                🔒 Secure payment processing powered by Stripe
              </p>
              <p className="text-xs text-neutral-gray">
                Cancel anytime. No hidden fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}