import React from 'react';
import { Crown, Shield, Star, Award, Users, Car } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Experienced Chauffeurs",
      description: "Velaré's team of professional drivers maintain exceptional training standards and unwavering dedication to customer satisfaction, ensuring every journey exceeds expectations."
    },
    {
      icon: <Car className="w-8 h-8" />,
      title: "Luxury Vehicles",
      description: "A diverse fleet of high-end vehicles, meticulously maintained and regularly serviced to ensure a safe, comfortable, and luxurious travel environment for our distinguished clients."
    },
    {
      icon: <Crown className="w-8 h-8" />,
      title: "Personalized Service",
      description: "Custom-tailored chauffeur services crafted around your specific requirements, individual preferences, and lifestyle to deliver a personalized and seamless luxury experience."
    }
  ];

  const stats = [
    { number: "500+", label: "Satisfied Clients" },
    { number: "5+", label: "Years Experience" },
    { number: "20+", label: "Fleets" },
    { number: "24/7", label: "Service Available" }
  ];

  return (
    <section id="about" className="relative py-24 bg-white overflow-hidden">
      {/* Elegant Background Pattern with dots */}
      <div className="absolute inset-0 bg-dots-pattern opacity-30"></div>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-gold-300 to-gold-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-gold-200 to-gold-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Luxury Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-100 to-gold-200 rounded-full mb-8">
              {/* <Shield className="w-10 h-10 text-gold-700" /> */}
              <img src="/images/main-no-background.png" alt="Velare" />
            </div>
            
            <h2 className="text-5xl md:text-7xl font-serif text-luxury-dark mb-6 tracking-tight">
              ABOUT
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-600 to-gold-800 mt-2">
                VELARÉ
              </span>
            </h2>
            
            <div className="w-24 h-1 bg-gradient-to-r from-gold-500 to-gold-700 mx-auto mb-8"></div>
            
            <p className="text-xl text-luxury-charcoal max-w-5xl mx-auto leading-relaxed font-light font-sans">
              Velaré represents the pinnacle of premium chauffeur services, where professionalism, reliability, and uncompromising comfort converge. Our service-oriented approach, delivered through experienced chauffeurs and a meticulously maintained luxury fleet, ensures we consistently exceed the highest standards of excellence.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-luxury-light to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-gold-100">
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-600 to-gold-800 mb-2 font-serif">
                    {stat.number}
                  </div>
                  <div className="text-luxury-charcoal font-medium tracking-wide font-sans">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div key={index} className="group h-full">
                <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gold-100 hover:border-gold-300 group-hover:scale-105 h-full flex flex-col">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold-100 to-gold-200 rounded-2xl mb-8 group-hover:from-gold-200 group-hover:to-gold-300 transition-all duration-300 shadow-md">
                    <div className="text-white group-hover:text-white transition-colors duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-luxury-dark mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gold-600 group-hover:to-gold-800 transition-all duration-300 font-serif">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-luxury-charcoal leading-relaxed text-lg font-light font-sans flex-grow">
                    {feature.description}
                  </p>
                  
                  {/* Decorative Element */}
                  <div className="w-12 h-1 bg-gradient-to-r from-gold-500 to-gold-700 mt-6 group-hover:w-20 transition-all duration-300"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Section */}
          <div className="text-center mt-20">
            <div className="bg-gradient-to-br from-luxury-dark to-luxury-charcoal rounded-3xl p-12 shadow-2xl relative overflow-hidden">
              {/* Background pattern overlay */}
              <div className="absolute inset-0 bg-dots-pattern opacity-10"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <Star className="w-8 h-8 text-gold-400 mr-2" />
                  <Award className="w-8 h-8 text-gold-500 mx-2" />
                  <Star className="w-8 h-8 text-gold-400 ml-2" />
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 font-serif">
                  Experience Luxury Redefined
                </h3>
                
                <p className="text-gold-200 text-lg max-w-3xl mx-auto mb-8 font-light font-sans">
                  Join the distinguished clientele who trust Velaré for their most important journeys. 
                  Where every mile is a testament to luxury, comfort, and unparalleled service.
                </p>
                
                <a href='#services'><button className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold rounded-full hover:from-gold-600 hover:to-gold-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-sans">
                  Discover Our Services
                  <Crown className="w-5 h-5 ml-2" />
                </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;