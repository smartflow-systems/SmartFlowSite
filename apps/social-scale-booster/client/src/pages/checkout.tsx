import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ShoppingBag } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
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
        return_url: `${window.location.origin}/dashboard?payment=success`,
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
        description: "Thank you for your purchase!",
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
        <CreditCard className="w-5 h-5 mr-2" />
        Complete Payment
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(2999); // Default amount £29.99

  useEffect(() => {
    // Get amount from URL params if available
    const urlParams = new URLSearchParams(window.location.search);
    const urlAmount = urlParams.get('amount');
    if (urlAmount) {
      setAmount(parseInt(urlAmount));
    }

    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { amount })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error creating payment intent:', error);
        setLoading(false);
      });
  }, [amount]);

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
            <span className="text-accent-gold">Secure Checkout</span>
          </h1>
          <p className="text-xl text-neutral-gray">
            Complete your purchase
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Order Summary */}
          <Card className="bg-card-bg border-secondary-brown mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <span className="text-neutral-gray">Premium Bot Template</span>
                <span className="text-white font-bold">£{(amount / 100).toFixed(2)}</span>
              </div>
              <div className="border-t border-secondary-brown pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-accent-gold">£{(amount / 100).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="bg-card-bg border-secondary-brown">
            <CardHeader>
              <CardTitle className="text-accent-gold flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
              </Elements>
            </CardContent>
          </Card>

          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-neutral-gray">
              🔒 Secure payment processing powered by Stripe
            </p>
            <p className="text-xs text-neutral-gray">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}