import type { Config } from 'tailwindcss'
import formsPlugin from '@tailwindcss/forms'
import typographyPlugin from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Includes all relevant Next.js files
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A73E8',   // Google blue
        accent: '#34A853',    // Google green
        muted: '#F1F3F4',     // Light grey background
        dark: '#202124',      // Dark theme base
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    formsPlugin,     // Optional: better form styling
    typographyPlugin // Optional: great for blogs/resumes
  ],
}
export default config
