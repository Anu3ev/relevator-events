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
      }
    },
  },
}
