/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        // Headings site-wide (see index.css `h1`-`h6`/`--font-display`).
        outfit: ['Outfit', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        // Editorial display serif — reserved for destination-hero headlines
        // (travel-magazine accent), never body/UI copy.
        fraunces: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        // Body copy site-wide (see index.css `body`).
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Primary — deep navy (logo color: #0E1F6D), CTA buttons, links, active states.
        // Kept anchored to the JustTrip logo navy rather than the Meko
        // reference's bright sky-blue — brand identity takes precedence here.
        primary: {
          50: '#e8ecfc',
          100: '#d2d9f9',
          200: '#aebbf4',
          300: '#788ded',
          400: '#3454e5',
          500: '#1834b5',
          600: '#0e1f6d',
          700: '#0a164d',
          800: '#071036',
          900: '#050b26',
          950: '#030719',
        },
        // Secondary — teal/mint (success badges, checkmarks, progress indicators)
        secondary: {
          50: '#ecfdf7',
          100: '#d1faec',
          200: '#a6f3dc',
          300: '#6fe6c7',
          400: '#3ed1ae',
          500: '#1ab894',
          600: '#109677',
          700: '#0d7860',
          800: '#0e5f4e',
          900: '#0e4e41',
          950: '#052c25',
        },
        // Accent — gold/amber (public marketing pages: CTAs, badges, highlights).
        // Paired with primary navy per the UniReach reference (navy + gold + white).
        // Dashboard/app UI keeps the old coral-orange accent below instead.
        accent: {
          50: '#fff8ec',
          100: '#feedce',
          200: '#fdd89a',
          300: '#fbbe60',
          400: '#f7a730',
          500: '#ef9315',
          600: '#cc7a0c',
          700: '#a6620b',
          800: '#844e10',
          900: '#6c4111',
          950: '#3d2205',
        },
        // Coral — dashboard/app UI's action-button color (deal badges,
        // highlights). Was the old accent orange; now mirrors the accent
        // gold scale exactly so dashboard buttons match the public-page
        // brand color instead of reading as a separate orange.
        coral: {
          50: '#fff8ec',
          100: '#feedce',
          200: '#fdd89a',
          300: '#fbbe60',
          400: '#f7a730',
          500: '#ef9315',
          600: '#cc7a0c',
          700: '#a6620b',
          800: '#844e10',
          900: '#6c4111',
          950: '#3d2205',
        },
        // Ink — neutral near-black (headings, dark sections, footer)
        // Tuned to match the Meko reference (Design/Meko-design.webp): its CTA
        // buttons and footer use a neutral #1f1f1f, not a navy-tinted black.
        ink: {
          50: '#f6f6f6',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#8a8a8a',
          500: '#6b6b6b',
          600: '#4a4a4a',
          700: '#333333',
          800: '#262626',
          900: '#1f1f1f',
          950: '#141414',
        },
        // Cream — neutral off-white (hero/section background)
        // Matches the Meko reference's alternating section backgrounds, which
        // are a neutral light gray rather than a warm beige.
        cream: {
          50: '#fbfbfb',
          100: '#f5f5f6',
          200: '#ececee',
        },
      },
      boxShadow: {
        'theme-sm': '0px 1px 3px 0px rgba(14, 16, 23, 0.08)',
        'theme-md': '0px 4px 12px -2px rgba(14, 16, 23, 0.10)',
        'theme-lg': '0px 16px 32px -8px rgba(14, 16, 23, 0.14)',
        'focus-ring': '0 0 0 3px rgba(52, 84, 229, 0.15)',
      },
    },
  },
  plugins: [],
}
