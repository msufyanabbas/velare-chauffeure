module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'dots-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      spacing: {
        '1/10': '10%',
        '1/12': '8.333333%',
        '3/5': '60%',
      },
      colors: {
        gold: {
          50: '#ab8846',
          100: '#ab8846',
          200: '#ab8846',
          300: '#ab8846',
          400: '#ab8846',
          500: '#ab8846',
          600: '#ab8846',
          700: '#ab8846',
          800: '#ab8846',
          900: '#ab8846',
        },
        luxury: {
          dark: '#1a1a1a',
          charcoal: '#2d2d2d',
          light: '#f8f9fa',
          bronze: '#ab8846',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)",
      },
    },
  },
  plugins: [],
}