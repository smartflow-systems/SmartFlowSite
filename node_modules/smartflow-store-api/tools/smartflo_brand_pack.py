from PIL import Image, ImageOps, ImageDraw, ImageFont
import os, sys, json

BLACK = (11,11,11,255)
GOLD = (230,184,92,255)
GOLD_DARK = (183,134,47,255)
GOLD_LIGHT = (249,226,125,255)
TEXT_LIGHT = (215,199,160,255)

def make_canvas(size, color=BLACK):
    return Image.new("RGBA", size, color)

def center_paste(bg, fg, scale):
    bw, bh = bg.size
    fw, fh = fg.size
    target_w = max(1, int(bw * scale))
    target_h = max(1, int(fh * (target_w / max(1, fw))))
    fg_resized = fg.resize((target_w, target_h), Image.Resampling.LANCZOS)
    x = (bw - target_w) // 2
    y = (bh - target_h) // 2
    bg.alpha_composite(fg_resized, (x, y))
    return bg

def load_rgba(path):
    return Image.open(path).convert("RGBA")

def make_transparent_black(im, threshold=25):
    im = im.convert("RGBA")
    datas = im.getdata()
    new = []
    for r,g,b,a in datas:
        if r<threshold and g<threshold and b<threshold:
            new.append((0,0,0,0))
        else:
            new.append((r,g,b,a))
    out = Image.new("RGBA", im.size); out.putdata(new); return out

