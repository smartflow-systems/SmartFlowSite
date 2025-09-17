export default function Home() {
  return (
    <div style={{backgroundColor: '#0b0b0b', color: '#e9e6df', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif'}}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 4vw',
        background: 'linear-gradient(135deg, rgba(11,11,11,.8), rgba(20,17,15,.6))',
        backdropFilter: 'saturate(180%) blur(20px) brightness(1.1)',
        borderBottom: '1px solid rgba(212,175,55,.4)'
      }}>
        <a href="/" style={{fontWeight: 700, letterSpacing: '.4px', color: '#d4af37', textDecoration: 'none'}}>
          SmartFlow Systems
        </a>
        <nav style={{display: 'flex', gap: '18px', alignItems: 'center'}}>
          <a href="#projects" style={{color: '#d4af37', textDecoration: 'none'}}>Projects</a>
          <a href="#testimonials" style={{color: '#d4af37', textDecoration: 'none'}}>Proof</a>
          <a href="#pricing" style={{
            color: '#0b0b0b',
            backgroundColor: '#d4af37',
            padding: '12px 20px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 700
          }}>Get Started</a>
        </nav>
      </header>

      <section style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '72vh',
        background: `
          radial-gradient(1000px 400px at 20% 0%, rgba(212,175,55,.06), transparent),
          linear-gradient(180deg, rgba(212,175,55,.04), transparent 40%)
        `
      }}>
        <div style={{textAlign: 'center', padding: '48px 20px'}}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: '1.1',
            margin: '0 0 24px',
            background: 'linear-gradient(135deg, #d4af37, #f4e4bc, #b8941f)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Systems that sell while you sleep
          </h1>
          <p style={{
            opacity: .9,
            maxWidth: '720px',
            margin: '0 auto 32px',
            fontSize: '1.3rem',
            color: '#cbbf9b'
          }}>
            AI social bots, one-click booking, conversion-ready shops, and slick websites — all prebuilt, branded, and fast.
          </p>
          <div style={{display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
            <a href="#projects" style={{
              display: 'inline-block',
              border: '1px solid #d4af37',
              padding: '16px 32px',
              borderRadius: '999px',
              backgroundColor: '#d4af37',
              color: '#0b0b0b',
              textDecoration: 'none',
              fontWeight: 700,
              transition: 'all .3s ease',
              fontSize: '1.1rem'
            }}>
              See the Systems
            </a>
            <a href="#pricing" style={{
              display: 'inline-block',
              border: '1px solid #d4af37',
              padding: '16px 32px',
              borderRadius: '999px',
              color: '#d4af37',
              textDecoration: 'none',
              fontWeight: 700,
              transition: 'all .3s ease',
              fontSize: '1.1rem'
            }}>
              Pricing
            </a>
          </div>
        </div>
      </section>

      <section id="projects" style={{padding: '80px 20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto'}}>
        <h2 style={{fontSize: '2.5rem', color: '#d4af37', marginBottom: '60px', fontWeight: 600}}>
          Projects
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '60px'
        }}>
          {[
            {
              title: "AI Social Bot",
              features: ["Auto captions + niche hashtags", "DM funnels & lead capture", "Content calendar presets"]
            },
            {
              title: "Booking System", 
              features: ["Stripe deposits & no-show protection", "Google Calendar sync", "Industry presets (barber/salon/fitness)"]
            },
            {
              title: "E-commerce Shops",
              features: ["One-page checkout", "Upsells & abandoned cart emails", "Speed-first static storefronts"]
            },
            {
              title: "Websites",
              features: ["Premium black/brown + gold", "SEO-ready, lightning fast", "Lead forms & analytics"]
            }
          ].map((project, idx) => (
            <article key={idx} style={{
              background: 'rgba(20,17,15,.6)',
              border: '1px solid rgba(212,175,55,.2)',
              borderRadius: '16px',
              padding: '40px',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 10px 30px rgba(0,0,0,.3)'
            }}>
              <h3 style={{color: '#d4af37', marginBottom: '24px', fontSize: '1.6rem', fontWeight: 600}}>{project.title}</h3>
              <ul style={{listStyle: 'none', padding: 0, margin: '0 0 30px 0', textAlign: 'left'}}>
                {project.features.map((feature, i) => (
                  <li key={i} style={{
                    padding: '12px 0', 
                    borderBottom: '1px solid rgba(212,175,55,.1)',
                    fontSize: '1rem'
                  }}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>
              <a href="#pricing" style={{
                backgroundColor: '#d4af37',
                color: '#0b0b0b',
                padding: '14px 28px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'inline-block',
                transition: 'all .3s ease'
              }}>
                See Capabilities
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="testimonials" style={{padding: '80px 20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto'}}>
        <h2 style={{fontSize: '2.5rem', color: '#d4af37', marginBottom: '60px', fontWeight: 600}}>
          Social Proof
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          {[
            {quote: "We went from DMs to paid bookings in a day. The bot + booking combo just prints.", author: "Jay, Barber Studio Owner"},
            {quote: "Shop load time dropped under 1s and AOV went up 18% with the upsell preset.", author: "Mo, Streetwear Brand"}, 
            {quote: "He built our site, integrated Stripe, and the calendar sync is flawless.", author: "Lina, Aesthetics Clinic"}
          ].map((testimonial, idx) => (
            <figure key={idx} style={{
              background: 'rgba(20,17,15,.4)',
              border: '1px solid rgba(212,175,55,.2)',
              borderRadius: '16px',
              padding: '40px',
              margin: 0,
              boxShadow: '0 10px 30px rgba(0,0,0,.2)'
            }}>
              <blockquote style={{margin: '0 0 24px 0', fontStyle: 'italic', fontSize: '1.2rem', lineHeight: '1.6'}}>
                "{testimonial.quote}"
              </blockquote>
              <figcaption style={{color: '#d4af37', fontWeight: 600, fontSize: '1rem'}}>
                — {testimonial.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="pricing" style={{padding: '80px 20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto'}}>
        <h2 style={{fontSize: '2.5rem', color: '#d4af37', marginBottom: '60px', fontWeight: 600}}>
          Get Started
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px'
        }}>
          {[
            {title: "Starter", price: "£199", features: ["1 system setup", "Brand colours & logo", "Email support"], cta: "Join Waitlist"},
            {title: "Pro", price: "£499", features: ["2 systems + integrations", "Stripe + Calendar", "Priority support"], featured: true, cta: "Book Build"},
            {title: "Premium", price: "£999", features: ["All systems + presets", "Analytics + training", "30-day optimisation"], cta: "Apply"}
          ].map((plan, idx) => (
            <div key={idx} style={{
              background: 'rgba(20,17,15,.6)',
              border: plan.featured ? '2px solid #d4af37' : '1px solid rgba(212,175,55,.2)',
              borderRadius: '16px',
              padding: '40px',
              position: 'relative',
              boxShadow: plan.featured ? '0 15px 40px rgba(212,175,55,.2)' : '0 10px 30px rgba(0,0,0,.2)',
              transform: plan.featured ? 'scale(1.05)' : 'none'
            }}>
              {plan.featured && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#d4af37',
                  color: '#0b0b0b',
                  padding: '8px 24px',
                  borderRadius: '999px',
                  fontSize: '.9rem',
                  fontWeight: 700
                }}>
                  POPULAR
                </div>
              )}
              <h3 style={{color: '#d4af37', fontSize: '1.8rem', marginBottom: '16px', fontWeight: 700}}>{plan.title}</h3>
              <p style={{fontSize: '3rem', fontWeight: 700, margin: '16px 0 32px', color: '#d4af37'}}>{plan.price}</p>
              <ul style={{listStyle: 'none', padding: 0, margin: '0 0 40px 0', textAlign: 'left'}}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{
                    padding: '12px 0', 
                    borderBottom: '1px solid rgba(212,175,55,.1)',
                    fontSize: '1rem'
                  }}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>
              <a href="https://forms.gle/" style={{
                backgroundColor: '#d4af37',
                color: '#0b0b0b',
                padding: '16px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                display: 'inline-block',
                fontSize: '1.1rem',
                transition: 'all .3s ease',
                width: '100%'
              }}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <footer style={{textAlign: 'center', padding: '60px 20px', borderTop: '1px solid rgba(212,175,55,.2)', marginTop: '80px'}}>
        <p style={{margin: 0, opacity: .8}}>© 2025 SmartFlow Systems — Built by Gareth Bowers</p>
        <div style={{marginTop: '20px'}}>
          <a href="/api/health" style={{color: '#d4af37', textDecoration: 'none', margin: '0 10px'}}>/api/health</a>
          <span style={{color: '#666'}}>•</span>
          <a href="/api/gh-sync" style={{color: '#d4af37', textDecoration: 'none', margin: '0 10px'}}>/api/gh-sync</a>
        </div>
      </footer>
    </div>
  );
}
