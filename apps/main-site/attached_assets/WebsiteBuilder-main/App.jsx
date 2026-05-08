import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Star, MapPin, Clock, Phone, Mail, Instagram, Calendar, Users, Award, CheckCircle } from 'lucide-react';
import './App.css';

// Import images
import salonInterior from './assets/salon-interior.jpg';
import salonInterior2 from './assets/salon-interior-2.jpg';
import eyelashHero from './assets/eyelash-hero.jpg';
import beautifulEyes from './assets/beautiful-eyes.jpg';
import greenEyes from './assets/green-eyes.jpg';

function App() {
  const [activeService, setActiveService] = useState('classic');

  const services = {
    classic: {
      title: 'Classic Lash Extensions',
      description: 'Individual lash extensions for natural enhancement and everyday elegance.',
      features: ['1:1 ratio application', '2-3 week duration', 'Natural, subtle enhancement'],
      image: beautifulEyes
    },
    volume: {
      title: 'Russian Volume',
      description: 'Multiple ultra-fine lashes per natural lash for dramatic volume and glamour.',
      features: ['2-6 lashes per natural lash', '3-4 week duration', 'Dramatic, glamorous look'],
      image: greenEyes
    },
    hybrid: {
      title: 'Hybrid Lashes',
      description: 'Perfect blend of classic and volume techniques for textured, natural glamour.',
      features: ['Mix of classic & volume', '3-4 week duration', 'Textured, wispy effect'],
      image: eyelashHero
    }
  };

  const reviews = [
    {
      name: 'Sarah H.',
      role: 'Verified Client',
      rating: 5,
      text: 'Absolutely incredible lashes! Ella\'s attention to detail is unmatched. My lashes looked perfect for weeks and the aftercare advice was so helpful.',
      initials: 'SH'
    },
    {
      name: 'Maya J.',
      role: 'Academy Graduate',
      rating: 5,
      text: 'The training course was exceptional! Learned everything from basic to advanced techniques. Ella is such a talented teacher and the academy is beautiful.',
      initials: 'MJ'
    },
    {
      name: 'Lucy C.',
      role: 'Regular Client',
      rating: 5,
      text: 'Professional service from start to finish. The hybrid lashes are exactly what I wanted - natural but glamorous. Will definitely be returning!',
      initials: 'LC'
    }
  ];

  const locations = [
    {
      name: 'Stratford upon Avon',
      description: 'Our flagship studio in the heart of Shakespeare\'s historic town',
      hours: 'Monday - Saturday: 9:00 AM - 7:00 PM',
      special: 'Sunday: By appointment (+£10)',
      note: 'Available for consultation',
      image: salonInterior
    },
    {
      name: 'Manchester (MCR)',
      description: 'Contemporary studio serving the vibrant Manchester area',
      hours: 'Monday - Saturday: 9:00 AM - 7:00 PM',
      special: 'Evening appointments: Available (+£10)',
      note: 'Training courses available',
      image: salonInterior2
    }
  ];

  const policies = [
    {
      title: 'Cancellation Policy',
      icon: Calendar,
      items: [
        '24 hours notice required',
        'Non-refundable deposits',
        '£20 fee within 24h (£40 peak)',
        'Applies to all bookings'
      ]
    },
    {
      title: 'Punctuality',
      icon: Clock,
      items: [
        '10 minutes late = cancellation',
        'No exceptions policy',
        'Deposit forfeited',
        'Fee required for rebooking'
      ]
    },
    {
      title: 'Aftercare',
      icon: CheckCircle,
      items: [
        '48h water/steam avoidance',
        'No oily products',
        'Oil-free cleanser only',
        'Free removal service'
      ]
    },
    {
      title: 'Issues Policy',
      icon: Phone,
      items: [
        'Free top-up within 48h',
        'First week contact us',
        'In-person assessment required',
        'Email/Instagram contact'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">EW</span>
                </div>
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold text-gray-900">Ella Wilson</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#home" className="text-gray-900 hover:text-rose-600 px-3 py-2 text-sm font-medium transition-colors">Home</a>
                <a href="#services" className="text-gray-900 hover:text-rose-600 px-3 py-2 text-sm font-medium transition-colors">Services</a>
                <a href="#training" className="text-gray-900 hover:text-rose-600 px-3 py-2 text-sm font-medium transition-colors">Training</a>
                <a href="#reviews" className="text-gray-900 hover:text-rose-600 px-3 py-2 text-sm font-medium transition-colors">Reviews</a>
                <a href="#contact" className="text-gray-900 hover:text-rose-600 px-3 py-2 text-sm font-medium transition-colors">Contact</a>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white">
              Book Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-16 min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/20 to-amber-900/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${salonInterior})` }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Ella Wilson
            </h1>
            <p className="text-xl md:text-2xl text-rose-600 font-semibold mb-6">
              Beauty & Aesthetics
            </p>
            <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
              Advanced Aesthetic Practitioner & Accredited Training Provider. 
              Transforming beauty with precision, artistry, and luxury care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white px-8 py-3">
                Book Now
              </Button>
              <Button size="lg" variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50 px-8 py-3">
                View Training
              </Button>
            </div>
            <div className="flex justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900">4,506</div>
                <div className="text-gray-600">Followers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">1,260</div>
                <div className="text-gray-600">Posts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Treatments Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 border-2 border-white rounded-full"></div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Premium Treatments</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the artistry of advanced aesthetic treatments with our signature lash services
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {Object.entries(services).map(([key, service]) => (
              <Card 
                key={key} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  activeService === key ? 'ring-2 ring-rose-400 shadow-lg' : ''
                }`}
                onClick={() => setActiveService(key)}
              >
                <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-t-lg">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-rose-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white"
                  >
                    Book {service.title.split(' ')[0]} Set
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Service Guidelines */}
          <Card className="bg-gradient-to-br from-rose-50 to-amber-50 border-rose-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Service Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Preparation Requirements</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="w-4 h-4 text-rose-500 mr-2" />
                      Arrive makeup-free for optimal lash longevity
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="w-4 h-4 text-rose-500 mr-2" />
                      Clean lashes before infill appointments
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="w-4 h-4 text-rose-500 mr-2" />
                      Right to refuse service for poor maintenance
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Infill Requirements</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="w-4 h-4 text-rose-500 mr-2" />
                      50% lashes remaining for 2-week infill
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="w-4 h-4 text-rose-500 mr-2" />
                      30% lashes remaining for 3-4 week infill
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="w-4 h-4 text-rose-500 mr-2" />
                      Below minimum charged as full set
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Beauty Academy Section */}
      <section id="training" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Beauty Academy</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              @beautybae_academy_ - The prettiest academy to teach from. Weekend intensive courses in luxury surroundings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold mb-6">LASH MASTERCLASS</h3>
              <p className="text-lg text-gray-300 mb-6">BECOME A FULLY QUALIFIED LASH ARTIST</p>
              <p className="text-gray-300 mb-8">
                Our 2 day fast track course takes you from beginner to lash boss, 
                covering techniques for classic, hybrid, Russian volume and lash removals.
              </p>
              
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">COURSE INCLUDES:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    'Classic Lash Application',
                    'Hybrid Lash Application', 
                    'Russian Fan Making',
                    'How to Remove',
                    'Social Media Management',
                    'Full Course Manuals',
                    'Product List',
                    'Live Models'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <CheckCircle className="w-4 h-4 text-rose-400 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button size="lg" className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white">
                #LASHCLASSSS
              </Button>
            </div>
            
            <div className="bg-gradient-to-br from-rose-500/20 to-amber-500/20 rounded-2xl p-8 text-center">
              <h4 className="text-2xl font-bold mb-6">BECOME A FULLY QUALIFIED LASH ARTIST</h4>
              <div className="space-y-4 text-left">
                <div className="bg-white/10 rounded-lg p-4">
                  <h5 className="font-semibold text-amber-400">COURSE INCLUDES</h5>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>CLASSIC LASH APPLICATION</div>
                    <div>HYBRID LASH APPLICATION</div>
                    <div>RUSSIAN FAN MAKING</div>
                    <div>HOW TO REMOVE</div>
                    <div>SOCIAL MEDIA MANAGEMENT</div>
                    <div>FULL COURSE MANUALS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Training Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="bg-gradient-to-br from-rose-50 to-amber-50 border-rose-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">COSMETIC TEETH BRIGHTENING</h3>
                <p className="text-gray-700 mb-4">In-Clinic • Zoom • CPD-Accredited</p>
                <p className="text-gray-700 mb-6">
                  Become a certified teeth-whitening technician in a single day—the Ella Wilson way.
                </p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">WHY TRAIN WITH ELLA?</h4>
                  <ul className="space-y-2">
                    {[
                      'Advanced Aesthetic Practitioner with thousands of happy clients',
                      'Two luxury clinics: Stratford-upon-Avon & Manchester',
                      'Fully UK-legal method (non-HP gels) – no dental licence required',
                      'Accredited certificate + instant insurance approval',
                      'Lifetime support – you join the EW family'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-rose-500 mr-2 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-4">
                  <Button className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white">
                    Book Teeth Training
                  </Button>
                  <Button variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50">
                    Combo Course
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
              {[
                {
                  icon: Calendar,
                  title: 'Weekend Intensive',
                  description: 'Complete certification in just 2 days with hands-on training'
                },
                {
                  icon: Users,
                  title: 'Live Models',
                  description: 'Practice on real clients during your training course'
                },
                {
                  icon: Award,
                  title: 'Complete Kit',
                  description: 'Comprehensive student packages with branded bags included'
                }
              ].map((feature, index) => (
                <Card key={index} className="bg-white/10 border-white/20">
                  <CardContent className="p-6 text-center">
                    <feature.icon className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                    <p className="text-gray-300 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Client Reviews Section */}
      <section id="reviews" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Client Reviews</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover why our clients trust us for their beauty transformation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <Card key={index} className="border-rose-100 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{review.text}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">{review.initials}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{review.name}</div>
                      <div className="text-sm text-gray-600">{review.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-20 bg-gradient-to-br from-rose-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Locations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Visit us at our luxury studio locations for personalized beauty experiences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {locations.map((location, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={location.image} 
                    alt={location.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{location.name}</h3>
                  <p className="text-gray-600 mb-4">{location.description}</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-2" />
                      {location.hours}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-2" />
                      {location.special}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Phone className="w-4 h-4 mr-2" />
                      {location.note}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Options */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Flexible Payment Options</h2>
          <p className="text-xl text-gray-600 mb-8">Payment plans available to make luxury beauty accessible</p>
          <Button size="lg" className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white">
            Learn More About Payment Plans
          </Button>
        </div>
      </section>

      {/* Terms & Policies */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Terms & Policies</h2>
            <p className="text-xl text-gray-300">Important information for the best service experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {policies.map((policy, index) => (
              <Card key={index} className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <policy.icon className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-4">{policy.title}</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {policy.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center">
                        <CheckCircle className="w-3 h-3 text-rose-400 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-rose-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-xl text-gray-600 mb-12">
            Ready to transform your look? Book your appointment or training course today
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white px-8 py-3">
              <Instagram className="w-5 h-5 mr-2" />
              @ellawilsonbeauty
            </Button>
            <Button size="lg" variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50 px-8 py-3">
              <Instagram className="w-5 h-5 mr-2" />
              @beautybae_academy_
            </Button>
          </div>
          
          <div className="flex items-center justify-center text-gray-600">
            <Mail className="w-5 h-5 mr-2" />
            <span>Contact us via email or Instagram for bookings and inquiries</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">EW</span>
            </div>
            <span className="text-xl font-bold">Ella Wilson Beauty & Aesthetics</span>
          </div>
          <p className="text-gray-400">
            © 2024 Ella Wilson Beauty & Aesthetics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

