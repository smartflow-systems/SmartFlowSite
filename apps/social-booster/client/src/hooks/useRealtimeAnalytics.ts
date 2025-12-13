import { useEffect, useState, useRef } from 'react';
import { useToast } from './use-toast';

interface AnalyticsData {
  totalRevenue: string;
  monthlyGrowth: number;
  roi: number;
  engagementRate: number;
  activeUsers: number;
  recentActivity: Array<{
    id: string;
    type: 'bot_created' | 'revenue_generated' | 'engagement_spike' | 'conversion';
    message: string;
    timestamp: number;
    value?: number;
  }>;
}

interface RealtimeAnalyticsHook {
  data: AnalyticsData | null;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  recentActivity: AnalyticsData['recentActivity'];
}

export function useRealtimeAnalytics(): RealtimeAnalyticsHook {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [recentActivity, setRecentActivity] = useState<AnalyticsData['recentActivity']>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const connect = () => {
    try {
      setConnectionStatus('connecting');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/analytics`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Real-time analytics connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        toast({
          title: "Real-time Analytics",
          description: "Live data updates are now active",
          duration: 3000,
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'initial_data':
            case 'metrics_update':
              setData(message.data);
              if (message.data.recentActivity) {
                setRecentActivity(prev => {
                  // Combine new activities with existing ones, keep only last 10
                  const combined = [...message.data.recentActivity, ...prev];
                  return combined.slice(0, 10);
                });
              }
              break;
              
            case 'activity_update':
              if (message.data && Array.isArray(message.data)) {
                setRecentActivity(prev => {
                  const combined = [...message.data, ...prev];
                  return combined.slice(0, 10);
                });
                
                // Show notifications for high-value activities
                message.data.forEach((activity: any) => {
                  if (activity.type === 'revenue_generated' && activity.value && activity.value > 100) {
                    toast({
                      title: "💰 High Revenue Alert",
                      description: `${activity.message}: £${activity.value}`,
                      duration: 4000,
                    });
                  } else if (activity.type === 'engagement_spike' && activity.value && activity.value > 400) {
                    toast({
                      title: "🚀 Engagement Spike",
                      description: `${activity.message}: +${activity.value} interactions`,
                      duration: 4000,
                    });
                  }
                });
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Real-time analytics disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setConnectionStatus('error');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    data,
    isConnected,
    connectionStatus,
    recentActivity
  };
}