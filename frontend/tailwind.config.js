/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#8B5CF6',
                    DEFAULT: '#7C3AED',
                    dark: '#6D28D9',
                },
                secondary: {
                    light: '#FDE68A',
                    DEFAULT: '#FCD34D',
                    dark: '#F59E0B',
                },
                background: {
                    light: '#F3F4F6',
                    DEFAULT: '#F9FAFB',
                    dark: '#E5E7EB',
                },
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                light: {
                    ...require("daisyui/src/theming/themes")["light"],
                    primary: "#7C3AED",
                    secondary: "#FCD34D",
                    accent: "#F472B6",
                    neutral: "#1F2937",
                    "base-100": "#F9FAFB",
                    "base-200": "#F3F4F6",
                    "base-300": "#E5E7EB",
                },
                dark: {
                    ...require("daisyui/src/theming/themes")["dark"],
                    primary: "#8B5CF6",
                    secondary: "#FDE68A",
                    accent: "#F472B6",
                    neutral: "#F3F4F6",
                    "base-100": "#1F2937",
                    "base-200": "#111827",
                    "base-300": "#0F172A",
                },
            },
        ],
    },
} 