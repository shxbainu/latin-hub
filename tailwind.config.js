const v = (n) => `rgb(var(--${n}) / <alpha-value>)`;
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'), surface: v('surface'), sunken: v('sunken'), ink: v('ink'), muted: v('muted'), line: v('line'),
        accent: v('accent'), 'accent-soft': v('accent-soft'), 'accent-ink': v('accent-ink'),
        good: v('good'), 'good-soft': v('good-soft'), bad: v('bad'), 'bad-soft': v('bad-soft'),
        warm: v('warm'), 'warm-soft': v('warm-soft'), hl: v('hl'), gf: v('gf'), gm: v('gm'), gn: v('gn'),
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'Times New Roman', 'serif'],
      },
      borderRadius: { xl2: '1.125rem' },
    },
  },
};
