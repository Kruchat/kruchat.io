/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Inter'", "ui-sans-serif", "system-ui"],
        body: ["'Inter'", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", {
      teacher: {
        "primary": "#3b82f6",
        "secondary": "#22c55e",
        "accent": "#f59e0b",
        "neutral": "#1f2937",
        "base-100": "#f9fafb",
        "info": "#38bdf8",
        "success": "#10b981",
        "warning": "#facc15",
        "error": "#ef4444"
      }
    }],
    logs: false
  }
};
