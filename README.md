# SmartFlow Systems Portfolio

A dark-themed portfolio site for SmartFlow Systems with interactive demos, live metrics, bookings, lead capture, and JSON-driven content management.

## Features

- **Portfolio Showcase**: Interactive system demos with live metrics
- **Booking System**: Calendly integration for strategy calls
- **Lead Capture**: Free pack download with Google Sheets logging
- **Case Studies**: Success story pages
- **Blog System**: Markdown-based content with build automation
- **SEO Optimized**: Structured data, sitemaps, meta tags

## Quick Setup

### 1. Booking System
Edit `site.config.json → calendlyUrl` with your Calendly link, or leave blank to show email fallback.

### 2. Lead Capture to Google Sheets
Create a Google Apps Script Web App:

1. Go to [Google Apps Script](https://script.google.com)
2. Create new project → paste this code:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.name || '',
    data.email || '',
    data.note || '',
    data.source || 'website'
  ]);
  return ContentService.createTextOutput('OK');
}
```

3. Deploy → Web App → Execute as "Me", Access "Anyone"
4. Copy the Web App URL to `site.config.json → leadWebhook`

### 3. Content Management
- Blog posts: Add `.md` files to `content/posts/`
- Updates: Add `.md` files to `content/updates/`
- Run `node scripts/build.js` to regenerate static pages

## File Structure

```
/
├── index.html              # Main portfolio page
├── book.html              # Booking/scheduling page
├── leads.html             # Lead magnet download
├── case-study.html        # Success stories
├── site.config.json       # Editable configuration
├── data/
│   ├── site.json         # Site content & settings
│   ├── systems.json      # Portfolio systems
│   └── live.json         # Simulated metrics
├── content/
│   ├── posts/            # Blog markdown files
│   └── updates/          # Update markdown files
├── scripts/
│   └── build.js         # Content build system
└── assets/
    └── lead-magnet-smartflow.pdf
```

## Configuration

Edit `site.config.json`:

```json
{
  "siteUrl": "https://your-domain.com",
  "siteName": "SmartFlow Systems", 
  "calendlyUrl": "https://calendly.com/your-handle/30min",
  "leadWebhook": "https://script.google.com/.../exec",
  "leadMagnetUrl": "assets/lead-magnet-smartflow.pdf"
}
```

## Development

1. `python3 main.py` - Start Flask server
2. `node scripts/build.js` - Build blog content
3. Navigate to http://localhost:5000

## Deployment

The site is deployment-ready with proper health checks:
- Health endpoint: `/health` returns 200 OK
- Static file serving via Flask
- Environment variable support for PORT

## Brand Guidelines

- Colors: Dark brown/black background with shiny gold accents
- Typography: Clean, professional sans-serif
- Style: Premium, sophisticated automation branding