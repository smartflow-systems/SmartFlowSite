# Barber Booker Agent
Last updated: 2026-03-22

## Role
Dedicated context agent for Barber-booker-v1 — the priority revenue product.
Use this agent for all work related to the barber booking system.

## Product: Barber-booker-v1
- 24/7 online booking system
- Google Calendar sync (real-time availability)
- Stripe payments (deposits, full payment, refunds)
- SendGrid email confirmations and reminders
- Mobile-friendly booking page
- Admin dashboard for the barber

## Repo
github.com/smartflow-systems/Barber-booker-v1

## Target customer
UK barbers and salon owners. Decision maker is usually the owner.
Typical pain points:
- Losing bookings when busy with a client
- No-shows wasting time and money
- Manual WhatsApp/phone booking is exhausting
- Competitors already have online booking

## Pricing
- Starter: £29/month
- Pro: £97/month (includes reminders + analytics)
- Agency: £297/month (white label, multi-location)

## 9-step client onboarding
1. Demo call — show live booking page
2. Collect business name, services, prices
3. Set up Stripe account (or connect existing)
4. Configure Google Calendar sync
5. Customise booking page (logo, colours, services)
6. Set up SendGrid email templates
7. Test booking end-to-end
8. Go live — share booking link
9. Follow-up at day 7 and day 30

## Key environment variables
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
GOOGLE_CALENDAR_ID=...
SENDGRID_API_KEY=SG....
BOOKING_PAGE_URL=https://...

## Sales objections + responses
"I already use Treatwell/Fresha"
→ Those take commission per booking. This is flat monthly fee, you keep 100%.

"I'm not tech savvy"
→ We set it up for you. Takes 30 minutes. You just share a link.

"It's too expensive"
→ If it fills one extra slot per week, it pays for itself. Most see 3-5 extra bookings.

"I'll think about it"
→ I can get you live today. Want me to set up a demo booking right now?

## Demo script (60 seconds)
"Watch this — I'm going to book a haircut at your shop right now."
[Open booking page]
"Customer picks a service, picks a time, pays a deposit."
[Show confirmation email arriving]
"You get this notification. It blocks your calendar. No-shows drop because they've paid."
"This is running 24/7 even when you're with a client."
