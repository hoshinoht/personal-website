import { useEffect } from 'react';

const ASCII_ART = `
%c██████╗  ██████╗     ██╗  ██╗ █████╗  ██████╗ ████████╗██╗███╗   ██╗ ██████╗
██╔══██╗██╔═══██╗    ██║  ██║██╔══██╗██╔═══██╗╚══██╔══╝██║████╗  ██║██╔════╝
██████╔╝██║   ██║    ███████║███████║██║   ██║   ██║   ██║██╔██╗ ██║██║  ███╗
██╔═══╝ ██║   ██║    ██╔══██║██╔══██║██║   ██║   ██║   ██║██║╚██╗██║██║   ██║
██║     ╚██████╔╝    ██║  ██║██║  ██║╚██████╔╝   ██║   ██║██║ ╚████║╚██████╔╝
╚═╝      ╚═════╝     ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝
`;

export function ConsoleArt() {
  useEffect(() => {
    console.log(ASCII_ART, 'color: #C4A2D4; font-family: monospace; font-size: 10px;');
    console.log(
      '%cCurious? Press ` to open the terminal, or ⌘K to search.',
      'color: #78E1D0; font-size: 13px; font-family: Inter, sans-serif;',
    );
    console.log(
      '%cBuilt with React 19 + Vite 6 + Catppuccin Dusk',
      'color: #C9CAD6; font-size: 11px; font-family: Inter, sans-serif;',
    );
    console.log(
      '%c// ↑↑↓↓←→←→BA — if you know, you know.',
      'color: #6D707A; font-size: 10px; font-family: monospace; font-style: italic;',
    );
  }, []);

  return null;
}
