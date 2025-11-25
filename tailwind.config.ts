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
      colors: {
        brand: {
          primary: '#433AF8',
          accent: '#C1CFFF'
        },
        surface: {
          card: '#333333'
        }
      },

      fontSize: {
        btn: ['15px', { lineHeight: '40px' }],
        chip: ['15px', { lineHeight: '1.2' }],
        'participants-header': ['32px', { lineHeight: '1.1' }],
        'event-title': ['80px', { lineHeight: '1.1' }]
      }
    },
  },
}
