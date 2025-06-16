import React from 'react';

const Services = () => {
  const services = [
    {
      title: "Airport Transfers",
      description: "Reliable, timely, and elegant pickups and drop-offs from all major airports. Begin or end your journey in complete comfort.",
      image: "https://plus.unsplash.com/premium_photo-1663039978729-6f6775725f89?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    },
    {
      title: "Corporate Chauffeuring", 
      description: "Professional and discreet service for executives, meetings, and corporate events – where time and image matter most.",
      image: "https://images.unsplash.com/photo-1558707646-3cb6f7762218?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    },
    {
      title: "Wedding & Event Transfers",
      description: "Arrive in style and leave lasting impressions on your big day. We offer tailored services for weddings, formals, and special events.",
      image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    },
    {
      title: "Private Tours",
      description: "Explore local gems and scenic routes in a premium vehicle with a courteous chauffeur – at your own pace and comfort.",
      image: "https://images.unsplash.com/photo-1676278029735-9e9dfa881a09?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
    },
    {
      title: "Hotel & Resort Transfers",
      description: "Luxury door-to-door service connecting your accommodation to your destination – with style and ease.",
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    },
    {
      title: "School Formals & Graduations",
      description: "Celebrate milestones with grace and glamour. Make grand entrances and unforgettable memories.",
      image: "https://plus.unsplash.com/premium_photo-1713229182244-d617b76349d2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    }
  ];

  const whyChooseUs = [
    {
      title: "Elegance in Motion",
      description: "We live by our motto: \"Arrive with Intention. Travel in Elegance.\" From polished vehicles to polite chauffeurs – we redefine sophistication."
    },
    {
      title: "Professional Chauffeurs",
      description: "Our hand-picked drivers are experienced, well-groomed, and trained in VIP etiquette and safety protocols."
    },
    {
      title: "Luxury Fleet",
      description: "Enjoy premium rides in top-tier vehicles like Lexus, Mercedes, and BMW – always clean, comfortable, and maintained to perfection."
    },
    {
      title: "Punctual & Dependable",
      description: "We understand timing is everything. Expect accurate ETAs, GPS tracking, and zero delays."
    },
    {
      title: "Personalized Experience",
      description: "We listen and adapt. Whether it's music choice, temperature, or route – your preferences guide your ride."
    },
    {
      title: "Transparent Pricing",
      description: "No surprises. Clear, fair, and upfront rates – always."
    }
  ];

  return (
    <section id="services" className="relative py-24 bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 tracking-tight">
              OUR
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-gold-500 mt-2">
                SERVICES
              </span>
            </h2>
            
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-gold-500 mx-auto mb-8"></div>
            
            <h3 className="text-2xl md:text-3xl font-serif text-amber-400 mb-6">
              Majestic Chauffeurs for Grandeur Rides
            </h3>
            <p className="text-xl text-gray-300 max-w-5xl mx-auto leading-relaxed font-light font-sans">
              At Velaré, we deliver more than just transportation – we craft luxury experiences tailored to your lifestyle. 
              Whether it's a formal event or a professional engagement, we ensure every journey reflects elegance, punctuality, and comfort.
            </p>
          </div>

          {/* What We Offer */}
          <div className="mb-16">
            <div className="flex items-center justify-center mb-12">
              <span className="text-2xl mr-3">✨</span>
              <h3 className="text-3xl md:text-4xl font-serif text-white">What We Offer</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div 
                  key={index}
                  className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h4 className="text-2xl font-serif text-white mb-3 group-hover:text-amber-400 transition-colors font-bold">
                      {service.title}
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-lg font-light font-sans">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Velaré */}
          <div className="bg-gradient-to-r from-amber-500/10 to-gold-500/10 rounded-2xl p-8 md:p-12 border border-amber-500/20">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-serif text-white mb-4 font-bold">
                Why Choose Velaré?
              </h3>
              <p className="text-amber-400 text-lg font-serif italic font-light">
                Because every ride should be an experience, not just a journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whyChooseUs.map((item, index) => (
                <div 
                  key={index}
                  className="group bg-black/30 backdrop-blur-sm rounded-xl p-6 hover:bg-black/50 transition-all duration-300 border border-amber-500/10 hover:border-amber-500/30"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mr-3 group-hover:bg-gold-400 transition-colors"></div>
                    <h4 className="text-2xl font-serif text-white group-hover:text-amber-400 transition-colors font-bold mb-4">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-lg font-light font-sans">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="text-center mt-20">
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-gold-400 mx-auto mb-8"></div>
            <p className="text-3xl md:text-4xl font-serif text-amber-400 italic font-bold mb-4">
              "Arrive with Intention. Travel in Elegance."
            </p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto font-light font-sans">
              From booking to drop-off, our focus is on creating memorable, smooth, and satisfying travel experiences.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;