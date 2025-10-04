export const Image = ({
  src,
  alt,
  style,
  className,
  width,
  height,
  ...rest
}) => {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: width ?? '100%',  
        height: height ?? 'auto', 
        ...style,
      }}
      className={className}
      {...rest}
    />
  );
};
