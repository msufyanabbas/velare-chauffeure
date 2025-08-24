import React, { useState, useEffect } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Function to determine which section is currently in view
  const getCurrentSection = () => {
    const sections = ['home', 'services', 'about', 'contact'];
    const headerHeight = 55;
    
    for (let i = sections.length - 1; i >= 0; i--) {
      const element = document.getElementById(sections[i]);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Check if section is in view (accounting for header height)
        if (rect.top <= headerHeight + 100) { // 100px offset for better UX
          return sections[i];
        }
      }
    }
    return sections[0]; // Default to first section
  };

  // Scroll event listener to update active section
  useEffect(() => {
    const handleScroll = () => {
      const currentSection = getCurrentSection();
      setActiveSection(currentSection);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Call once on mount to set initial state
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 55; // Updated header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setActiveSection(sectionId);
    setIsMenuOpen(false);
  };

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Our Services' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => scrollToSection('home')}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img 
                src="/images/main.png" 
                alt="Logo" 
                className="h-16 w-auto object-contain"
              />
            </button>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => scrollToSection(item.id)} 
                className={`relative text-white hover:text-gold-400 transition-colors cursor-pointer pb-1 ${
                  activeSection === item.id ? 'text-gold-400' : ''
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400 transition-all duration-300"></div>
                )}
              </button>
            ))}
            
            {/* Verification Badges - Desktop */}
            <div className="flex items-center ml-4 pl-4 border-l border-gray-700 space-x-3">
              {/* HSP Verification Badge */}
              <div className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full transition-all duration-300 text-white text-sm font-medium group cursor-pointer"
                   title="Health, Safety & Protection Verified">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10.1V11.1C14.9,11.6 14.4,12 13.9,12H10.1C9.6,12 9.1,11.6 9.2,11.1V10.1C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V10.8H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z"/>
                </svg>
                <span className="hidden lg:inline">HSP Verified</span>
                <span className="lg:hidden">HSP</span>
              </div>

              {/* TripAdvisor Badge */}
              <a
                href="https://www.tripadvisor.com.au/Profile/velarec2025"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-full transition-all duration-300 text-white text-sm font-medium group"
                title="View our TripAdvisor reviews"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="hidden lg:inline">TripAdvisor</span>
                <span className="lg:hidden">TripAdvisor</span>
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* HSP Badge - Mobile with text */}
            <div className="flex items-center bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-full transition-colors cursor-pointer text-xs text-white"
                 title="Health, Safety & Protection Verified">
              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10.1V11.1C14.9,11.6 14.4,12 13.9,12H10.1C9.6,12 9.1,11.6 9.2,11.1V10.1C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V10.8H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z"/>
              </svg>
              <span>HSP Verified</span>
            </div>

            {/* TripAdvisor Badge - Mobile with text */}
            <a
              href="https://www.tripadvisor.com.au/Profile/velarec2025"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-green-600 hover:bg-green-700 px-2 py-1 rounded-full transition-colors text-xs text-white"
              title="View our TripAdvisor reviews"
            >
              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>TripAdvisor</span>
            </a>
            
            <button 
              className="text-white z-60"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-64 opacity-100 mt-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="bg-black bg-opacity-90 backdrop-blur-sm rounded-lg p-4 space-y-4">
            {menuItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative block w-full text-left hover:text-gold-400 transition-colors py-2 pl-4 ${
                  activeSection === item.id ? 'text-gold-400' : 'text-white'
                }`}
              >
                {activeSection === item.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-400 rounded-r"></div>
                )}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;