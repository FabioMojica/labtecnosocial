import { Box } from '@mui/material';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { useRef, useState, useEffect } from 'react';

const toNumberSize = (value, fallback) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};


export const ResizableImage = ({ element, onResize, onResizeStop }) => {
  const imgRef = useRef(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const width = toNumberSize(element.width, 400);
  const height = toNumberSize(element.height, 400);

  const getAlt = () =>
    element.alt?.trim() || `Imagen_${element.id || Date.now()}`;

  const calcHeight = (newWidth) => {
    if (!naturalSize.width || !naturalSize.height) return height;
    const ratio = naturalSize.width / naturalSize.height;
    return Math.round(newWidth / ratio);
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      <ResizableBox
        width={width}
        height={height}
        axis="x"
        resizeHandles={['se']}
        minConstraints={[150, 50]}
        maxConstraints={[800, 800]}
        handleSize={[10, 10]}
        onResize={(e, { size }) => {
          const newHeight = calcHeight(size.width);
          onResize(size.width, newHeight, getAlt());
        }}
        onResizeStop={(e, { size }) => {
          const newHeight = calcHeight(size.width);
          onResizeStop(size.width, newHeight, getAlt());
        }}
      >
        <img
          ref={imgRef}
          src={element.src}
          alt={getAlt()}
          style={{
            width: '100%', 
            height: 'auto',
            display: 'block',
            borderRadius: 8,
          }}
          onLoad={() => {
            const naturalWidth = imgRef.current.naturalWidth;
            const naturalHeight = imgRef.current.naturalHeight;

            setNaturalSize({
              width: naturalWidth,
              height: naturalHeight,
            });

            const ratio = naturalWidth / naturalHeight;
            const correctedHeight = Math.round(width / ratio);

            onResize(width, correctedHeight, getAlt());
            onResizeStop(width, correctedHeight, getAlt());
          }}
        />
      </ResizableBox>
    </Box>
  );
};
