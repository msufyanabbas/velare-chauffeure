import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (submitStatus) {
      setSubmitStatus(null);
      setSubmitMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(data.message);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const locations = [
    {
      name: 'SYDNEY',
      description: 'Central Business District & Metropolitan Area',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106374.04303784316!2d151.11643058541005!3d-33.85781497329982!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b129838f39a743f%3A0x3017d681632a850!2sSydney%20NSW%2C%20Australia!5e0!3m2!1sen!2s!4v1692000000000!5m2!1sen!2s&style=feature:administrative%7Celement:labels%7Cvisibility:off&style=feature:landscape%7Celement:all%7Ccolor:0x2c3e50&style=feature:poi%7Celement:all%7Cvisibility:off&style=feature:road%7Celement:geometry%7Ccolor:0x34495e&style=feature:water%7Celement:geometry%7Ccolor:0x3498db',
      icon: '🏙️'
    },
    {
      name: 'WOLLONGONG',
      description: 'Illawarra Region & South Coast',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26728.096419756876!2d150.87543434863282!3d-34.42486790!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b129838f39a743f%3A0x3017d681632a850!2sWollongong%20NSW%2C%20Australia!5e0!3m2!1sen!2s!4v1692000000000!5m2!1sen!2s&style=feature:administrative%7Celement:labels%7Cvisibility:off&style=feature:landscape%7Celement:all%7Ccolor:0x2c3e50&style=feature:poi%7Celement:all%7Cvisibility:off&style=feature:road%7Celement:geometry%7Ccolor:0x34495e&style=feature:water%7Celement:geometry%7Ccolor:0x3498db',
      icon: '🏔️'
    },
    {
      name: 'CENTRAL COAST',
      description: 'Gosford, Wyong & Surrounding Areas',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26728.096419756876!2d151.30000000000001!3d-33.43000000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b734b1e7c5e5555%3A0x40609b490436850!2sCentral%20Coast%20NSW%2C%20Australia!5e0!3m2!1sen!2s!4v1692000000000!5m2!1sen!2s&style=feature:administrative%7Celement:labels%7Cvisibility:off&style=feature:landscape%7Celement:all%7Ccolor:0x2c3e50&style=feature:poi%7Celement:all%7Cvisibility:off&style=feature:road%7Celement:geometry%7Ccolor:0x34495e&style=feature:water%7Celement:geometry%7Ccolor:0x3498db',
      icon: '🌊'
    },
    {
      name: 'PERTH',
      description: 'Western Australia Metropolitan',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108906.37151862748!2d115.79320585541005!3d-31.95239929932499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2a32bad5ea6fb855%3A0x30e6f5b50a1ac251!2sPerth%20WA%2C%20Australia!5e0!3m2!1sen!2s!4v1692000000000!5m2!1sen!2s&style=feature:administrative%7Celement:labels%7Cvisibility:off&style=feature:landscape%7Celement:all%7Ccolor:0x2c3e50&style=feature:poi%7Celement:all%7Cvisibility:off&style=feature:road%7Celement:geometry%7Ccolor:0x34495e&style=feature:water%7Celement:geometry%7Ccolor:0x3498db',
      icon: '🌅'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gray-700">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif mb-4 block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 mt-2">
              VELARÉ
            </h2>
            <h3 className="text-3xl md:text-4xl font-serif text-white mb-6">
              GET IN TOUCH
            </h3>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Feel free to contact us to learn more about our chauffeur services or to make a booking.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="space-y-6">
                {/* Status Messages */}
                {submitStatus && (
                  <div className={`p-4 rounded-md ${
                    submitStatus === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name *"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    placeholder="Message *"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <h4 className="text-2xl font-serif text-white mb-6">
                CONTACT INFORMATION
              </h4>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-4 flex-shrink-0">
                    <svg fill="currentColor" className="w-6 h-6 text-white" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-lg">1300 650 677</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-6 h-6 mr-4 flex-shrink-0">
                    <svg fill="currentColor" className="w-6 h-6 text-white" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-lg">info@velarechauffeurs.com.au</p>
                  </div>
                </div>

                {/* Service Locations */}
                <div className="space-y-6">
                  <h5 className="text-lg font-serif text-white mb-4 border-b border-gray-600 pb-2">
                    OUR LOCATIONS
                  </h5>
                  
                  {/* Location Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-max">
                    {locations.map((location, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-amber-400/30 transition-all duration-300">
                        {/* Location Header */}
                        <div className="p-4 bg-gray-750 border-b border-gray-700">
                          <div className="flex items-center">
                            <div className="w-6 h-6 mr-3 flex-shrink-0">
                              <svg fill="currentColor" className="w-6 h-6 text-amber-400" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                              </svg>
                            </div>
                            <div>
                              <p className="text-white font-semibold text-base">{location.name}</p>
                              <p className="text-gray-400 text-sm">Service Area</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Map Container */}
                        <div className="relative w-full h-36 bg-gray-900 overflow-hidden group">
                          <iframe
                            src={location.mapUrl}
                            width="100%"
                            height="100%"
                            style={{ 
                              border: 0,
                              filter: 'saturate(0.8) contrast(1.1) brightness(0.95)'
                            }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`${location.name} Service Area`}
                            className="group-hover:filter-none transition-all duration-500"
                          ></iframe>
                          
                          {/* Subtle overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent pointer-events-none group-hover:opacity-0 transition-opacity duration-300"></div>
                          
                          {/* Corner accent */}
                          <div className="absolute top-3 right-3 w-2 h-2 bg-amber-400 rounded-full opacity-80"></div>
                        </div>

                        {/* Bottom info bar */}
                        <div className="px-4 py-2 bg-gray-850 text-center">
                          <span className="text-amber-400 text-xs font-medium tracking-wide">ACTIVE SERVICE ZONE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Media Icons */}
              <div className="pt-6 border-t border-gray-600">
                <h5 className="text-lg font-serif text-white mb-4">
                  FOLLOW US
                </h5>
                <div className="flex space-x-4">
                  {/* Facebook Icon */}
                  <a
                    href="https://www.facebook.com/profile.php?id=61575880736720"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                  >
                    <svg 
                      className="w-5 h-5 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>

                  {/* Instagram Icon */}
                  <a
                    href="https://www.instagram.com/velareluxury"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 transition-all duration-300"
                  >
                    <svg 
                      className="w-5 h-5 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>

                  {/* LinkedIn Icon */}
                  <a
                    href="https://www.linkedin.com/company/velare-chauffeurs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-300"
                  >
                    <svg 
                      className="w-5 h-5 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>

                  {/* Twitter/X Icon */}
                  <a
                    href="https://x.com/VelareChauffeur"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-black transition-colors duration-300"
                  >
                    <svg 
                      className="w-5 h-5 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;