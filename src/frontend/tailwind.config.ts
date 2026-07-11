import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      /* ==========================================
       * Colors
       * ========================================== */
      colors: {
        sidebar: {
          DEFAULT: "#0B2E36",
          border: "#153B47",
          hover: "#1E4D5A",
          footer: "#09252C",
          card: "#082229",
        },

        brand: {
          DEFAULT: "#14B8A6",
          dark: "#0F766E",
          soft: "#CCFBF1",
        },

        surface: {
          page: "#F8FAFC",
          card: "#FFFFFF",
          muted: "#F1F5F9",
        },
      },

      /* ==========================================
       * Width & Height
       * ========================================== */

      spacing: {
        sidebar: "16rem",
        "sidebar-collapsed": "5rem",

        header: "4rem",

        page: "2rem",
      },

      /* ==========================================
       * Border Radius
       * ========================================== */

      borderRadius: {
        card: "12px",
      },

      /* ==========================================
       * Shadow
       * ========================================== */

      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,.12)",
      },

      /* ==========================================
       * Font Size
       * ========================================== */

      fontSize: {
        tiny: "10px",
      },

      /* ==========================================
       * Animation
       * ========================================== */

      transitionDuration: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
      },
    },
  },

  plugins: [],
};

export default config;