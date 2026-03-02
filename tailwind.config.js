/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: "var(--brand-primary)",
                    secondary: "var(--brand-secondary)",
                    accent: "var(--brand-accent)",
                    accentHover: "var(--brand-accentHover)",
                    text: "var(--brand-text)",
                    muted: "var(--brand-muted)",
                    border: "var(--brand-border)",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
        },
    },
};
