import { db } from "./db";
import { users, botTemplates, analytics } from "@shared/schema";

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const [demoUser] = await db.insert(users).values({
    username: "demo_user",
    password: "password",
    email: "demo@smartflowai.com",
    isPremium: false,
    botCount: 0
  }).returning();

  console.log("✅ Created demo user");

  // Create bot templates
  const templates = [
    {
      name: "TikTok Product Booster Pro",
      description: "Advanced viral video creator with AI-powered trend analysis and auto-posting for maximum e-commerce conversions",
      category: "E-commerce",
      platform: "tiktok",
      isPremium: true,
      price: "29.00",
      rating: "4.9",
      reviewCount: 127,
      config: { autoPosting: true, trendAnalysis: true, viralOptimization: true, ecommerceTracking: true },
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      name: "Instagram Flash Sale Creator",
      description: "Create urgency-driven flash sales with countdown timers and Stories automation for maximum conversions",
      category: "E-commerce",
      platform: "instagram",
      isPremium: true,
      price: "24.99",
      rating: "4.8",
      reviewCount: 89,
      config: { flashSales: true, countdownTimers: true, storiesAutomation: true, urgencyMarketing: true },
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      name: "Multi-Platform Testimonial Showcase",
      description: "Automatically share customer reviews across TikTok, Instagram, and Facebook to build authentic social proof",
      category: "E-commerce",
      platform: "multi",
      isPremium: false,
      price: "0",
      rating: "4.6",
      reviewCount: 203,
      config: { testimonialSharing: true, socialProof: true, multiPlatform: true, reviewAutomation: true },
      imageUrl: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      name: "Beauty Brand Trend Tracker",
      description: "AI-powered trend analysis specifically for beauty and cosmetics brands with viral content suggestions",
      category: "Beauty",
      platform: "tiktok",
      isPremium: true,
      price: "34.99",
      rating: "4.7",
      reviewCount: 76,
      config: { beautyTrends: true, aiAnalysis: true, viralSuggestions: true, cosmeticsOptimized: true },
      imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      name: "Fashion Week Content Automator",
      description: "Seasonal fashion content with style guides and outfit inspirations for maximum engagement",
      category: "Fashion",
      platform: "instagram",
      isPremium: true,
      price: "27.99",
      rating: "4.5",
      reviewCount: 94,
      config: { fashionContent: true, seasonalPosts: true, styleGuides: true, outfitInspiration: true },
      imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      name: "Tech Review Automation Suite",
      description: "Comprehensive tech product reviews with comparison features and detailed analytics",
      category: "Technology",
      platform: "youtube",
      isPremium: false,
      price: "0",
      rating: "4.4",
      reviewCount: 156,
      config: { techReviews: true, productComparison: true, detailedAnalytics: true, reviewAutomation: true },
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    }
  ];

  await db.insert(botTemplates).values(templates);
  console.log("✅ Created bot templates");

  // Create sample analytics data
  const analyticsData = [
    {
      userId: demoUser.id,
      revenue: "1250.00",
      engagement: "4.2",
      posts: 15,
      clicks: 890,
      conversions: 23
    },
    {
      userId: demoUser.id,
      revenue: "980.50",
      engagement: "3.8",
      posts: 12,
      clicks: 740,
      conversions: 18
    },
    {
      userId: demoUser.id,
      revenue: "2320.00",
      engagement: "5.1",
      posts: 20,
      clicks: 1450,
      conversions: 41
    }
  ];

  await db.insert(analytics).values(analyticsData);
  console.log("✅ Created analytics data");

  console.log("🎉 Database seeding completed!");
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };