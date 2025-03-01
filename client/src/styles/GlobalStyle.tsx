import styled, { createGlobalStyle } from 'styled-components';
import * as palette from '@styles/Variables';

const GlobalStyle = createGlobalStyle`
  :root {
    --border-color: #ABABAB;

    --infowindow-max-width: 140px;
    --infowindow-border-width: 1px;

    --anchor-size: 7px;
    --anchor-bg-size: calc(var(--anchor-size) + var(--infowindow-border-width));

    --restaurant-marker-size: 30px;
    --user-marker-size: 36px;
  }

  html, body, #root {
    height: 100%;
  }

  * {
    font-family: 'BM Hanna';
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

export const MainLayout = styled.div`
  height: 100%;
  aspect-ratio: 9 / 16;
  zoom: 1.25;
  margin: 0 auto;
  border: 3px solid ${palette.BORDER};
  overflow: hidden;

  @media (max-width: ${palette.BREAKPOINT_TABLET}) {
    border: 0;
    zoom: 0;
    aspect-ratio: auto;
  }
`;

export default GlobalStyle;