def crop_wave_icon(logo_rgba):
    bbox = logo_rgba.getbbox()
    if not bbox: return logo_rgba
    x0,y0,x1,y1 = bbox
    w = x1-x0
    cut_x = int(x0 + 0.62*w)
    if cut_x>=x1: cut_x = (x0+x1)//2
    wave = logo_rgba.crop((cut_x,y0,x1,y1))
    max_side = max(wave.size)
    sq = make_canvas((max_side,max_side))
    ww,wh = wave.size
    sq.alpha_composite(wave, ((max_side-ww)//2,(max_side-wh)//2))
    return sq

def export_rect(path, size, logo, scale):
    canvas = make_canvas(size)
    out = center_paste(canvas, logo, scale)
    out.save(path, "PNG", optimize=True)

def export_square(path, s, logo, scale):
    export_rect(path, (s,s), logo, scale)

def ensure_dirs(paths):
    for p in paths: os.makedirs(p, exist_ok=True)

def load_font(size):
    for name in ["DejaVuSans-Bold.ttf","Arial Bold.ttf","Arial.ttf","DejaVuSans.ttf"]:
        try: return ImageFont.truetype(name, size)
        except: continue
    return ImageFont.load_default()

def draw_centered_text(canvas, text, y, size, fill=GOLD, stroke=(0,0,0,255), stroke_w=1):
    draw = ImageDraw.Draw(canvas)
    font = load_font(size)
    w,h = draw.textbbox((0,0), text, font=font, stroke_width=stroke_w)[2:]
    x = (canvas.size[0]-w)//2
    draw.text((x,y), text, font=font, fill=fill, stroke_width=stroke_w, stroke_fill=stroke)
    return y+h

def paste_logo_top(canvas, logo, max_width_ratio=0.28, top_pad_ratio=0.09):
    cw,ch = canvas.size
    lw,lh = logo.size
    tw = int(cw * max_width_ratio)
    th = int(lh * (tw / lw))
    lg = logo.resize((tw, th), Image.Resampling.LANCZOS)
    x = (cw - tw)//2
    y = int(ch * top_pad_ratio)
    canvas.alpha_composite(lg, (x,y))
    return (x, y+th)

def build_og_hero(w,h,logo, headline, sub, cta):
    c = make_canvas((w,h))
    _, below = paste_logo_top(c, logo, max_width_ratio=(0.28 if w>h else 0.36), top_pad_ratio=0.09)
    gap = int(h*0.04)
    y = below + gap
    y = draw_centered_text(c, headline, y, int(h*0.11), fill=GOLD, stroke=(0,0,0,255), stroke_w=1)
    y += int(h*0.01)
    y = draw_centered_text(c, sub, y, int(h*0.05), fill=TEXT_LIGHT, stroke=(0,0,0,0), stroke_w=0)
    # CTA bar
    bar_h = int(h*0.16)
    bar = Image.new("RGBA", (w, bar_h), (24,18,12,255))
    c.alpha_composite(bar, (0, h-bar_h))
    draw = ImageDraw.Draw(c)
    font = load_font(int(bar_h*0.38))
    tw, th = draw.textbbox((0,0), cta, font=font)[2:]
    draw.text(((w-tw)//2, h-bar_h+(bar_h-th)//2), cta, font=font, fill=GOLD_LIGHT)
    return c

def write_webmanifest(use_static):
    prefix = "/static/icons/" if use_static else "/assets/icons/"
    data = {
      "name":"SmartFlo Systems",
      "short_name":"SmartFlo",
      "start_url":"/","scope":"/",
      "display":"standalone",
      "background_color":"#0B0B0B",
      "theme_color":"#0B0B0B",
      "icons":[
        {"src": prefix+"android-chrome-192.png","sizes":"192x192","type":"image/png"},
        {"src": prefix+"android-chrome-512.png","sizes":"512x512","type":"image/png"}
      ]
    }
    with open("site.webmanifest","w",encoding="utf-8") as f:
        f.write(json.dumps(data, indent=2))

def inject_meta(html_path, use_static):
    with open(html_path,"r",encoding="utf-8") as f:
        html = f.read()
    with open(html_path+".bak","w",encoding="utf-8") as f:
        f.write(html)

    def p(path): 
        return ("{{ url_for('static', filename='"+path+"') }}" if use_static else "/assets/"+path)

    block = f"""
<!-- SmartFlo Systems meta & icons START -->
<link rel="apple-touch-icon" sizes="180x180" href="{p('icons/apple-touch-icon-180.png')}">
<link rel="icon" type="image/png" sizes="512x512" href="{p('icons/favicon-512.png')}">
<link rel="icon" type="image/png" sizes="192x192" href="{p('icons/android-chrome-192.png')}">
<link rel="icon" type="image/png" sizes="32x32" href="{p('icons/favicon-32.png')}">
<link rel="icon" type="image/png" sizes="16x16" href="{p('icons/favicon-16.png')}">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0B0B0B">
<meta name="color-scheme" content="dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta property="og:title" content="SmartFlo Systems — AI Automation for Small Business">
<meta property="og:description" content="Premium AI booking, ecommerce, and social automation. Smooth, street-smart, futuristic.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://smartflosystems.com/">
<meta property="og:image" content="{p('og/smartflo-og-hero-1200x630.png')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="SmartFlo Systems — AI Automation for Small Business">
<meta name="twitter:description" content="Premium AI booking, ecommerce, and social automation.">
<meta name="twitter:image" content="{p('og/smartflo-og-hero-1200x1200.png')}">
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SmartFlo Systems",
  "url": "https://smartflosystems.com/",
  "logo": "{p('icons/android-chrome-512.png')}",
  "sameAs": [
    "https://www.instagram.com/smartflosystems",
    "https://www.tiktok.com/@smartflosystems",
    "https://twitter.com/smartflosystems",
    "https://www.linkedin.com/company/smartflosystems"
  ]
}}
</script>
<!-- SmartFlo Systems meta & icons END -->
"""
    new = html.replace("<head>", "<head>\n"+block, 1)
    with open(html_path,"w",encoding="utf-8") as f:
        f.write(new)

def write_browserconfig(use_static):
    path = "browserconfig.xml"
    src = ("/static/icons/android-chrome-192.png" if use_static else "/assets/icons/android-chrome-192.png")
    xml = f"""<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="{src}"/>
      <TileColor>#0B0B0B</TileColor>
    </tile>
  </msapplication>
</browserconfig>
"""
    with open(path,"w",encoding="utf-8") as f: f.write(xml)

def main():
    if len(sys.argv)<2:
        print("Usage: python tools/smartflo_brand_pack.py assets/brand/SmartFlo-Logo.png"); return
    src = sys.argv[1]
    if not os.path.exists(src):
        print("❌ Logo not found at", src); return

    is_flask = os.path.isdir("templates")
    use_static = is_flask

    if use_static:
        icons_dir = "static/icons"; og_dir = "static/og"
    else:
        icons_dir = "assets/icons"; og_dir = "assets/og"

    ensure_dirs([icons_dir, og_dir, "assets/brand", "tools"])

    # Load & clean
    logo = load_rgba(src)
    logo_t = make_transparent_black(logo, threshold=25)

    # Masters
    logo_t.save(os.path.join(og_dir, "smartflo-logo-transparent.png"), "PNG", optimize=True)
    export_rect(os.path.join(og_dir, "smartflo-logo-on-black.png"), (max(1200,logo_t.size[0]), max(800,logo_t.size[1])), logo_t, 1.0)

    # Profiles & posts
    export_square(os.path.join(og_dir, "smartflo-post-1080x1080.png"), 1080, logo_t, 0.72)
    export_rect(os.path.join(og_dir, "smartflo-post-portrait-1080x1350.png"), (1080,1350), logo_t, 0.62)
    export_rect(os.path.join(og_dir, "smartflo-post-landscape-1920x1080.png"), (1920,1080), logo_t, 0.42)
    export_rect(os.path.join(og_dir, "smartflo-story-1080x1920.png"), (1080,1920), logo_t, 0.54)
    # Covers
    export_rect(os.path.join(og_dir, "smartflo-cover-x-1500x500.png"), (1500,500), logo_t, 0.52)
    export_rect(os.path.join(og_dir, "smartflo-cover-facebook-1640x924.png"), (1640,924), logo_t, 0.45)
    export_rect(os.path.join(og_dir, "smartflo-cover-linkedin-1584x396.png"), (1584,396), logo_t, 0.55)
    export_rect(os.path.join(og_dir, "smartflo-cover-universal-3000x1000.png"), (3000,1000), logo_t, 0.50)
    # OG base
    export_rect(os.path.join(og_dir, "smartflo-og-1200x630.png"), (1200,630), logo_t, 0.58)
    export_rect(os.path.join(og_dir, "smartflo-og-1200x1200.png"), (1200,1200), logo_t, 0.70)
    # OG hero (with text)
    hero1 = build_og_hero(1200,630, logo_t, "Booking • Ecom • AI Bots", "Plug-and-play automation for small businesses", "Get a demo → smartflosystems.com")
    hero1.save(os.path.join(og_dir, "smartflo-og-hero-1200x630.png"), "PNG", optimize=True)
    hero2 = build_og_hero(1200,1200, logo_t, "Booking • Ecom • AI Bots", "Plug-and-play automation for small businesses", "Get a demo → smartflosystems.com")
    hero2.save(os.path.join(og_dir, "smartflo-og-hero-1200x1200.png"), "PNG", optimize=True)

    # Favicons & PWA icons
    wave = crop_wave_icon(logo_t)
    for s in [512,192,64,48,32,16]:
        canvas = make_canvas((s,s))
        icon = wave.resize((int(s*0.86), int(s*0.86)), Image.Resampling.LANCZOS)
        canvas.alpha_composite(icon, ((s-icon.size[0])//2, (s-icon.size[1])//2))
        canvas.save(os.path.join(icons_dir, f"favicon-{s}.png"), "PNG", optimize=True)
    Image.open(os.path.join(icons_dir, "favicon-192.png")).resize((180,180), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, "apple-touch-icon-180.png"))
    Image.open(os.path.join(icons_dir, "favicon-512.png")).save(os.path.join(icons_dir, "android-chrome-512.png"))
    Image.open(os.path.join(icons_dir, "favicon-192.png")).save(os.path.join(icons_dir, "android-chrome-192.png"))

    # Manifest + browserconfig
    write_webmanifest(use_static)
    write_browserconfig(use_static)

    # Inject meta into HTML/Jinja
    candidates = ["index.html","public/index.html","templates/base.html","templates/index.html"]
    target = next((p for p in candidates if os.path.exists(p)), None)
    if target: 
        inject_meta(target, use_static)
        print("✅ Meta injected into:", target)
    else:
        print("⚠️ Could not find an HTML/Jinja file to inject. Skipped injection.")

    print("✅ Brand pack generated in", ("static/*" if use_static else "assets/*"))

if __name__ == "__main__":
    main()