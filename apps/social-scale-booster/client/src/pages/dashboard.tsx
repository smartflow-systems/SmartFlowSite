import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Bot, BarChart3, Store, File, Search, Calendar, Users, Zap, Settings } from "lucide-react";
import BotCard from "@/components/bots/bot-card";
import CreateBotDialog from "@/components/bots/create-bot-dialog";
import BotStatsDialog from "@/components/bots/bot-stats-dialog";
import TemplateCard from "@/components/marketplace/template-card";
import AnalyticsCharts from "@/components/analytics/charts";
import CategoryFilter from "@/components/marketplace/category-filter";
import EngagementMetrics from "@/components/analytics/engagement-metrics";
import AdvancedMetrics from "@/components/analytics/advanced-metrics";
import RealtimeDashboard from "@/components/analytics/realtime-dashboard";
import SchedulerInterface from "@/components/scheduling/scheduler-interface";
import PersonalityDesigner from "@/components/personality/personality-designer";
import IntegrationWizard from "@/components/integrations/integration-wizard";
import EnhancedMarketplace from "@/components/marketplace/enhanced-marketplace";
import UpgradeCard from "@/components/subscription/upgrade-card";
import SubscriptionStatus from "@/components/subscription/subscription-status";
import PaymentSuccess from "@/components/subscription/payment-success";
import { analyticsService } from "@/services/analytics";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("bots");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<"subscription" | "payment">("subscription");

  // Check for success parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const upgradeSuccess = urlParams.get('upgrade');
    const paymentSuccess = urlParams.get('payment');
    
    if (upgradeSuccess === 'success') {
      setSuccessType('subscription');
      setShowSuccess(true);
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    } else if (paymentSuccess === 'success') {
      setSuccessType('payment');
      setShowSuccess(true);
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const { data: userStatus } = useQuery({
    queryKey: ["/api/user/status"],
  });

  const { data: bots } = useQuery({
    queryKey: ["/api/bots"],
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
  });

  const { data: analyticsMetrics } = useQuery({
    queryKey: ["/api/analytics/metrics"],
  });

  const { data: engagementMetrics } = useQuery({
    queryKey: ["engagement-metrics"],
    queryFn: () => analyticsService.getEngagementByPlatform(),
  });

  // Filter templates based on category and search
  const filteredTemplates = templates?.filter((template: any) => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Show success modal if needed
  if (showSuccess) {
    return (
      <PaymentSuccess 
        type={successType}
        onContinue={() => setShowSuccess(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Dashboard Header */}
      <header className="bg-card-bg border-b border-secondary-brown">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Bot className="text-accent-gold w-8 h-8 cursor-pointer hover:scale-110 transition-transform" onClick={() => window.location.href = "/"} />
              <span className="text-xl font-bold">Dashboard</span>
              <Badge className="bg-rich-brown text-gold-trim border border-accent-gold font-semibold gold-glow">
                {userStatus?.isPremium ? "Pro Plan" : `Free Plan (${userStatus?.botCount || 0}/3 bots)`}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setLocation("/")}
                className="bg-card-bg text-accent-gold border border-accent-gold font-semibold hover:bg-accent-gold hover:text-primary-black"
              >
                ← Home
              </Button>
              <Button 
                onClick={() => window.location.href = "/subscribe"}
                className="bg-rich-brown text-gold-trim border border-accent-gold font-semibold gold-glow-hover hover:bg-accent-gold hover:text-primary-black"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Pro
              </Button>
              <div className="w-8 h-8 bg-accent-gold rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-card-bg border-b border-secondary-brown">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent h-auto p-2 grid grid-cols-3 sm:flex sm:gap-4 lg:gap-8 w-full">
              <TabsTrigger 
                value="bots" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent-gold data-[state=active]:text-accent-gold text-neutral-gray py-3 px-1 sm:px-3 font-semibold rounded-none bg-transparent text-xs sm:text-base flex flex-col sm:flex-row items-center justify-center"
              >
                <Bot className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span className="sm:hidden">Bots</span>
                <span className="hidden sm:inline">My Bots</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent-gold data-[state=active]:text-accent-gold text-neutral-gray py-3 px-1 sm:px-3 font-semibold rounded-none bg-transparent text-xs sm:text-base flex flex-col sm:flex-row items-center justify-center"
              >
                <BarChart3 className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="marketplace" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent-gold data-[state=active]:text-accent-gold text-neutral-gray py-3 px-1 sm:px-3 font-semibold rounded-none bg-transparent text-xs sm:text-base flex flex-col sm:flex-row items-center justify-center"
              >
                <Store className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span className="sm:hidden">Store</span>
                <span className="hidden sm:inline">Marketplace</span>
              </TabsTrigger>
              <TabsTrigger 
                value="scheduling" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent-gold data-[state=active]:text-accent-gold text-neutral-gray py-3 px-1 sm:px-3 font-semibold rounded-none bg-transparent text-xs sm:text-base flex flex-col sm:flex-row items-center justify-center"
              >
                <Calendar className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span className="sm:hidden">Time</span>
                <span className="hidden sm:inline">Scheduling</span>
              </TabsTrigger>
              <TabsTrigger 
                value="personality" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent-gold data-[state=active]:text-accent-gold text-neutral-gray py-3 px-1 sm:px-3 font-semibold rounded-none bg-transparent text-xs sm:text-base flex flex-col sm:flex-row items-center justify-center"
              >
                <Users className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span className="sm:hidden">Style</span>
                <span className="hidden sm:inline">Personality</span>
              </TabsTrigger>
              <TabsTrigger 
                value="integrations" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent-gold data-[state=active]:text-accent-gold text-neutral-gray py-3 px-1 sm:px-3 font-semibold rounded-none bg-transparent text-xs sm:text-base flex flex-col sm:flex-row items-center justify-center"
              >
                <Zap className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span className="sm:hidden">Apps</span>
                <span className="hidden sm:inline">Integrations</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <TabsContent value="bots" className="mt-0">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold">My Bots</h2>
                  <CreateBotDialog 
                    isPremium={userStatus?.isPremium || false}
                    botCount={userStatus?.botCount || 0}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bots?.map((bot: any) => (
                    <BotCard key={bot.id} bot={bot} />
                  ))}
                  
                  {/* Upgrade prompt card */}
                  {!userStatus?.isPremium && (
                    <div className="bg-gradient-to-br from-accent-gold to-yellow-600 rounded-xl p-6 text-primary-black">
                      <div className="text-center">
                        <Crown className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Create More Bots</h3>
                        <p className="mb-4 text-sm opacity-90">Upgrade to Pro for unlimited bot creation</p>
                        <Button 
                          onClick={() => window.location.href = "/subscribe"}
                          className="bg-primary-black text-accent-gold hover:bg-secondary-brown"
                        >
                          Unlock Now
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subscription Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  <UpgradeCard />
                  <SubscriptionStatus />
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <h2 className="text-3xl font-bold mb-8">Real-Time Analytics & ROI</h2>
                <div className="space-y-8">
                  <RealtimeDashboard />
                  <AdvancedMetrics metrics={analyticsMetrics} />
                </div>
              </TabsContent>

              <TabsContent value="marketplace" className="mt-0">
                <h2 className="text-3xl font-bold mb-8">Premium Bot Marketplace</h2>
                <EnhancedMarketplace userStatus={userStatus} />
              </TabsContent>

              <TabsContent value="templates" className="mt-0">
                <h2 className="text-3xl font-bold mb-8">E-Commerce Bot Presets</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-card-bg border border-secondary-brown rounded-xl p-6 hover:border-accent-gold transition-colors">
                    <div className="w-12 h-12 bg-accent-gold rounded-lg flex items-center justify-center mb-4">
                      <Store className="text-primary-black w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Product Showcase Bot</h3>
                    <p className="text-neutral-gray mb-4">Highlight product features with engaging visuals and automatic hashtag optimization</p>
                    <CreateBotDialog 
                      isPremium={userStatus?.isPremium || false}
                      botCount={userStatus?.botCount || 0}
                    >
                      <Button className="w-full bg-secondary-brown text-accent-gold hover:bg-accent-gold hover:text-primary-black">
                        Create Bot
                      </Button>
                    </CreateBotDialog>
                  </div>

                  <div className="bg-card-bg border border-secondary-brown rounded-xl p-6 hover:border-accent-gold transition-colors">
                    <div className="w-12 h-12 bg-accent-gold rounded-lg flex items-center justify-center mb-4">
                      <Crown className="text-primary-black w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Flash Sale Announcer</h3>
                    <p className="text-neutral-gray mb-4">Create urgency with flash sales, countdown timers, and limited-time offers</p>
                    <CreateBotDialog 
                      isPremium={userStatus?.isPremium || false}
                      botCount={userStatus?.botCount || 0}
                    >
                      <Button className="w-full bg-secondary-brown text-accent-gold hover:bg-accent-gold hover:text-primary-black">
                        Create Bot
                      </Button>
                    </CreateBotDialog>
                  </div>

                  <div className="bg-card-bg border border-secondary-brown rounded-xl p-6 hover:border-accent-gold transition-colors">
                    <div className="w-12 h-12 bg-accent-gold rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="text-primary-black w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Customer Testimonial Bot</h3>
                    <p className="text-neutral-gray mb-4">Share authentic customer reviews and success stories to build social proof</p>
                    <CreateBotDialog 
                      isPremium={userStatus?.isPremium || false}
                      botCount={userStatus?.botCount || 0}
                    >
                      <Button className="w-full bg-secondary-brown text-accent-gold hover:bg-accent-gold hover:text-primary-black">
                        Create Bot
                      </Button>
                    </CreateBotDialog>
                  </div>

                  <div className="bg-card-bg border border-secondary-brown rounded-xl p-6 hover:border-accent-gold transition-colors">
                    <div className="w-12 h-12 bg-accent-gold rounded-lg flex items-center justify-center mb-4">
                      <Bot className="text-primary-black w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Behind the Scenes Bot</h3>
                    <p className="text-neutral-gray mb-4">Show product creation process and company culture to build authentic connections</p>
                    <CreateBotDialog 
                      isPremium={userStatus?.isPremium || false}
                      botCount={userStatus?.botCount || 0}
                    >
                      <Button className="w-full bg-secondary-brown text-accent-gold hover:bg-accent-gold hover:text-primary-black">
                        Create Bot
                      </Button>
                    </CreateBotDialog>
                  </div>

                  <div className="bg-card-bg border border-secondary-brown rounded-xl p-6 hover:border-accent-gold transition-colors">
                    <div className="w-12 h-12 bg-accent-gold rounded-lg flex items-center justify-center mb-4">
                      <File className="text-primary-black w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Trend Tracker Bot</h3>
                    <p className="text-neutral-gray mb-4">AI-powered trend analysis to create viral content that drives maximum engagement</p>
                    <CreateBotDialog 
                      isPremium={userStatus?.isPremium || false}
                      botCount={userStatus?.botCount || 0}
                    >
                      <Button className="w-full bg-secondary-brown text-accent-gold hover:bg-accent-gold hover:text-primary-black">
                        Create Bot
                      </Button>
                    </CreateBotDialog>
                  </div>

                  <div className="bg-card-bg border border-secondary-brown rounded-xl p-6 hover:border-accent-gold transition-colors">
                    <div className="w-12 h-12 bg-accent-gold rounded-lg flex items-center justify-center mb-4">
                      <Crown className="text-primary-black w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Multi-Platform Scheduler</h3>
                    <p className="text-neutral-gray mb-4">Coordinate campaigns across TikTok, Instagram, Facebook, and Twitter simultaneously</p>
                    <CreateBotDialog 
                      isPremium={userStatus?.isPremium || false}
                      botCount={userStatus?.botCount || 0}
                    >
                      <Button className="w-full bg-secondary-brown text-accent-gold hover:bg-accent-gold hover:text-primary-black">
                        Create Bot
                      </Button>
                    </CreateBotDialog>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scheduling" className="mt-0">
                <h2 className="text-3xl font-bold mb-8">Smart Scheduling & Automation</h2>
                <SchedulerInterface />
              </TabsContent>

              <TabsContent value="personality" className="mt-0">
                <h2 className="text-3xl font-bold mb-8">Bot Personality Designer</h2>
                <PersonalityDesigner />
              </TabsContent>

              <TabsContent value="integrations" className="mt-0">
                <h2 className="text-3xl font-bold mb-8">Platform Integrations</h2>
                <IntegrationWizard />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
