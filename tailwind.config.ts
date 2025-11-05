import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          variant: "hsl(var(--primary-variant))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          variant: "hsl(var(--secondary-variant))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          variant: "hsl(var(--accent-variant))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Short Talez Brand Colors
        "brand-black": "#050505",
        "brand-gold": "#C99A2E", 
        "gold-accent": "#FFD85A",
        "neutral-dark": "#1a1a1a",
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'cinzel': ['Cinzel', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'elegant': 'var(--shadow-elegant)',
        'glow': 'var(--shadow-glow)',
        'card': 'var(--shadow-card)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.5",
          },
        },
        confetti: {
          "0%": {
            transform: "scale(0) rotate(0deg)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(1) rotate(360deg)",
            opacity: "0",
          },
        },
        "count-up": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-fade-in": {
          from: {
            opacity: "0",
            transform: "translateX(-20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "bounce-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.3)",
          },
          "50%": {
            transform: "scale(1.05)",
          },
          "70%": {
            transform: "scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "zoomOut": {
          "0%": {
            transform: "scale(3) translateY(-20px)",
            opacity: "0.8"
          },
          "100%": {
            transform: "scale(1) translateY(0)",
            opacity: "1"
          }
        },
        "zoomOutReturn": {
          "0%": {
            transform: "scale(3) translateY(-20px)",
            opacity: "0.8"
          },
          "70%": {
            transform: "scale(0.8) translateY(10px)",
            opacity: "1"
          },
          "100%": {
            transform: "scale(1) translateY(0)",
            opacity: "1"
          }
        },
        "zoomOutDisappear": {
          "0%": {
            transform: "scale(3) translateY(-20px)",
            opacity: "0.8"
          },
          "70%": {
            transform: "scale(0.8) translateY(10px)",
            opacity: "1"
          },
          "100%": {
            transform: "scale(0) translateY(50px)",
            opacity: "0"
          }
        },
        "slideToSide": {
          "0%": {
            transform: "translate(0, 0)",
          },
          "100%": {
            transform: "translate(var(--final-x), var(--final-y))",
          }
        },
        "ripple": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(4)", opacity: "0" }
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.8)" }
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" }
        },
        "swing": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%": { transform: "rotate(15deg)" },
          "40%": { transform: "rotate(-10deg)" },
          "60%": { transform: "rotate(5deg)" },
          "80%": { transform: "rotate(-5deg)" }
        },
        "rubber-band": {
          "0%": { transform: "scale3d(1, 1, 1)" },
          "30%": { transform: "scale3d(1.25, 0.75, 1)" },
          "40%": { transform: "scale3d(0.75, 1.25, 1)" },
          "50%": { transform: "scale3d(1.15, 0.85, 1)" },
          "65%": { transform: "scale3d(0.95, 1.05, 1)" },
          "75%": { transform: "scale3d(1.05, 0.95, 1)" },
          "100%": { transform: "scale3d(1, 1, 1)" }
        },
        "tada": {
          "0%": { transform: "scale3d(1, 1, 1)" },
          "10%, 20%": { transform: "scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg)" },
          "30%, 50%, 70%, 90%": { transform: "scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)" },
          "40%, 60%, 80%": { transform: "scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)" },
          "100%": { transform: "scale3d(1, 1, 1)" }
        },
        "wobble": {
          "0%": { transform: "none" },
          "15%": { transform: "translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg)" },
          "30%": { transform: "translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg)" },
          "45%": { transform: "translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg)" },
          "60%": { transform: "translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg)" },
          "75%": { transform: "translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg)" },
          "100%": { transform: "none" }
        },
        "jello": {
          "0%, 11.1%, 100%": { transform: "none" },
          "22.2%": { transform: "skewX(-12.5deg) skewY(-12.5deg)" },
          "33.3%": { transform: "skewX(6.25deg) skewY(6.25deg)" },
          "44.4%": { transform: "skewX(-3.125deg) skewY(-3.125deg)" },
          "55.5%": { transform: "skewX(1.5625deg) skewY(1.5625deg)" },
          "66.6%": { transform: "skewX(-0.78125deg) skewY(-0.78125deg)" },
          "77.7%": { transform: "skewX(0.390625deg) skewY(0.390625deg)" },
          "88.8%": { transform: "skewX(-0.1953125deg) skewY(-0.1953125deg)" }
        },
        "heartbeat": {
          "0%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.3)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.3)" },
          "70%": { transform: "scale(1)" }
        },
        "gradientShift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        },
        "morphing": {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" }
        },
        "neonPulse": {
          "0%, 100%": { 
            boxShadow: "0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor",
            transform: "scale(1)"
          },
          "50%": { 
            boxShadow: "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
            transform: "scale(1.05)"
          }
        },
        "liquidWave": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        "glitchEffect": {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" }
        },
        "floatUpDown": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" }
        },
        "scroll-left": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" }
        },
        "scroll-left-mobile": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-75%)" }
        },
        "scroll-left-tablet": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-60%)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        confetti: "confetti 0.8s ease-out",
        "count-up": "count-up 0.6s ease-out",
        "slide-fade-in": "slide-fade-in 0.4s ease-out",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "zoomOut": "zoomOut 2s ease-out forwards",
        "zoomOutReturn": "zoomOutReturn 3s ease-out forwards",
        "zoomOutDisappear": "zoomOutDisappear 3s ease-out forwards",
        "slideToSide": "slideToSide 2s ease-out forwards",
        "ripple": "ripple 1s ease-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "fade-in": "fade-in 0.6s ease-out",
        "shake": "shake 0.5s ease-in-out",
        "swing": "swing 1s ease-in-out",
        "rubber-band": "rubber-band 1s ease-in-out",
        "tada": "tada 1s ease-in-out",
        "wobble": "wobble 1s ease-in-out",
        "jello": "jello 1s ease-in-out",
        "heartbeat": "heartbeat 1.5s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
        "morphing": "morphing 8s ease-in-out infinite",
        "neon-pulse": "neonPulse 2s ease-in-out infinite",
        "liquid-wave": "liquidWave 20s linear infinite",
        "glitch": "glitchEffect 0.3s ease-in-out infinite",
        "float-up-down": "floatUpDown 3s ease-in-out infinite",
        "scroll-left": "scroll-left 20s linear infinite",
        "scroll-left-fast": "scroll-left 15s linear infinite",
        "scroll-left-slow": "scroll-left 25s linear infinite",
        "scroll-left-mobile": "scroll-left-mobile 18s linear infinite",
        "scroll-left-tablet": "scroll-left-tablet 20s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
