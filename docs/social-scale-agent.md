# Social Scale Agent
Last updated: 2026-03-22

## Role
Dedicated context agent for SocialScaleBooster — AI content generation for barbers and salons.
Use this agent for all work related to social media automation and content gen.

## Product: SocialScaleBooster
- AI caption and content generator (OpenAI GPT-4o-mini)
- Niche-specific prompts for barbers, salons, gyms
- Tiered usage limits per tenant
- Scheduled posting (Instagram, TikTok, Facebook)
- Hashtag suggestions and trend matching

## Repo
github.com/smartflow-systems/SocialScaleBooster

## Pricing tiers
- Starter: £29/month — 100 AI generations/month
- Pro: £97/month — 1,000 AI generations/month
- Agency: £297/month — unlimited, white label

## OpenAI setup
Model: GPT-4o-mini (cost efficient)
Per-tenant usage limits enforced in middleware
API key stored in GitHub org secrets: OPENAI_API_KEY

## Onboarding flow
1. Collect niche (barber / salon / gym / other)
2. Collect brand voice (professional / casual / hype)
3. Set up tenant account with usage tier
4. Generate first 5 posts as demo
5. Connect social accounts (optional)
6. Schedule first week of content

## Prompting structure (barber niche)
System: "You are a social media expert for UK barbershops.
Write in a [brand_voice] tone. Keep captions under 150 words.
Include a call to action. Suggest 5 relevant hashtags."

User: "Write a caption for [post_type] about [topic]"

## Barber upsell path
1. Sell Barber-booker-v1 first (£29/month)
2. At day 30 check-in: "Want more customers finding you online?"
3. Upsell SocialScaleBooster (£29/month add-on)
4. Bundle discount: both for £49/month

## Common post types for barbers
- Before/after transformations
- New style announcements
- Booking open slots
- Staff introductions
- Client testimonials
- Behind the scenes

## Sales pitch (one liner)
"Stop staring at a blank screen. Tell us your style and we write
your Instagram captions, hashtags, and posting schedule for the week."
