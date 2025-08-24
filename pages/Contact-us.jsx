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

          <div className="max-w-2xl mx-auto">
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;