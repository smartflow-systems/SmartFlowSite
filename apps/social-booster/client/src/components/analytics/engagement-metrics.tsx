import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/services/analytics";

interface EngagementMetric {
  platform: string;
  engagement: number;
  posts: number;
  conversions: number;
  revenue: number;
  growth: number;
}

interface EngagementMetricsProps {
  metrics: EngagementMetric[];
}

export default function EngagementMetrics({ metrics }: EngagementMetricsProps) {
  return (
    <Card className="bg-card-bg border-secondary-brown">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Platform Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric) => (
            <div key={metric.platform} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{metric.platform}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-accent-gold font-bold">
                    {formatCurrency(metric.revenue)}
                  </span>
                  {metric.growth > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm ${metric.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(Math.abs(metric.growth))}
                  </span>
                </div>
              </div>
              
              <Progress 
                value={metric.engagement} 
                className="h-2 bg-secondary-brown"
                style={{
                  background: `linear-gradient(to right, var(--accent-gold) ${metric.engagement}%, var(--secondary-brown) ${metric.engagement}%)`
                }}
              />
              
              <div className="flex justify-between text-sm text-neutral-gray">
                <span>{metric.posts} posts</span>
                <span>{metric.conversions} conversions</span>
                <span>{formatPercentage(metric.engagement)} engagement</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}