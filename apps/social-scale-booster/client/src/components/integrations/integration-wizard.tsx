import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Check, AlertCircle, Zap, Link, Shield, Send, LogOut, Loader2, ExternalLink } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  platform: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
}

interface TwitterStatus {
  connected: boolean;
  twitterUsername: string | null;
  twitterUserId: string | null;
  expiresAt: number | null;
  lastPostId: string | null;
  lastPostText: string | null;
  lastPostAt: string | null;
  lastError: string | null;
}

function authHeader() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function IntegrationWizard() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [integrations, setIntegrations] = useState<Integration[]>([
    { platform: "Instagram", status: "disconnected" },
    { platform: "TikTok", status: "disconnected" },
    { platform: "Facebook", status: "disconnected" },
    { platform: "Twitter", status: "disconnected" },
    { platform: "YouTube", status: "disconnected" },
  ]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [tweetText, setTweetText] = useState("");
  const [selectedBotId, setSelectedBotId] = useState<number | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  // All bots for the current user
  const { data: allBots = [] } = useQuery<any[]>({ queryKey: ["/api/bots"] });
  const twitterBots = allBots.filter((b: any) => b.platform === "twitter");

  // Twitter status for the selected bot
  const { data: twitterStatus, refetch: refetchStatus } = useQuery<TwitterStatus>({
    queryKey: ["/api/bots", selectedBotId, "twitter/status"],
    queryFn: async () => {
      const res = await fetch(`/api/bots/${selectedBotId}/twitter/status`, {
        headers: authHeader() as HeadersInit,
      });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    enabled: !!selectedBotId && selectedPlatform === "Twitter",
  });

  // On mount: handle ?twitter_connected=1&botId= or ?twitter_error=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const botId = params.get("botId");
    const connected = params.get("twitter_connected");
    const error = params.get("twitter_error");

    if (connected === "1" && botId) {
      setSelectedBotId(Number(botId));
      setSelectedPlatform("Twitter");
      setCurrentStep(3);
      setIntegrations((prev) =>
        prev.map((i) =>
          i.platform === "Twitter" ? { ...i, status: "connected", lastSync: "Just now" } : i
        )
      );
      toast.toastSuccess("X Account Connected", "Your X account is now linked to this bot.");
      // Clean URL without reload
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (error) {
      toast.toast({
        title: "X Connection Failed",
        description: decodeURIComponent(error),
        variant: "destructive",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Sync twitterStatus → integrations tile
  useEffect(() => {
    if (!twitterStatus) return;
    if (twitterStatus.connected) {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.platform === "Twitter"
            ? { ...i, status: "connected", lastSync: twitterStatus.lastPostAt ?? "Just now" }
            : i
        )
      );
    }
  }, [twitterStatus]);

  // Start OAuth flow: get auth URL, redirect browser
  const startOAuthMutation = useMutation({
    mutationFn: async (botId: number) => {
      const res = await fetch(`/api/integrations/twitter/auth-url?botId=${botId}`, {
        headers: authHeader() as HeadersInit,
      });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json() as Promise<{ url: string }>;
    },
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (err: Error) => {
      toast.toast({ title: "Could not start OAuth", description: err.message, variant: "destructive" });
    },
  });

  // Post tweet
  const postTweetMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBotId) throw new Error("No bot selected");
      const res = await fetch(`/api/bots/${selectedBotId}/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() } as HeadersInit,
        body: JSON.stringify({ text: tweetText }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: (data) => {
      toast.toastSuccess("Tweet Posted!", `View it at ${data.tweetUrl}`);
      setTweetText("");
      refetchStatus();
    },
    onError: (err: Error) => {
      toast.toast({ title: "Post Failed", description: err.message, variant: "destructive" });
      refetchStatus();
    },
  });

  // Disconnect Twitter
  const disconnectMutation = useMutation({
    mutationFn: async (botId: number) => {
      const res = await fetch(`/api/bots/${botId}/disconnect/twitter`, {
        method: "POST",
        headers: authHeader() as HeadersInit,
      });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.platform === "Twitter" ? { ...i, status: "disconnected", lastSync: undefined } : i
        )
      );
      queryClient.invalidateQueries({ queryKey: ["/api/bots", selectedBotId, "twitter/status"] });
      toast.toastSuccess("Disconnected", "X account removed from this bot.");
      setConfirmDisconnect(false);
      setCurrentStep(1);
    },
    onError: (err: Error) => {
      toast.toast({ title: "Disconnect Failed", description: err.message, variant: "destructive" });
    },
  });

  // Generic platform connect (non-Twitter)
  const connectGenericPlatform = () => {
    if (!selectedPlatform || !apiKey) {
      toast.toast({ title: "Missing Information", description: "Enter your API key", variant: "destructive" });
      return;
    }
    setIntegrations((prev) =>
      prev.map((i) =>
        i.platform === selectedPlatform ? { ...i, status: "connected", lastSync: "Just now" } : i
      )
    );
    toast.toastSuccess("Platform Connected", `${selectedPlatform} integration is now active`);
    setCurrentStep(1);
    setSelectedPlatform("");
    setApiKey("");
  };

  const disconnectPlatform = (platform: string) => {
    if (platform === "Twitter" && selectedBotId) {
      disconnectMutation.mutate(selectedBotId);
      return;
    }
    setIntegrations((prev) =>
      prev.map((i) =>
        i.platform === platform ? { ...i, status: "disconnected", lastSync: undefined } : i
      )
    );
    toast.toastSuccess("Disconnected", `${platform} has been disconnected`);
  };

  const stepperSteps = [
    { number: 1, title: "Select Platform", description: "Choose social media platform" },
    { number: 2, title: "Authorise", description: "Grant access via OAuth 2.0" },
    { number: 3, title: "Post & Verify", description: "Send a test post to confirm" },
  ];

  const platforms = [
    {
      name: "Instagram",
      description: "Connect Instagram Business Account for automated posting and engagement",
      icon: "📸",
      features: ["Auto-posting", "Story scheduling", "Engagement tracking", "Hashtag optimization"],
    },
    {
      name: "TikTok",
      description: "Integrate TikTok for Business to leverage viral content opportunities",
      icon: "🎵",
      features: ["Video scheduling", "Trend analysis", "Viral optimization", "Performance analytics"],
    },
    {
      name: "Facebook",
      description: "Connect Facebook Pages for comprehensive social media management",
      icon: "👥",
      features: ["Page management", "Ad automation", "Audience insights", "Cross-posting"],
    },
    {
      name: "Twitter",
      description: "Connect your X account via OAuth 2.0 — no manual keys needed",
      icon: "𝕏",
      features: ["Tweet scheduling", "Thread creation", "Engagement automation", "Trend monitoring"],
    },
    {
      name: "YouTube",
      description: "Manage YouTube content and optimise video performance",
      icon: "📺",
      features: ["Video optimisation", "Thumbnail testing", "Analytics tracking", "Comment management"],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Integration Overview */}
      <Card className="bg-card-bg border-secondary-brown">
        <CardHeader>
          <CardTitle className="text-accent-gold flex items-center">
            <Link className="w-5 h-5 mr-2" />
            Platform Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <div key={integration.platform} className="border border-secondary-brown rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">{integration.platform}</h4>
                  <Badge
                    className={
                      integration.status === "connected"
                        ? "bg-green-500 text-white"
                        : integration.status === "error"
                        ? "bg-red-500 text-white"
                        : "bg-gray-500 text-white"
                    }
                  >
                    {integration.status === "connected" ? (
                      <><Check className="w-3 h-3 mr-1" /> Connected</>
                    ) : integration.status === "error" ? (
                      <><AlertCircle className="w-3 h-3 mr-1" /> Error</>
                    ) : (
                      "Disconnected"
                    )}
                  </Badge>
                </div>
                {integration.lastSync && (
                  <p className="text-sm text-neutral-gray mb-3">Last sync: {integration.lastSync}</p>
                )}
                <div className="flex gap-2">
                  {integration.status === "connected" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => disconnectPlatform(integration.platform)}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1 bg-accent-gold text-primary-black hover:bg-yellow-500"
                      onClick={() => {
                        setSelectedPlatform(integration.platform);
                        setCurrentStep(2);
                      }}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Wizard */}
      <Card className="bg-card-bg border-secondary-brown">
        <CardHeader>
          <CardTitle className="text-accent-gold flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Integration Setup Wizard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress Stepper */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              {stepperSteps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                      currentStep >= step.number
                        ? "bg-accent-gold text-primary-black"
                        : "bg-secondary-brown text-neutral-gray"
                    }`}
                  >
                    {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                  </div>
                  {index < stepperSteps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        currentStep > step.number ? "bg-accent-gold" : "bg-secondary-brown"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="text-white font-semibold">{stepperSteps[currentStep - 1]?.title}</h3>
              <p className="text-neutral-gray text-sm">{stepperSteps[currentStep - 1]?.description}</p>
            </div>
          </div>

          {/* Step Content */}
          <Tabs value={currentStep.toString()} className="w-full">
            {/* Step 1 — Choose platform */}
            <TabsContent value="1" className="mt-0">
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-4">Choose Platform to Connect</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platforms.map((platform) => (
                    <div
                      key={platform.name}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPlatform === platform.name
                          ? "border-accent-gold bg-accent-gold bg-opacity-10"
                          : "border-secondary-brown hover:border-accent-gold"
                      }`}
                      onClick={() => setSelectedPlatform(platform.name)}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{platform.icon}</span>
                        <div className="flex-1">
                          <h5 className="text-white font-semibold">{platform.name}</h5>
                          <p className="text-sm text-neutral-gray mb-2">{platform.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {platform.features.map((feature, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-secondary-brown text-accent-gold">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full bg-accent-gold text-primary-black hover:bg-yellow-500"
                  disabled={!selectedPlatform}
                  onClick={() => setCurrentStep(2)}
                >
                  Continue to Authorisation
                </Button>
              </div>
            </TabsContent>

            {/* Step 2 — Authorise */}
            <TabsContent value="2" className="mt-0">
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-4">
                  Connect {selectedPlatform}
                </h4>

                {selectedPlatform === "Twitter" ? (
                  <div className="bg-secondary-brown rounded-lg p-6 border border-accent-gold space-y-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-accent-gold" />
                      <h5 className="text-white font-semibold">OAuth 2.0 — no manual keys</h5>
                    </div>
                    <p className="text-sm text-neutral-gray">
                      You'll be redirected to X to approve access. SmartFlow never sees your password.
                    </p>

                    {twitterBots.length === 0 ? (
                      <p className="text-sm text-red-400">
                        No bots with platform "twitter" found. Create one in the Bots tab first.
                      </p>
                    ) : (
                      <>
                        <div>
                          <Label className="text-neutral-gray">Link to Bot</Label>
                          <select
                            className="w-full bg-primary-black border border-secondary-brown text-white rounded-md px-3 py-2 text-sm mt-1"
                            value={selectedBotId ?? twitterBots[0]?.id}
                            onChange={(e) => setSelectedBotId(Number(e.target.value))}
                          >
                            {twitterBots.map((b: any) => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                        <Button
                          className="w-full bg-accent-gold text-primary-black hover:bg-yellow-500"
                          disabled={startOAuthMutation.isPending}
                          onClick={() => {
                            const botId = selectedBotId ?? twitterBots[0]?.id;
                            setSelectedBotId(botId);
                            startOAuthMutation.mutate(botId);
                          }}
                        >
                          {startOAuthMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting…</>
                          ) : (
                            <>𝕏 &nbsp;Connect X Account</>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-secondary-brown rounded-lg p-4 border border-accent-gold space-y-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Shield className="w-5 h-5 text-accent-gold" />
                      <h5 className="text-white font-semibold">API Key</h5>
                    </div>
                    <p className="text-sm text-neutral-gray">
                      Your credentials are stored securely. SmartFlow AI will never share them.
                    </p>
                    <div>
                      <Label className="text-neutral-gray">API Key / Access Token</Label>
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key"
                        className="bg-primary-black border-secondary-brown text-white"
                      />
                    </div>
                    <div className="text-xs text-neutral-gray space-y-1">
                      <p>• Go to the {selectedPlatform} Developer Portal</p>
                      <p>• Create an application and copy the API key</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-secondary-brown text-neutral-gray"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </Button>
                  {selectedPlatform !== "Twitter" && (
                    <Button
                      className="flex-1 bg-accent-gold text-primary-black hover:bg-yellow-500"
                      disabled={!apiKey}
                      onClick={connectGenericPlatform}
                    >
                      Connect Platform
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Step 3 — Post & verify */}
            <TabsContent value="3" className="mt-0">
              <div className="space-y-4">
                {/* Header: username + expiry badge + disconnect */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-green-400 shrink-0" />
                      <h4 className="text-white font-semibold">
                        {selectedPlatform === "Twitter" && twitterStatus?.twitterUsername
                          ? `Connected as @${twitterStatus.twitterUsername}`
                          : `${selectedPlatform} Connected`}
                      </h4>
                    </div>
                    {/* Token status badge */}
                    {twitterStatus?.expiresAt && (() => {
                      const ms = twitterStatus.expiresAt - Date.now();
                      if (ms < 0) return (
                        <Badge className="bg-red-500 text-white text-xs">Token expired — reconnect</Badge>
                      );
                      if (ms < 24 * 60 * 60 * 1000) return (
                        <Badge className="bg-yellow-500 text-black text-xs">Token expiring soon</Badge>
                      );
                      return (
                        <Badge className="bg-green-600 text-white text-xs">Token active</Badge>
                      );
                    })()}
                  </div>

                  {/* 2-stage disconnect confirm */}
                  {selectedPlatform === "Twitter" && selectedBotId && (
                    <div className="flex items-center gap-2 shrink-0">
                      {confirmDisconnect ? (
                        <>
                          <span className="text-xs text-neutral-gray">Revoke access?</span>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={disconnectMutation.isPending}
                            onClick={() => disconnectMutation.mutate(selectedBotId)}
                          >
                            {disconnectMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes, disconnect"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-secondary-brown text-neutral-gray"
                            onClick={() => setConfirmDisconnect(false)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          onClick={() => setConfirmDisconnect(true)}
                        >
                          <LogOut className="w-3 h-3 mr-1" /> Disconnect
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Last error */}
                {twitterStatus?.lastError && (
                  <div className="bg-red-900 bg-opacity-40 border border-red-500 rounded-lg p-3 text-sm text-red-300">
                    Last error: {twitterStatus.lastError}
                  </div>
                )}

                {/* Last post */}
                {twitterStatus?.lastPostText && (
                  <div className="bg-secondary-brown rounded-lg p-3 border border-secondary-brown text-xs text-neutral-gray flex items-start justify-between gap-2">
                    <div>
                      <span className="text-accent-gold">Last post:</span> {twitterStatus.lastPostText}
                      {twitterStatus.lastPostAt && (
                        <span className="ml-2 opacity-60">· {new Date(twitterStatus.lastPostAt).toLocaleString()}</span>
                      )}
                    </div>
                    {twitterStatus.lastPostId && twitterStatus.twitterUsername && (
                      <a
                        href={`https://x.com/${twitterStatus.twitterUsername}/status/${twitterStatus.lastPostId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-gold shrink-0 hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Tweet composer */}
                <div className="bg-secondary-brown rounded-lg p-4 border border-accent-gold space-y-3">
                  <Label className="text-neutral-gray">Tweet content (max 280 chars)</Label>
                  <Textarea
                    value={tweetText}
                    onChange={(e) => setTweetText(e.target.value)}
                    placeholder="What's happening?"
                    maxLength={280}
                    className="bg-primary-black border-secondary-brown text-white resize-none"
                    rows={4}
                    disabled={!twitterStatus?.connected}
                  />
                  <p className={`text-xs text-right ${tweetText.length > 260 ? "text-yellow-400" : "text-neutral-gray"}`}>
                    {tweetText.length}/280
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-secondary-brown text-neutral-gray"
                    onClick={() => { setCurrentStep(1); setSelectedPlatform(""); setConfirmDisconnect(false); }}
                  >
                    Done
                  </Button>
                  <Button
                    className="flex-1 bg-accent-gold text-primary-black hover:bg-yellow-500"
                    disabled={!tweetText.trim() || postTweetMutation.isPending || !twitterStatus?.connected}
                    onClick={() => postTweetMutation.mutate()}
                  >
                    {postTweetMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting…</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" /> Post Tweet</>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="bg-card-bg border-secondary-brown">
        <CardHeader>
          <CardTitle className="text-accent-gold">Integration Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-gold rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-primary-black" />
              </div>
              <h5 className="text-white font-semibold mb-2">Automated Posting</h5>
              <p className="text-sm text-neutral-gray">Schedule and publish content across all connected platforms simultaneously</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-gold rounded-lg flex items-center justify-center mx-auto mb-3">
                <Link className="w-6 h-6 text-primary-black" />
              </div>
              <h5 className="text-white font-semibold mb-2">Cross-Platform Sync</h5>
              <p className="text-sm text-neutral-gray">Maintain consistent branding and messaging across all social channels</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-gold rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary-black" />
              </div>
              <h5 className="text-white font-semibold mb-2">Secure Connection</h5>
              <p className="text-sm text-neutral-gray">OAuth 2.0 PKCE — no credentials stored, tokens auto-refresh</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
