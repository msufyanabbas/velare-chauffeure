import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Clock, Award, Users } from 'lucide-react';

const Footer = () => {
  const locations = [
    {
      name: 'SYDNEY',
      mapsUrl: 'https://www.google.com/maps/place/Sydney+NSW,+Australia'
    },
    {
      name: 'WOLLONGONG', 
      mapsUrl: 'https://www.google.com/maps/place/Wollongong+NSW,+Australia'
    },
    {
      name: 'CENTRAL COAST',
      mapsUrl: 'https://www.google.com/maps/place/Central+Coast+NSW,+Australia'
    },
    {
      name: 'PERTH',
      mapsUrl: 'https://www.google.com/maps/place/Perth+WA,+Australia'
    }
  ];

  const cityLinks = [
    { name: 'Sydney', url: 'https://www.google.com/maps/place/Sydney+NSW,+Australia' },
    { name: 'Perth', url: 'https://www.google.com/maps/place/Perth+WA,+Australia' },
    { name: 'Central Coast', url: 'https://www.google.com/maps/place/Central+Coast+NSW,+Australia' },
    { name: 'Wollongong', url: 'https://www.google.com/maps/place/Wollongong+NSW,+Australia' }
  ];

  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-3xl font-serif text-yellow-600 mb-4">Velaré</div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Premium chauffeur services delivering luxury, comfort, and reliability across Australia. Arrive with Intention, travel in Elegance with Velare.
            </p>
            
            {/* Company Features */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock size={14} className="text-yellow-600 flex-shrink-0" />
                <span className="text-gray-300 text-sm">24/7 Available Service</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award size={14} className="text-yellow-600 flex-shrink-0" />
                <span className="text-gray-300 text-sm">Premium Luxury Fleet</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={14} className="text-yellow-600 flex-shrink-0" />
                <span className="text-gray-300 text-sm">Professional Chauffeurs</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-300 hover:text-yellow-600 transition-colors duration-300 text-sm">About Velaré</a></li>
              <li><a href="#services" className="text-gray-300 hover:text-yellow-600 transition-colors duration-300 text-sm">Our Services</a></li>
              <li><a href="#fleet" className="text-gray-300 hover:text-yellow-600 transition-colors duration-300 text-sm">Premium Fleet</a></li>
              <li><a href="#booking" className="text-gray-300 hover:text-yellow-600 transition-colors duration-300 text-sm">Make Booking</a></li>
              <li><a href="#contact" className="text-gray-300 hover:text-yellow-600 transition-colors duration-300 text-sm">Contact Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-yellow-600 transition-colors duration-300 text-sm">Airport Transfers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-yellow-600 transition-colors duration-300 text-sm">Corporate Travel</a></li>
              <li><a href="#" className="text-gray-300 hover:text-yellow-600 transition-colors duration-300 text-sm">Wedding Transport</a></li>
              <li><a href="#" className="text-gray-300 hover:text-yellow-600 transition-colors duration-300 text-sm">Special Events</a></li>
              <li><a href="#" className="text-gray-300 hover:text-yellow-600 transition-colors duration-300 text-sm">City Tours</a></li>
            </ul>
          </div>

          {/* Service Areas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Service Areas</h3>
            <div className="space-y-3">
              {locations.map((location, index) => (
                    <a 
                    href={location.mapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-yellow-600 hover:text-yellow-400 transition-colors duration-300"
                  >
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-md transition-colors duration-300">
              
                    <MapPin size={18} />
                  <div>
                    <p className="text-white text-sm font-medium">{location.name}</p>
                  </div>
                </div>
                  </a>

              ))}
            </div>
          </div>
        </div>

        {/* Contact & Social Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Get In Touch</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone size={16} className="text-yellow-600 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">1300 650 677</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-yellow-600 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">info@velarechauffeurs.com.au</p>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin size={16} className="text-yellow-600 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    {cityLinks.map((city, index) => (
                      <span key={index}>
                        <a 
                          href={city.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-yellow-600 transition-colors duration-300"
                        >
                          {city.name}
                        </a>
                        {index < cityLinks.length - 1 && ' | '}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/profile.php?id=61575880736720" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300">
                  <Facebook size={20} />
                </a>
                <a href="https://www.instagram.com/velareluxury" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 transition-all duration-300">
                  <Instagram size={20} />
                </a>
                <a href="https://www.linkedin.com/company/velare-chauffeurs/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-300">
                  <Linkedin size={20} />
                </a>
                <a href="https://x.com/VelareChauffeur" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors duration-300">
                  <Twitter size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; 2025 Velaré. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;