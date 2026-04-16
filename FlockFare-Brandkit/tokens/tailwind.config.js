/**
 * FlockFare · Tailwind v3+ config
 * Drop-in brand theme. Import into `tailwind.config.{js,ts}` and spread
 * into the existing `theme.extend`.
 */
module.exports = {
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        ink:       { DEFAULT: '#0B0B0F', soft: '#1A1A22' },
        cream:     '#F6F3EC',
        paper:     '#FFFFFF',
        violet:    { DEFAULT: '#6D28FF', deep: '#2A1470', tint: '#EFE6FF' },
        lime:      { DEFAULT: '#D8FF3C', tint: '#F3FFC7' },
        coral:     { DEFAULT: '#FF4E64', tint: '#FFE5ED' },
        sun:       '#FFD166',
        ffgray: {
          50: '#FAFAF6', 100: '#F1F1EC', 200: '#E2E2DD', 300: '#C9C9C4',
          400: '#9C9C98', 500: '#6A6A67', 600: '#4A4A48', 700: '#2F2F2D',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Archivo Black"', 'system-ui', 'sans-serif'],
        body:    ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '12': ['0.75rem',   { lineHeight: '1.5'  }],
        '14': ['0.875rem',  { lineHeight: '1.5'  }],
        '16': ['1rem',      { lineHeight: '1.5'  }],
        '18': ['1.125rem',  { lineHeight: '1.5'  }],
        '24': ['1.5rem',    { lineHeight: '1.2'  }],
        '32': ['2rem',      { lineHeight: '1.14' }],
        '44': ['2.75rem',   { lineHeight: '1.1'  }],
        '60': ['3.75rem',   { lineHeight: '1.02' }],
        '80': ['5rem',      { lineHeight: '0.98' }],
      },
      letterSpacing: {
        display: '-0.03em',
        head:    '-0.02em',
        body:    '-0.005em',
        mono:    '0.18em',
      },
      borderRadius: {
        DEFAULT: '12px',
        lg:   '20px',
        xl:   '28px',
        pill: '9999px',
      },
      borderWidth: { bold: '4px' },
      boxShadow: {
        'brut-sm':     '3px 3px 0 #0B0B0F',
        'brut':        '6px 6px 0 #0B0B0F',
        'brut-lg':     '10px 10px 0 #0B0B0F',
        'brut-violet': '6px 6px 0 #6D28FF',
        'brut-coral':  '6px 6px 0 #FF4E64',
        'soft':        '0 1px 2px rgba(11,11,15,0.06), 0 4px 12px rgba(11,11,15,0.06)',
      },
      transitionTimingFunction: {
        'ff-out': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        'ff-ioq': 'cubic-bezier(0.83, 0, 0.17, 1)',
      },
      transitionDuration: { '120': '120ms', '220': '220ms', '360': '360ms', '520': '520ms' },
      maxWidth: { 'ff-container': '1200px', 'ff-md': '896px', 'ff-sm': '680px' },
    },
  },
  plugins: [],
};
