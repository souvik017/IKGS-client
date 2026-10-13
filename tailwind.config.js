/**
 * IKGS Solution design system.
 *
 * All brand colours, typography, shadows and gradients are defined here so
 * components never scatter raw colour values. The tokens map to the CSS
 * variables declared in `src/index.css`.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary blue - buttons, links, highlights
        primary: {
          DEFAULT: '#3568F5',
          soft: '#5B85F8',
          dark: '#2A55D8',
        },
        // Deep royal blue - gradient endpoints, active states
        royal: {
          DEFAULT: '#3568F5',
          dark: '#294EAD',
          light: '#5B85F8',
        },
        deep: '#294EAD',
        // Navy - headings and dark text
        navy: {
          DEFAULT: '#11101F',
          800: '#1B1A2E',
          700: '#2A2940',
        },
        // Body gray - paragraphs and descriptions
        body: '#5F6068',
        // Soft accents
        ice: '#EAF0FF',
        frost: '#DCE8FF',
        // Structure
        line: '#E9EBF2',
        offwhite: '#F8F9FC',
        mist: '#F8F9FC',
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        // Responsive, fluid type scale with clamp()
        hero: ['clamp(2.5rem, 5.2vw, 4.75rem)', { lineHeight: '1.04', letterSpacing: '-0.03em' }],
        display: ['clamp(2rem, 3.6vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        section: ['clamp(1.75rem, 2.8vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        cardheading: ['clamp(1.25rem, 1.4vw, 1.6rem)', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(110deg, #3568F5 0%, #294EAD 100%)',
        'brand-gradient-soft': 'linear-gradient(110deg, rgba(53,104,245,0.08) 0%, rgba(41,78,173,0.12) 100%)',
      },
      boxShadow: {
        card: '0 4px 24px -8px rgba(17, 16, 31, 0.10)',
        soft: '0 2px 12px -4px rgba(17, 16, 31, 0.08)',
        lift: '0 18px 40px -16px rgba(53, 104, 245, 0.45)',
        nav: '0 1px 0 0 #E9EBF2, 0 8px 24px -18px rgba(17,16,31,0.25)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      maxWidth: {
        prose: '68ch',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 9s ease-in-out infinite',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
