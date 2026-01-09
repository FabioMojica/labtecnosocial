import { useEffect } from 'react';

export const useCloseTooltipsOnScroll = () => {
  useEffect(() => {
    const handleScroll = () => {
      const tooltips = document.querySelectorAll('.MuiTooltip-popper[role="tooltip"]');
      tooltips.forEach((tooltip) => {
        // Forzamos que desaparezcan
        tooltip.style.opacity = '0';
        tooltip.style.pointerEvents = 'none';
      });
    };

    window.addEventListener('scroll', handleScroll, true); // true -> captura en fase de burbuja

    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);
};
