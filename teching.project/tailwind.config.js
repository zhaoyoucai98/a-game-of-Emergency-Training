/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 主色调
        primary: '#1E90FF',
        'primary-light': '#7FC4FF',
        'primary-dark': '#1565C0',
        // 功能色
        life: '#32CD32',
        'life-light': '#A5E6A5',
        alert: '#FF6347',
        'alert-light': '#FFB3A6',
        warm: '#FFA500',
        'warm-light': '#FFD08A',
        // 纸面/底色
        paper: '#FFF9F0',
        // 能量黄（金币/星星）
        gold: '#FFD93D',
        'gold-light': '#FEF3C7',
        // 文字
        ink: '#1F2937',
      },
      fontFamily: {
        sans: ['"Microsoft YaHei"', 'PingFang SC', 'sans-serif'],
      },
      boxShadow: {
        'game': '0 6px 0 0 rgba(0,0,0,0.12), 0 8px 16px -4px rgba(0,0,0,0.15)',
        'game-sm': '0 3px 0 0 rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.15)',
        'pill': '0 2px 0 0 rgba(0,0,0,0.08), 0 4px 8px -2px rgba(0,0,0,0.1)',
      },
      animation: {
        'bounce-slow': 'bounce 2.5s infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 1.5s ease-in-out infinite',
        'pop-in': 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
