import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    "./src/**/*.{js,ts,tsx,vue}",
    "./app/**/*.{js,ts,tsx,vue}",
    "./pages/**/*.{js,ts,tsx,vue}",
    "./components/**/*.{js,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['PP Mori', 'PPMori', 'sans-serif'],
      },
      fontSize: {
        // Typography scale
        // Match available PPMori weights (max 600) to avoid synthetic bolding
        'h1': ['3rem', { lineHeight: '1.2', fontWeight: '600' }],      // 48px
        'h2': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],      // 32px
        'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],    // 24px
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }], // 18px
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],     // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px
      }
    },
  },
}
