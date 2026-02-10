import { Box } from '@mui/material';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { useRef, useState } from 'react';

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
  const [naturalSize, setNaturalSize] = useState(null);

  // ancho y alto guardados en DB
  const width = toNumberSize(element.width, 400);
  const height = toNumberSize(element.height, 400);

  const getAlt = () => element.alt?.trim() || `Imagen_${element.id || Date.now()}`;

  // calcula altura proporcional real
  const calcHeightProportional = (newWidth) => {
    if (!naturalSize?.width || !naturalSize?.height) return height;
    return Math.round(newWidth * (naturalSize.height / naturalSize.width));
  };

  // altura de visualización limitada a 400
  const calcHeightDisplay = (newWidth) => Math.min(calcHeightProportional(newWidth), 400);

  if (!naturalSize) {
    return (
      <img
        ref={imgRef}
        src={element.src}
        alt={getAlt()}
        style={{ display: 'none' }}
        onLoad={() => {
          const naturalWidth = imgRef.current.naturalWidth;
          const naturalHeight = imgRef.current.naturalHeight;
          setNaturalSize({ width: naturalWidth, height: naturalHeight });

          // altura real proporcional
          const correctedHeight = Math.round(width * (naturalHeight / naturalWidth));

          // actualizar datos reales si cambió
          if (correctedHeight !== element.height) {
            onResize(width, correctedHeight, getAlt());
            onResizeStop(width, correctedHeight, getAlt());
          }
        }}
      />
    );
  }

  const initialHeight = calcHeightDisplay(width);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <ResizableBox
        width={width}
        height={initialHeight}
        axis="x"
        resizeHandles={['se']}
        minConstraints={[150, 50]}
        maxConstraints={[400, 400]} // máximo visual
        handleSize={[10, 10]}
        onResize={(e, { size }) => {
          const newHeight = calcHeightDisplay(size.width); // visual
          onResize(size.width, newHeight, getAlt());
        }}
        onResizeStop={(e, { size }) => {
          const newHeight = calcHeightProportional(size.width); // altura real
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
            maxHeight: 400,
            objectFit: 'cover',
            display: 'block',
            borderRadius: 8,
          }}
        />
      </ResizableBox>
    </Box>
  );
};
