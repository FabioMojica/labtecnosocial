export const checkScrollPosition = () => {
  const container = isFullscreen ? containerRef.current : document.documentElement;

  if (!container) return;

  const scrollTop = isFullscreen ? container.scrollTop : window.scrollY;
  const clientHeight = isFullscreen ? container.clientHeight : window.innerHeight;
  const scrollHeight = isFullscreen
    ? container.scrollHeight
    : document.documentElement.scrollHeight;

  // Si NO hay scroll → flecha abajo desactivada
  if (scrollHeight <= clientHeight + 2) {
    setScrollDirection('down');
    return;
  }

  // Si estamos al fondo → flecha arriba
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    setScrollDirection('up');
  } else {
    setScrollDirection('down');
  }
};
