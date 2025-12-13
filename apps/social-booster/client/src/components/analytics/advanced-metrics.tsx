import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Target, Zap, Users } from "lucide-react";
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

interface AdvancedMetricsProps {
  metrics: any;
}

export default function AdvancedMetrics({ metrics }: AdvancedMetricsProps) {
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue (£)',
        data: [2850, 3200, 3950, 4100, 4300, 4550],
        borderColor: '#FFD700',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderWidth: 3,
        tension: 0.4,
      }
    ]
  };

  const engagementData = {
    labels: ['TikTok', 'Instagram', 'Facebook', 'Twitter', 'YouTube'],
    datasets: [
      {
        data: [35, 28, 22, 10, 5],
        backgroundColor: [
          '#FFD700',
          '#8B6914',
          '#A0522D',
          '#CD853F',
          '#B8860B'
        ],
        borderWidth: 0,
      }
    ]
  };

  const performanceData = {
    labels: ['Product Showcase', 'Flash Sales', 'Testimonials', 'Trends', 'Behind Scenes'],
    datasets: [
      {
        label: 'Conversion Rate (%)',
        data: [4.2, 6.8, 3.1, 5.5, 2.9],
        backgroundColor: '#FFD700',
        borderColor: '#8B6914',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#FFFFFF',
          font: { family: 'Inter', weight: 'bold' as const }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#888888', font: { family: 'Inter' } },
        grid: { color: '#3E2723' }
      },
      y: {
        ticks: { color: '#888888', font: { family: 'Inter' } },
        grid: { color: '#3E2723' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#FFFFFF',
          font: { family: 'Inter', weight: 'bold' as const },
          padding: 20
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card-bg border-secondary-brown">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-gray">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-accent-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-gold">£{metrics?.totalRevenue || '4,550.50'}</div>
            <div className="flex items-center text-xs text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{metrics?.monthlyGrowth || 25.5}% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-secondary-brown">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-gray">ROI</CardTitle>
            <Target className="h-4 w-4 text-accent-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-gold">{metrics?.roi || 340}%</div>
            <div className="flex items-center text-xs text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% efficiency gain
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-secondary-brown">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-gray">Engagement Rate</CardTitle>
            <Zap className="h-4 w-4 text-accent-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-gold">{metrics?.engagementRate || 4.7}%</div>
            <div className="flex items-center text-xs text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              Above industry avg
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-secondary-brown">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-gray">Active Bots</CardTitle>
            <Users className="h-4 w-4 text-accent-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-gold">{metrics?.totalPosts || 47}</div>
            <div className="text-xs text-neutral-gray">Posts generated</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-card-bg border-secondary-brown">
          <CardHeader>
            <CardTitle className="text-accent-gold">Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={revenueData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card className="bg-card-bg border-secondary-brown">
          <CardHeader>
            <CardTitle className="text-accent-gold">Platform Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={engagementData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Bot Performance */}
        <Card className="bg-card-bg border-secondary-brown lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-accent-gold">Bot Type Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={performanceData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card-bg border-secondary-brown">
          <CardHeader>
            <CardTitle className="text-accent-gold">Goal Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-gray">Monthly Revenue Goal</span>
                <span className="text-accent-gold">91%</span>
              </div>
              <Progress value={91} className="h-2 bg-secondary-brown" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-gray">Engagement Target</span>
                <span className="text-accent-gold">156%</span>
              </div>
              <Progress value={100} className="h-2 bg-secondary-brown" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-gray">Bot Efficiency</span>
                <span className="text-accent-gold">84%</span>
              </div>
              <Progress value={84} className="h-2 bg-secondary-brown" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-secondary-brown">
          <CardHeader>
            <CardTitle className="text-accent-gold">Quick Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-sm text-neutral-gray">TikTok bots performing 23% above average</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-accent-gold"></div>
              <span className="text-sm text-neutral-gray">Flash sale campaigns show highest ROI</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-sm text-neutral-gray">Engagement peaks at 2-4 PM daily</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              <span className="text-sm text-neutral-gray">Premium features boost conversion by 45%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}