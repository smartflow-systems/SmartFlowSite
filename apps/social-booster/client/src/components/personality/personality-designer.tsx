import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageCircle, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PersonalityTraits {
  tone: string;
  formality: number;
  enthusiasm: number;
  creativity: number;
  helpfulness: number;
  humor: number;
}

export default function PersonalityDesigner() {
  const [traits, setTraits] = useState<PersonalityTraits>({
    tone: 'friendly',
    formality: 50,
    enthusiasm: 70,
    creativity: 80,
    helpfulness: 90,
    humor: 40
  });
  const [previewText, setPreviewText] = useState("");
  const toast = useToast();

  const personalityPresets = [
    { 
      name: "Professional Expert", 
      description: "Authoritative, informative, trustworthy",
      traits: { tone: 'professional', formality: 85, enthusiasm: 60, creativity: 50, helpfulness: 95, humor: 20 }
    },
    { 
      name: "Friendly Enthusiast", 
      description: "Warm, exciting, relatable",
      traits: { tone: 'friendly', formality: 30, enthusiasm: 90, creativity: 85, helpfulness: 80, humor: 70 }
    },
    { 
      name: "Creative Innovator", 
      description: "Artistic, trendy, inspiring",
      traits: { tone: 'creative', formality: 25, enthusiasm: 80, creativity: 95, helpfulness: 70, humor: 60 }
    },
    { 
      name: "Luxury Advisor", 
      description: "Sophisticated, exclusive, premium",
      traits: { tone: 'luxury', formality: 90, enthusiasm: 50, creativity: 70, helpfulness: 85, humor: 15 }
    }
  ];

  const applyPreset = (preset: any) => {
    setTraits(preset.traits);
    generatePreview(preset.traits);
    toast.toastSuccess("Personality Applied", `${preset.name} personality is now active`);
  };

  const generatePreview = (currentTraits: PersonalityTraits) => {
    const samples = {
      professional: "Discover our premium collection designed for discerning customers who value quality and excellence.",
      friendly: "Hey there! 😊 Check out these amazing products - they're absolutely perfect for you!",
      creative: "✨ Unleash your inner artist with our stunning collection that transforms ordinary into extraordinary!",
      luxury: "Experience unparalleled sophistication with our exclusive, meticulously crafted luxury collection."
    };
    
    setPreviewText(samples[currentTraits.tone as keyof typeof samples] || samples.friendly);
  };

  const updateTrait = (trait: keyof PersonalityTraits, value: any) => {
    const newTraits = { ...traits, [trait]: value };
    setTraits(newTraits);
    generatePreview(newTraits);
  };

  const savePersonality = () => {
    // Here you would save to the database
    toast.toastSuccess("Personality Saved", "Your bot's personality has been updated successfully");
  };

  return (
    <div className="space-y-6">
      {/* Personality Presets */}
      <Card className="bg-card-bg border-secondary-brown">
        <CardHeader>
          <CardTitle className="text-accent-gold flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            Personality Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {personalityPresets.map((preset, index) => (
              <div key={index} className="border border-secondary-brown rounded-lg p-4 hover:border-accent-gold transition-colors">
                <h4 className="font-semibold text-white mb-2">{preset.name}</h4>
                <p className="text-sm text-neutral-gray mb-3">{preset.description}</p>
                <Button 
                  size="sm" 
                  className="w-full bg-secondary-brown text-accent-gold hover:bg-accent-gold hover:text-primary-black"
                  onClick={() => applyPreset(preset)}
                >
                  Apply Preset
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Personality Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card-bg border-secondary-brown">
          <CardHeader>
            <CardTitle className="text-accent-gold flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Personality Traits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tone Selection */}
            <div>
              <Label className="text-neutral-gray mb-2 block">Communication Tone</Label>
              <Select value={traits.tone} onValueChange={(value) => updateTrait('tone', value)}>
                <SelectTrigger className="bg-secondary-brown border-secondary-brown text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trait Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-neutral-gray">Formality</Label>
                  <span className="text-accent-gold font-semibold">{traits.formality}%</span>
                </div>
                <Slider
                  value={[traits.formality]}
                  onValueChange={(value) => updateTrait('formality', value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-gray mt-1">
                  <span>Casual</span>
                  <span>Formal</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-neutral-gray">Enthusiasm</Label>
                  <span className="text-accent-gold font-semibold">{traits.enthusiasm}%</span>
                </div>
                <Slider
                  value={[traits.enthusiasm]}
                  onValueChange={(value) => updateTrait('enthusiasm', value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-gray mt-1">
                  <span>Calm</span>
                  <span>Excited</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-neutral-gray">Creativity</Label>
                  <span className="text-accent-gold font-semibold">{traits.creativity}%</span>
                </div>
                <Slider
                  value={[traits.creativity]}
                  onValueChange={(value) => updateTrait('creativity', value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-gray mt-1">
                  <span>Traditional</span>
                  <span>Innovative</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-neutral-gray">Helpfulness</Label>
                  <span className="text-accent-gold font-semibold">{traits.helpfulness}%</span>
                </div>
                <Slider
                  value={[traits.helpfulness]}
                  onValueChange={(value) => updateTrait('helpfulness', value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-gray mt-1">
                  <span>Direct</span>
                  <span>Supportive</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-neutral-gray">Humor</Label>
                  <span className="text-accent-gold font-semibold">{traits.humor}%</span>
                </div>
                <Slider
                  value={[traits.humor]}
                  onValueChange={(value) => updateTrait('humor', value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-gray mt-1">
                  <span>Serious</span>
                  <span>Playful</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview and Save */}
        <Card className="bg-card-bg border-secondary-brown">
          <CardHeader>
            <CardTitle className="text-accent-gold flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Personality Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Traits Display */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-accent-gold text-primary-black">{traits.tone}</Badge>
              <Badge variant="secondary" className="bg-secondary-brown text-accent-gold">
                {traits.formality >= 70 ? 'Formal' : traits.formality <= 30 ? 'Casual' : 'Balanced'}
              </Badge>
              <Badge variant="secondary" className="bg-secondary-brown text-accent-gold">
                {traits.enthusiasm >= 70 ? 'Enthusiastic' : 'Measured'}
              </Badge>
              <Badge variant="secondary" className="bg-secondary-brown text-accent-gold">
                {traits.creativity >= 70 ? 'Creative' : 'Traditional'}
              </Badge>
            </div>

            {/* Preview Text */}
            <div className="bg-secondary-brown rounded-lg p-4 border border-accent-gold">
              <Label className="text-neutral-gray text-sm mb-2 block">Sample Message Preview:</Label>
              <p className="text-white leading-relaxed">{previewText}</p>
            </div>

            {/* Custom Message Testing */}
            <div>
              <Label className="text-neutral-gray mb-2 block">Test Custom Message</Label>
              <Textarea
                placeholder="Enter a custom message to see how your personality would handle it..."
                className="bg-secondary-brown border-secondary-brown text-white min-h-[100px]"
                onChange={(e) => setPreviewText(e.target.value)}
              />
            </div>

            {/* Save Button */}
            <Button 
              className="w-full bg-accent-gold text-primary-black hover:bg-yellow-500 font-semibold"
              onClick={savePersonality}
            >
              <Zap className="w-4 h-4 mr-2" />
              Save Personality Settings
            </Button>

            {/* Personality Stats */}
            <div className="border-t border-secondary-brown pt-4">
              <h4 className="text-white font-semibold mb-2">Personality Analysis</h4>
              <div className="text-sm text-neutral-gray space-y-1">
                <p>• Best for: {traits.creativity >= 70 ? 'Creative campaigns' : 'Professional content'}</p>
                <p>• Engagement style: {traits.enthusiasm >= 70 ? 'High-energy interactions' : 'Measured responses'}</p>
                <p>• Target audience: {traits.formality >= 70 ? 'Professional/Business' : 'General/Consumer'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}