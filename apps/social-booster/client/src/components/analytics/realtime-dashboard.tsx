import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Zap, 
  Users, 
  Activity,
  Wifi,
  WifiOff,
  RefreshCw
} from "lucide-react";
import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { formatDistanceToNow } from "date-fns";

interface RealtimeDashboardProps {
  className?: string;
}

export default function RealtimeDashboard({ className }: RealtimeDashboardProps) {
  const { data, isConnected, connectionStatus, recentActivity } = useRealtimeAnalytics();

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'disconnected':
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bot_created':
        return '🤖';
      case 'revenue_generated':
        return '💰';
      case 'engagement_spike':
        return '🚀';
      case 'conversion':
        return '✅';
      default:
        return '📊';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'bot_created':
        return 'text-blue-400';
      case 'revenue_generated':
        return 'text-green-400';
      case 'engagement_spike':
        return 'text-purple-400';
      case 'conversion':
        return 'text-accent-gold';
      default:
        return 'text-neutral-gray';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status Banner */}
      <Card className="bg-gradient-to-r from-card-bg to-dark-bg border-secondary-brown">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getConnectionStatusIcon()}
              <div>
                <div className="text-sm font-semibold text-white">
                  Real-time Analytics {getConnectionStatusText()}
                </div>
                <div className="text-xs text-neutral-gray">
                  {isConnected ? 'Data updating every 5 seconds' : 'Attempting to reconnect...'}
                </div>
              </div>
            </div>
            <Badge 
              className={`${
                isConnected 
                  ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                  : 'bg-red-500/20 text-red-400 border-red-500/50'
              }`}
            >
              {isConnected ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="bg-card-bg border-secondary-brown relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Activity className="w-4 h-4 text-accent-gold animate-pulse" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-gray">Live Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-accent-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-gold">
              £{data?.totalRevenue || '0.00'}
            </div>
            <div className="flex items-center text-xs text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{data?.monthlyGrowth?.toFixed(1) || '0.0'}% from last month
            </div>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card className="bg-card-bg border-secondary-brown relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Activity className="w-4 h-4 text-accent-gold animate-pulse" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-gray">Live ROI</CardTitle>
            <Target className="h-4 w-4 text-accent-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-gold">
              {data?.roi || 0}%
            </div>
            <div className="flex items-center text-xs text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              Real-time optimization active
            </div>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card className="bg-card-bg border-secondary-brown relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Activity className="w-4 h-4 text-accent-gold animate-pulse" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-gray">Engagement Rate</CardTitle>
            <Zap className="h-4 w-4 text-accent-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-gold">
              {data?.engagementRate || 0}%
            </div>
            <div className="mt-2">
              <Progress 
                value={data?.engagementRate || 0} 
                className="h-1" 
                max={15}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="bg-card-bg border-secondary-brown relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Activity className="w-4 h-4 text-accent-gold animate-pulse" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-gray">Active Users</CardTitle>
            <Users className="h-4 w-4 text-accent-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-gold">
              {data?.activeUsers || 0}
            </div>
            <div className="flex items-center text-xs text-blue-400">
              <Activity className="h-3 w-3 mr-1" />
              Live user tracking
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card className="bg-card-bg border-secondary-brown">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-gold" />
            Live Activity Feed
            {isConnected && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 ml-auto">
                Live
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <div className="text-center text-neutral-gray py-8">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Waiting for activity updates...</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3 p-3 bg-dark-bg rounded-lg border border-secondary-brown hover:border-accent-gold/50 transition-colors"
                >
                  <div className="text-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${getActivityColor(activity.type)}`}>
                      {activity.message}
                      {activity.value && (
                        <span className="text-accent-gold">
                          {activity.type === 'revenue_generated' 
                            ? ` - £${activity.value}` 
                            : ` - ${activity.value}`}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-gray">
                      {formatDistanceToNow(activity.timestamp)} ago
                    </div>
                  </div>
                  <Badge className="bg-accent-gold/20 text-accent-gold border-accent-gold/50">
                    Live
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}