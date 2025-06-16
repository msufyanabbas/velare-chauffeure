import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear any previous status when user starts typing
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
        // Reset form on success
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

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
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
              </form>
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

                {/* Multiple Locations */}
                <div className="space-y-6">
                  <h5 className="text-lg font-serif text-white mb-4 border-b border-gray-600 pb-2">
                    OUR LOCATIONS
                  </h5>
                  
                  {/* Location 1 - Sydney */}
                  <div className="flex items-start">
                    <div className="w-6 h-6 mr-4 flex-shrink-0 mt-1">
                      <svg fill="currentColor" className="w-6 h-6 text-amber-400" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-amber-400 text-sm font-semibold mb-1">SYDNEY OFFICE</p>
                      <p className="text-white text-lg">
                        3/442-444 King Georges Road Beverly Hills <br />
                        NSW, Australia 2209
                      </p>
                    </div>
                  </div>

                  {/* Location 2 - Perth */}
                  <div className="flex items-start">
                    <div className="w-6 h-6 mr-4 flex-shrink-0 mt-1">
                      <svg fill="currentColor" className="w-6 h-6 text-amber-400" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-amber-400 text-sm font-semibold mb-1">PERTH OFFICE</p>
                      <p className="text-white text-lg">
                        265 Benara Road Beechboro <br />
                        Perth WA 6061
                      </p>
                    </div>
                  </div>

                  {/* Location 3 - Wollongong */}
                  <div className="flex items-start">
                    <div className="w-6 h-6 mr-4 flex-shrink-0 mt-1">
                      <svg fill="currentColor" className="w-6 h-6 text-amber-400" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-amber-400 text-sm font-semibold mb-1">WOLLONGONG OFFICE</p>
                      <p className="text-white text-lg">
                        7 Malonga Place Koonawarra <br />
                        NSW 2530
                      </p>
                    </div>
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