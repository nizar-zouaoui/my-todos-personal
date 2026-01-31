module.exports = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        "surface-muted": "hsl(var(--surface-muted))",
        primary: "hsl(var(--primary))",
        "primary-hover": "hsl(var(--primary-hover))",
        accent: "hsl(var(--accent))",
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        border: "hsl(var(--border))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
      },
      boxShadow: {
        card: "0 6px 18px hsl(var(--primary) / 0.08), 0 2px 6px hsl(var(--primary) / 0.06)",
        hero: "0 16px 40px hsl(var(--primary) / 0.12), 0 4px 12px hsl(var(--primary) / 0.08)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["2.75rem", { lineHeight: "1.1", fontWeight: "600" }],
        h1: ["2rem", { lineHeight: "1.2", fontWeight: "600" }],
        h2: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.6" }],
        caption: ["0.875rem", { lineHeight: "1.5" }],
      },
      letterSpacing: {
        hero: "0.2em",
      },
      transitionDuration: {
        soft: "180ms",
      },
      transitionTimingFunction: {
        soft: "ease",
      },
    },
  },
  plugins: [],
};
