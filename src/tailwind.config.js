/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'mandi': {
                    primary: '#312e81',
                    'primary-light': '#4f46e5',
                    accent: '#f59e0b',
                }
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            animation: {
                'panorama': 'panorama-scroll 40s linear infinite',
                'float-decor': 'floatDecor 15s ease-in-out infinite',
                'fade-up-login': 'fadeUpLogin 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'icon-float': 'iconFloat 3s ease-in-out infinite',
                'slide-up-sheet': 'slideUpSheet 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-left': 'slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'fade-in': 'fadeIn 0.4s forwards',
                'bounce-slow': 'bounce 3s infinite',
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                'panorama-scroll': {
                    '0%': { backgroundPosition: '0 center' },
                    '100%': { backgroundPosition: '-200% center' },
                },
                floatDecor: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                },
                fadeUpLogin: {
                    '0%': { opacity: 0, transform: 'translateY(40px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                iconFloat: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-15px)' },
                },
                slideUpSheet: {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                slideLeft: {
                    '0%': { opacity: 0, transform: 'translateX(30px)' },
                    '100%': { opacity: 1, transform: 'translateX(0)' },
                },
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                }
            }
        },
    },
    plugins: [],
}