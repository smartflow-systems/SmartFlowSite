import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, DollarSign, Eye, MousePointer } from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BotStatsDialogProps {
  botId: number;
  children: React.ReactNode;
}

export default function BotStatsDialog({ botId, children }: BotStatsDialogProps) {
  const [open, setOpen] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: [`/api/bots/${botId}/stats`],
    enabled: open,
  });

  const weeklyEngagementData = {
    labels: stats?.weeklyData?.map((d: any) => d.day) || [],
    datasets: [
      {
        label: 'Engagement',
        data: stats?.weeklyData?.map((d: any) => d.engagement) || [],
        borderColor: '#FFD700',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderWidth: 3,
        tension: 0.4,
      }
    ]
  };

  const weeklyRevenueData = {
    labels: stats?.weeklyData?.map((d: any) => d.day) || [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: stats?.weeklyData?.map((d: any) => parseFloat(d.revenue)) || [],
        backgroundColor: '#FFD700',
        borderColor: '#8B6914',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#FFFFFF'
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#888888'
        },
        grid: {
          color: 'rgba(136, 136, 136, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#888888'
        },
        grid: {
          color: 'rgba(136, 136, 136, 0.1)'
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-card-bg border-secondary-brown">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent-gold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            {stats?.name || 'Bot'} Statistics
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-accent-gold border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-dark-brown border-secondary-brown">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-gray">Total Posts</p>
                      <p className="text-2xl font-bold text-accent-gold">{stats?.totalPosts || 0}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-accent-gold" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-brown border-secondary-brown">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-gray">Engagement</p>
                      <p className="text-2xl font-bold text-accent-gold">{stats?.totalEngagement?.toLocaleString() || 0}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-accent-gold" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-brown border-secondary-brown">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-gray">Revenue</p>
                      <p className="text-2xl font-bold text-accent-gold">£{stats?.revenue || '0.00'}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-accent-gold" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-brown border-secondary-brown">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-gray">Conversion</p>
                      <p className="text-2xl font-bold text-accent-gold">{stats?.conversionRate || '0.0'}%</p>
                    </div>
                    <Users className="w-8 h-8 text-accent-gold" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-dark-brown border-secondary-brown">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-gray">Impressions</p>
                      <p className="text-xl font-bold text-white">{stats?.impressions?.toLocaleString() || 0}</p>
                    </div>
                    <Eye className="w-6 h-6 text-accent-gold" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-brown border-secondary-brown">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-gray">Clicks</p>
                      <p className="text-xl font-bold text-white">{stats?.clicks?.toLocaleString() || 0}</p>
                    </div>
                    <MousePointer className="w-6 h-6 text-accent-gold" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-brown border-secondary-brown">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-gray">Platform</p>
                      <Badge className="bg-rich-brown text-gold-trim border border-accent-gold">
                        {stats?.platform?.toUpperCase() || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-gray">Status</p>
                      <Badge className={`${stats?.status === 'active' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                        {stats?.status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-brown border-secondary-brown">
                <CardHeader>
                  <CardTitle className="text-accent-gold">Weekly Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <Line data={weeklyEngagementData} options={chartOptions} />
                </CardContent>
              </Card>

              <Card className="bg-dark-brown border-secondary-brown">
                <CardHeader>
                  <CardTitle className="text-accent-gold">Weekly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <Bar data={weeklyRevenueData} options={chartOptions} />
                </CardContent>
              </Card>
            </div>

            {/* Top Posts */}
            <Card className="bg-dark-brown border-secondary-brown">
              <CardHeader>
                <CardTitle className="text-accent-gold">Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topPosts?.map((post: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-card-bg border border-secondary-brown rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-medium">{post.content}</p>
                        <p className="text-sm text-neutral-gray">{post.engagement} engagements</p>
                      </div>
                      <div className="text-right">
                        <p className="text-accent-gold font-bold">${post.revenue}</p>
                        <p className="text-xs text-neutral-gray">revenue</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-neutral-gray text-center py-4">No post data available yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Platform Metrics */}
            {stats?.platformMetrics && (
              <Card className="bg-dark-brown border-secondary-brown">
                <CardHeader>
                  <CardTitle className="text-accent-gold">Platform Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.platformMetrics.followers?.toLocaleString()}</p>
                      <p className="text-sm text-neutral-gray">Followers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.platformMetrics.following?.toLocaleString()}</p>
                      <p className="text-sm text-neutral-gray">Following</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.platformMetrics.avgEngagementRate}</p>
                      <p className="text-sm text-neutral-gray">Avg. Engagement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}