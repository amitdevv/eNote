/** @type {import('tailwindcss').Config} */
export default {
  // Dark mode intentionally disabled — see user preference.
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        geist: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Iowan Old Style"', 'Lora', 'ui-serif', 'Georgia', 'Cambria', 'serif'],
        display: ['"Iowan Old Style"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        micro: 'var(--size-micro)',
        caption: 'var(--size-caption)',
        preview: 'var(--size-preview)',
        nav: 'var(--size-nav)',
        header: 'var(--size-header)',
        title: 'var(--size-title)',
      },
      colors: {
        // Legacy shadcn tokens (kept for existing components)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },

        // eNote design system tokens (see DESIGN.md §2)
        surface: {
          app: "var(--surface-app)",
          panel: "var(--surface-panel)",
          raised: "var(--surface-raised)",
          muted: "var(--surface-muted)",
          active: "var(--surface-active)",
        },
        ink: {
          strong: "var(--ink-strong)",
          DEFAULT: "var(--ink-default)",
          muted: "var(--ink-muted)",
          subtle: "var(--ink-subtle)",
          placeholder: "var(--ink-placeholder)",
        },
        line: {
          subtle: "var(--line-subtle)",
          DEFAULT: "var(--line-default)",
        },
        brand: {
          DEFAULT: "var(--brand)",
          fg: "var(--brand-fg)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 1px rgba(0,0,0,.04), 0 3px 6px rgba(0,0,0,.02)",
        'xs-dark': "inset 0 1px 0 rgba(255,255,255,.04), 0 1px 1px rgba(0,0,0,.35)",
        sm: "0 3px 6px -2px rgba(0,0,0,.02), 0 1px 1px rgba(0,0,0,.04)",
        md: "0 8px 24px -4px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)",
        lg: "0 16px 48px -8px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06)",
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(.25,1,.5,1)',
        'out-expo': 'cubic-bezier(.16,1,.3,1)',
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        shimmer: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        // Centered-dialog entrance. Uses the `translate` property (not transform)
        // so the `-translate-x-1/2 -translate-y-1/2` centering utilities stay intact.
        "dialog-in": {
          from: { opacity: "0", translate: "0 6px" },
          to: { opacity: "1", translate: "0 0" },
        },
        // Bottom-sheet style for quick capture. Uses the `translate` property
        // (not transform) so the X-centering via `translate: -50% 0` stays
        // intact while we animate the Y.
        "sheet-in": {
          from: { opacity: "0", translate: "-50% 32px" },
          to: { opacity: "1", translate: "-50% 0" },
        },
        "sheet-out": {
          from: { opacity: "1", translate: "-50% 0" },
          to: { opacity: "0", translate: "-50% 24px" },
        },
        "float-a": {
          "0%, 100%": { transform: "translateY(0) rotate(var(--r, 0deg))" },
          "50%": { transform: "translateY(-10px) rotate(var(--r, 0deg))" },
        },
        "float-b": {
          "0%, 100%": { transform: "translateY(0) rotate(var(--r, 0deg))" },
          "50%": { transform: "translateY(-14px) rotate(var(--r, 0deg))" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "fade-in": "fade-in 150ms ease-out",
        "slide-up": "slide-up 200ms cubic-bezier(.16,1,.3,1)",
        "dialog-in": "dialog-in 180ms cubic-bezier(.16,1,.3,1)",
        // Emil-style: slightly overshoot ease, fast, anchored at the bottom edge.
        "sheet-in": "sheet-in 280ms cubic-bezier(.16,1,.3,1)",
        "sheet-out": "sheet-out 180ms cubic-bezier(.4,0,1,1)",
        "float-a": "float-a 6s ease-in-out infinite",
        "float-b": "float-b 7.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
