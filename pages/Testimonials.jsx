import React, { useState, useEffect } from 'react';
import { Plus, Star, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import ReviewModal from '../components/review/ReviewModal';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Fetch testimonials from API
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/testimonials/route', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTestimonials(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch testimonials');
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setError(error.message || 'Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      const response = await fetch('/api/testimonials/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showNotification(data.message || 'Thank you for your review!');
        setIsModalOpen(false);
        // Refresh testimonials to show the new review
        await fetchTestimonials();
      } else {
        throw new Error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showNotification(error.message || 'Failed to submit review. Please try again.', 'error');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={18}
        className={`${
          index < rating ? 'text-gold-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Recently';
    }
  };

  const Notification = ({ message, type, onClose }) => (
    <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg flex items-center gap-3 ${
      type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
    } border`}>
      {type === 'success' ? (
        <CheckCircle size={20} className="text-green-600" />
      ) : (
        <AlertCircle size={20} className="text-red-600" />
      )}
      <span className="flex-1">{message}</span>
      <button 
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 ml-2"
      >
        ×
      </button>
    </div>
  );

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Notification */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <MessageCircle className="text-blue-400" size={40} />
              <h2 className="text-4xl md:text-5xl font-serif text-white">
                Customer Reviews
              </h2>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover what makes Velaré the preferred choice for luxury transportation. 
              Read authentic experiences from our valued customers.
            </p>
            
            {/* Add Review Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
            >
              <Plus size={20} />
              Share Your Experience
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              <span className="ml-4 text-gray-300">Loading reviews...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto text-red-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-red-400 mb-2">
                Unable to load reviews
              </h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchTestimonials}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Testimonials Grid */}
          {!isLoading && !error && testimonials.length > 0 && (
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial._id || index} 
                  className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  {/* Header with Rating */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      {renderStars(testimonial.rating)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(testimonial.createdAt)}
                    </div>
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-gray-700 mb-6 leading-relaxed text-lg italic">
                    "{testimonial.text}"
                  </blockquote>

                  {/* Customer Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">
                        {testimonial.name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Verified Customer
                        {testimonial.vehicleType && (
                          <span> • {testimonial.vehicleType}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && testimonials.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto text-gray-500 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-500 mb-4">
                Be the first to share your experience with Velaré!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
              >
                Write First Review
              </button>
            </div>
          )}

          {/* Call to Action */}
          {!isLoading && !error && (
            <div className="text-center mt-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-serif text-white mb-4">
                  Ready to Experience Luxury?
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Join hundreds of satisfied customers who trust Velaré for their premium transportation needs.
                </p>
                <a href='#bookNow'><button className="bg-gold-500 hover:bg-gold-600 text-black font-semibold px-8 py-3 rounded transition-all duration-300 transform hover:scale-105">
                  Book Your Ride
                </button></a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitReview}
      />
    </section>
  );
};

export default Testimonials;