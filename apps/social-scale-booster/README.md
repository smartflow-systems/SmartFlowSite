# SmartFlow Systems Landing Page

Premium AI automation landing page built for small business growth. Features booking systems, ecommerce, social media bots, and websites.

## 🎯 Quick Start

1. **Replace placeholder images** in `/assets/` folder
2. **Update contact email** in `app.js` (line 8)
3. **Customize colors** in `styles.css` CSS variables
4. **Edit pricing** in `index-smartflow.html` pricing section
5. **Deploy** to your web hosting

## 📁 File Structure

```
├── index-smartflow.html    # Main landing page
├── styles.css             # All styling (black/gold theme)
├── app.js                 # Interactions & form handling
├── assets/                # Images and media files
│   ├── logo.svg          # SmartFlow logo (editable)
│   └── placeholder-images.txt
└── README.md             # This guide
```

## 🎨 Customization Guide

### Colors & Branding
Edit CSS variables in `styles.css` (lines 7-20):
```css
:root {
    --bg: #0b0b0b;           /* Dark background */
    --brown: #1a120e;        /* Card backgrounds */
    --gold: #d4af37;         /* Accent color */
    --text: #e9e9e9;         /* Body text */
    --muted: #9a9a9a;        /* Secondary text */
}
```

### Content & Copy
Edit directly in `index-smartflow.html`:
- **Hero title** (line 65): Main headline
- **Systems descriptions** (lines 120-200): Service details
- **Pricing** (lines 280-350): Plans and prices
- **Case study** (lines 220-260): Success story
- **FAQ** (lines 380-450): Common questions

### Contact Form
Choose your preferred method in `app.js` (line 8):

**Option 1: Email (default)**
```javascript
CONTACT_METHOD: 'mailto'
EMAIL: 'your-email@domain.com'
```

**Option 2: Formspree**
```javascript
CONTACT_METHOD: 'formspree'
FORMSPREE_URL: 'https://formspree.io/f/your-form-id'
```

### Pricing Plans
Update pricing in HTML (lines 280-350):
```html
<div class="pricing-price">
    <span class="price-setup">£99 setup</span>
    <span class="price-monthly">£29/mo</span>
</div>
```

## 📱 Responsive Design

- **Mobile-first** approach (360px+ supported)
- **Accessible** (WCAG 2.1 AA compliant)
- **Fast loading** (lazy images, optimized CSS)
- **SEO optimized** (meta tags, JSON-LD)

## 🖼️ Image Requirements

Replace placeholder files in `/assets/`:

| File | Size | Purpose |
|------|------|---------|
| `favicon.png` | 32x32 | Browser tab icon |
| `hero-bg.jpg` | 1920x1080 | Hero background |
| `avatar.jpg` | 400x400 | Gareth's photo |
| `case-study-video.jpg` | 1200x675 | Video thumbnail |

**Company logos** (80x32 each):
- `stripe-logo.svg`
- `google-logo.svg` 
- `buffer-logo.svg`
- `shopify-logo.svg`
- `twilio-logo.svg`

## 🚀 Performance Checklist

Before going live:
- [ ] Replace all placeholder images
- [ ] Test contact form submission
- [ ] Run Lighthouse audit (target: 90+ scores)
- [ ] Test on mobile devices (360px width)
- [ ] Verify all navigation links work
- [ ] Check FAQ accordion functionality
- [ ] Test form validation

## 📊 Analytics Setup

Replace placeholder tracking in `app.js` (line 245):
```javascript
// Add Google Analytics
gtag('config', 'GA_MEASUREMENT_ID');
```

## 🔧 Technical Specs

- **Framework**: Vanilla HTML/CSS/JS (no dependencies)
- **Performance**: <50KB CSS, lazy-loaded images
- **Browser support**: Chrome, Firefox, Safari, Edge
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **SEO**: Meta tags, OpenGraph, JSON-LD structured data

## 📞 Support & Contact

- **Email**: garethbowers@hotmail.com
- **WhatsApp**: +44 7123 456789 (update in HTML)
- **Theme**: Smart, street-smart, futuristic
- **Colors**: Black/brown backgrounds with shiny gold accents

## 🎯 Conversion Optimization

The page is designed for maximum conversions:
- **Above-fold CTAs**: "Book a Demo" prominently placed
- **Social proof**: Trusted integration logos
- **Case study**: Real results with specific metrics
- **FAQ section**: Addresses common objections
- **Multiple contact methods**: Form, email, WhatsApp
- **Premium design**: Black & gold theme builds trust

## 📝 Content Strategy

Focus on benefits over features:
- **Speed**: "Days not weeks" delivery
- **Smart**: "Niche presets" for specific industries
- **Premium**: "Black & gold design that converts"

Use "You get" language throughout copy to focus on customer benefits.

---

**Built for Gareth Bowers - SmartFlow Systems**
*Premium AI automation for small business growth*