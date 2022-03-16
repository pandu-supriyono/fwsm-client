import { Global } from '@emotion/react'

export const Fonts = () => (
  <Global
    styles={`
      /* latin */
      @font-face {
        font-family: 'Beatnik SF';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url('/fonts/BeatnikSF-Bold.woff2') format('woff2'), url('/fonts/BeatnikSF-Bold.woff') format('woff');
      }
      `}
  />
)
