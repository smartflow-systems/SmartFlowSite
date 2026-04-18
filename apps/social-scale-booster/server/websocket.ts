import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import { storage } from './storage';

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

export class AnalyticsWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private analyticsInterval: NodeJS.Timeout | null = null;
  private activityInterval: NodeJS.Timeout | null = null;

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: '/ws/analytics' });
    
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Analytics WebSocket client connected');
      this.clients.add(ws);
      
      // Send initial data
      this.sendInitialData(ws);
      
      ws.on('close', () => {
        console.log('Analytics WebSocket client disconnected');
        this.clients.delete(ws);
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    // Start broadcasting real-time updates
    this.startRealTimeUpdates();
  }

  private async sendInitialData(ws: WebSocket) {
    try {
      const analyticsData = await this.generateAnalyticsData();
      ws.send(JSON.stringify({
        type: 'initial_data',
        data: analyticsData
      }));
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }

  private startRealTimeUpdates() {
    // Update main metrics every 5 seconds
    this.analyticsInterval = setInterval(async () => {
      const analyticsData = await this.generateAnalyticsData();
      this.broadcast({
        type: 'metrics_update',
        data: analyticsData
      });
    }, 5000);

    // Generate activity updates every 3 seconds
    this.activityInterval = setInterval(() => {
      const activity = this.generateRecentActivity();
      this.broadcast({
        type: 'activity_update',
        data: activity
      });
    }, 3000);
  }

  private async generateAnalyticsData(): Promise<AnalyticsData> {
    // Simulate real-time changes with small variations
    const baseRevenue = 4550.50;
    const revenueVariation = (Math.random() - 0.5) * 100; // ±50 variation
    const currentRevenue = Math.max(0, baseRevenue + revenueVariation);

    const baseROI = 340;
    const roiVariation = (Math.random() - 0.5) * 20; // ±10 variation
    const currentROI = Math.max(0, baseROI + roiVariation);

    const baseEngagement = 8.5;
    const engagementVariation = (Math.random() - 0.5) * 2; // ±1 variation
    const currentEngagement = Math.max(0, baseEngagement + engagementVariation);

    return {
      totalRevenue: currentRevenue.toFixed(2),
      monthlyGrowth: 25.5 + (Math.random() - 0.5) * 5,
      roi: Math.round(currentROI),
      engagementRate: Number(currentEngagement.toFixed(1)),
      activeUsers: Math.floor(Math.random() * 50) + 180, // 180-230 active users
      recentActivity: this.generateRecentActivity()
    };
  }

  private generateRecentActivity() {
    const activities = [
      { type: 'bot_created', message: 'New TikTok bot created', value: null },
      { type: 'revenue_generated', message: 'Sale generated', value: Math.floor(Math.random() * 200) + 50 },
      { type: 'engagement_spike', message: 'Engagement spike detected', value: Math.floor(Math.random() * 500) + 100 },
      { type: 'conversion', message: 'High conversion detected', value: Math.floor(Math.random() * 10) + 5 },
      { type: 'bot_created', message: 'Instagram bot activated', value: null },
      { type: 'revenue_generated', message: 'Product sold via bot', value: Math.floor(Math.random() * 300) + 75 }
    ];

    // Return 1-3 random activities
    const numActivities = Math.floor(Math.random() * 3) + 1;
    const selectedActivities = [];
    
    for (let i = 0; i < numActivities; i++) {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      selectedActivities.push({
        id: Math.random().toString(36).substr(2, 9),
        type: activity.type as 'bot_created' | 'revenue_generated' | 'engagement_spike' | 'conversion',
        message: activity.message,
        timestamp: Date.now(),
        value: activity.value || undefined
      });
    }

    return selectedActivities;
  }

  private broadcast(message: any) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  public close() {
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
      this.analyticsInterval = null;
    }
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
    this.wss.close();
  }
}