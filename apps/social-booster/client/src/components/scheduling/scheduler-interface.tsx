import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Target, Zap, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScheduleRule {
  id: string;
  condition: string;
  action: string;
  value: string;
  enabled: boolean;
}

export default function SchedulerInterface() {
  const [rules, setRules] = useState<ScheduleRule[]>([
    { id: '1', condition: 'engagement_rate', action: 'post', value: '50', enabled: true },
    { id: '2', condition: 'time', action: 'pause', value: '22:00', enabled: true }
  ]);
  const [newRule, setNewRule] = useState({ condition: '', action: '', value: '', enabled: true });
  const toast = useToast();

  const addRule = () => {
    if (!newRule.condition || !newRule.action || !newRule.value) {
      toast.toast({
        title: "Missing Information",
        description: "Please fill in all rule fields",
        variant: "destructive"
      });
      return;
    }

    const rule: ScheduleRule = {
      id: Date.now().toString(),
      ...newRule
    };
    setRules([...rules, rule]);
    setNewRule({ condition: '', action: '', value: '', enabled: true });
    
    toast.toastSuccess("Automation Rule Added", "Your new smart rule is now active");
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast.toastSuccess("Rule Removed", "Automation rule has been deleted");
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const scheduleTemplates = [
    { name: "Peak Hours Optimizer", description: "Auto-post during high engagement periods (2-4 PM, 7-9 PM)" },
    { name: "Weekend Booster", description: "Increase posting frequency on Saturdays and Sundays" },
    { name: "Engagement Threshold", description: "Only post when engagement rate exceeds 4%" },
    { name: "Holiday Campaign", description: "Activate special campaigns during holidays" },
  ];

  return (
    <div className="space-y-6">
      {/* Schedule Templates */}
      <Card className="bg-card-bg border-secondary-brown">
        <CardHeader>
          <CardTitle className="text-accent-gold flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Smart Scheduling Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduleTemplates.map((template, index) => (
              <div key={index} className="border border-secondary-brown rounded-lg p-4 hover:border-accent-gold transition-colors">
                <h4 className="font-semibold text-white mb-2">{template.name}</h4>
                <p className="text-sm text-neutral-gray mb-3">{template.description}</p>
                <Button 
                  size="sm" 
                  className="w-full bg-secondary-brown text-accent-gold hover:bg-accent-gold hover:text-primary-black"
                  onClick={() => toast.toastSuccess("Template Applied", `${template.name} is now active`)}
                >
                  Apply Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Rules */}
      <Card className="bg-card-bg border-secondary-brown">
        <CardHeader>
          <CardTitle className="text-accent-gold flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Custom Automation Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Rules */}
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 border border-secondary-brown rounded-lg">
                <div className="flex items-center space-x-3">
                  <Switch 
                    checked={rule.enabled} 
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  <div>
                    <span className="text-white">
                      If {rule.condition.replace('_', ' ')} {rule.condition === 'time' ? 'is' : '>'} {rule.value}
                      {rule.condition === 'engagement_rate' && '%'}, then {rule.action}
                    </span>
                    <Badge variant="secondary" className="ml-2 bg-secondary-brown text-accent-gold">
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeRule(rule.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Rule */}
          <div className="border-t border-secondary-brown pt-4">
            <h4 className="text-white font-semibold mb-3">Create New Rule</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-neutral-gray">Condition</Label>
                <Select value={newRule.condition} onValueChange={(value) => setNewRule({...newRule, condition: value})}>
                  <SelectTrigger className="bg-secondary-brown border-secondary-brown text-white">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engagement_rate">Engagement Rate</SelectItem>
                    <SelectItem value="follower_count">Follower Count</SelectItem>
                    <SelectItem value="time">Time</SelectItem>
                    <SelectItem value="day_of_week">Day of Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-neutral-gray">Action</Label>
                <Select value={newRule.action} onValueChange={(value) => setNewRule({...newRule, action: value})}>
                  <SelectTrigger className="bg-secondary-brown border-secondary-brown text-white">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Start Posting</SelectItem>
                    <SelectItem value="pause">Pause Bot</SelectItem>
                    <SelectItem value="boost">Boost Frequency</SelectItem>
                    <SelectItem value="notify">Send Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-neutral-gray">Value</Label>
                <Input 
                  value={newRule.value}
                  onChange={(e) => setNewRule({...newRule, value: e.target.value})}
                  placeholder="Enter value"
                  className="bg-secondary-brown border-secondary-brown text-white"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={addRule}
                  className="w-full bg-accent-gold text-primary-black hover:bg-yellow-500 font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Overview */}
      <Card className="bg-card-bg border-secondary-brown">
        <CardHeader>
          <CardTitle className="text-accent-gold flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary-brown rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-white">Peak Hours Posting</span>
              </div>
              <Badge className="bg-accent-gold text-primary-black">14:00 - 16:00</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary-brown rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-white">Evening Engagement Boost</span>
              </div>
              <Badge className="bg-accent-gold text-primary-black">19:00 - 21:00</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary-brown rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-white">Night Mode Activation</span>
              </div>
              <Badge className="bg-accent-gold text-primary-black">22:00</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}