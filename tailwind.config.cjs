module.exports = {
  darkMode: "class",
  content: ["./index.html","./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT:"#0063FF", light:"#AEDCFF", dark:"#001A4C" },
        teal:"#00D1B2", salmon:"#FF6F6C", gold:"#FFB800",
      }
    }
  },
  plugins: [],
};