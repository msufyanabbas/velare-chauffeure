import React from 'react';

const Fleet = () => {
  const vehicles = [
    {
      title: "Luxury Sedan",
      description: "A sleek and sophisticated sedan with premium amenities",
      image: "/images/luxury-sedan.jpg"
    },
    {
      title: "Luxury SUV",
      description: "A spacious and versatile SUV offering a comfortable ride",
      image: "/images/luxury-suv.jpg"
    },
    {
      title: "Luxury MPV",
      description: "A roomy and adaptable MPV, ideal for group travel",
      image: "/images/luxury-mpv.jpg"
    }
  ];

  return (
    <section id="fleet" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">
              FLEET
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              We offer a range of high-end vehicles to suit your preferences and requirements.
            </p>
          </div>

          {/* Fleet Grid */}
          <div className="space-y-12">
            {vehicles.map((vehicle, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-8 items-center">
                {/* Vehicle Image */}
                <div className="relative">
                  <div className="h-64 md:h-80 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={vehicle.image}
                      alt={vehicle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-3xl font-serif text-gray-900">
                    {vehicle.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {vehicle.description}
                  </p>
                  <button className="bg-gold-400 text-black px-8 py-3 rounded-md hover:bg-gold-300 transition-colors font-medium">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Fleet;