import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertCircle, Zap, Link, Key, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  platform: string;
  status: 'connected' | 'disconnected' | 'error';
  apiKey?: string;
  lastSync?: string;
}

export default function IntegrationWizard() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { platform: 'Instagram', status: 'connected', lastSync: '2 hours ago' },
    { platform: 'TikTok', status: 'disconnected' },
    { platform: 'Facebook', status: 'error' },
    { platform: 'Twitter', status: 'disconnected' },
    { platform: 'YouTube', status: 'disconnected' },
  ]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [apiKey, setApiKey] = useState('');
  const toast = useToast();

  const platforms = [
    {
      name: 'Instagram',
      description: 'Connect Instagram Business Account for automated posting and engagement',
      icon: '📸',
      features: ['Auto-posting', 'Story scheduling', 'Engagement tracking', 'Hashtag optimization']
    },
    {
      name: 'TikTok',
      description: 'Integrate TikTok for Business to leverage viral content opportunities',
      icon: '🎵',
      features: ['Video scheduling', 'Trend analysis', 'Viral optimization', 'Performance analytics']
    },
    {
      name: 'Facebook',
      description: 'Connect Facebook Pages for comprehensive social media management',
      icon: '👥',
      features: ['Page management', 'Ad automation', 'Audience insights', 'Cross-posting']
    },
    {
      name: 'Twitter',
      description: 'Automate Twitter engagement and content distribution',
      icon: '🐦',
      features: ['Tweet scheduling', 'Thread creation', 'Engagement automation', 'Trend monitoring']
    },
    {
      name: 'YouTube',
      description: 'Manage YouTube content and optimize video performance',
      icon: '📺',
      features: ['Video optimization', 'Thumbnail testing', 'Analytics tracking', 'Comment management']
    }
  ];

  const connectPlatform = () => {
    if (!selectedPlatform || !apiKey) {
      toast.toast({
        title: "Missing Information",
        description: "Please select a platform and enter API key",
        variant: "destructive"
      });
      return;
    }

    // Simulate API connection
    setIntegrations(prev => 
      prev.map(int => 
        int.platform === selectedPlatform 
          ? { ...int, status: 'connected' as const, apiKey, lastSync: 'Just now' }
          : int
      )
    );

    toast.toastSuccess("Platform Connected", `${selectedPlatform} integration is now active`);
    setCurrentStep(1);
    setSelectedPlatform('');
    setApiKey('');
  };

  const disconnectPlatform = (platform: string) => {
    setIntegrations(prev => 
      prev.map(int => 
        int.platform === platform 
          ? { ...int, status: 'disconnected' as const, apiKey: undefined, lastSync: undefined }
          : int
      )
    );
    toast.toastSuccess("Platform Disconnected", `${platform} has been disconnected`);
  };

  const stepperSteps = [
    { number: 1, title: "Select Platform", description: "Choose social media platform" },
    { number: 2, title: "API Configuration", description: "Enter authentication details" },
    { number: 3, title: "Test Connection", description: "Verify integration works" }
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
                      integration.status === 'connected' 
                        ? 'bg-green-500 text-white' 
                        : integration.status === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-500 text-white'
                    }
                  >
                    {integration.status === 'connected' ? (
                      <><Check className="w-3 h-3 mr-1" /> Connected</>
                    ) : integration.status === 'error' ? (
                      <><AlertCircle className="w-3 h-3 mr-1" /> Error</>
                    ) : (
                      'Disconnected'
                    )}
                  </Badge>
                </div>
                {integration.lastSync && (
                  <p className="text-sm text-neutral-gray mb-3">Last sync: {integration.lastSync}</p>
                )}
                <div className="flex gap-2">
                  {integration.status === 'connected' ? (
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
                <div key={step.number} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step.number 
                      ? 'bg-accent-gold text-primary-black' 
                      : 'bg-secondary-brown text-neutral-gray'
                  }`}>
                    {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                  </div>
                  {index < stepperSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-accent-gold' : 'bg-secondary-brown'
                    }`} />
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
            <TabsContent value="1" className="mt-0">
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-4">Choose Platform to Connect</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platforms.map((platform) => (
                    <div 
                      key={platform.name}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPlatform === platform.name 
                          ? 'border-accent-gold bg-accent-gold bg-opacity-10' 
                          : 'border-secondary-brown hover:border-accent-gold'
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
                  Continue to API Setup
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="2" className="mt-0">
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-4">Configure {selectedPlatform} Integration</h4>
                <div className="bg-secondary-brown rounded-lg p-4 border border-accent-gold">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="w-5 h-5 text-accent-gold" />
                    <h5 className="text-white font-semibold">API Authentication</h5>
                  </div>
                  <p className="text-sm text-neutral-gray mb-4">
                    Your API keys are encrypted and stored securely. SmartFlow AI will never share your credentials.
                  </p>
                  <div className="space-y-3">
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
                    <div className="text-xs text-neutral-gray">
                      <p>• Go to {selectedPlatform} Developer Portal</p>
                      <p>• Create a new application</p>
                      <p>• Copy the API key/access token</p>
                      <p>• Paste it above</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline"
                    className="flex-1 border-secondary-brown text-neutral-gray"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-accent-gold text-primary-black hover:bg-yellow-500"
                    disabled={!apiKey}
                    onClick={connectPlatform}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Connect Platform
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Connected Platforms Features */}
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
              <p className="text-sm text-neutral-gray">Enterprise-grade encryption protects all your API keys and data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}