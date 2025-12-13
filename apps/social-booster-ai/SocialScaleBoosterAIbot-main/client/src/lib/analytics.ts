export interface AnalyticsData {
  totalRevenue: number;
  monthlyGrowth: number;
  engagementRate: number;
  totalPosts: number;
  roi: number;
  chartData: {
    revenue: {
      labels: string[];
      data: number[];
    };
    engagement: {
      labels: string[];
      data: number[];
    };
  };
}

export const generateMockAnalytics = (): AnalyticsData => {
  return {
    totalRevenue: 12450,
    monthlyGrowth: 18,
    engagementRate: 4.7,
    totalPosts: 216,
    roi: 340,
    chartData: {
      revenue: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [8500, 9200, 10100, 11300, 11800, 12450]
      },
      engagement: {
        labels: ['TikTok', 'Instagram', 'Facebook', 'Twitter'],
        data: [35, 28, 22, 15]
      }
    }
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
