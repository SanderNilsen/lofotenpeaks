import { createGlobalStyle } from 'styled-components';
import { theme } from './theme.js';

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    background: ${theme.colors.background};
    color: ${theme.colors.ink};
    font-family: Arial, Helvetica, sans-serif;
  }

  img {
    display: block;
    max-width: 100%;
  }

  a {
    color: inherit;
  }

  button,
  input,
  textarea {
    font: inherit;
  }

  .leaflet-container {
    font-family: Arial, Helvetica, sans-serif;
  }
`;
