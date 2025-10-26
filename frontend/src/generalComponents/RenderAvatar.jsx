import React, { useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import { getImageUrl } from "../pages/StrategicPlan/utils/getImageUrl";

const RenderAvatar = React.forwardRef(({
  image,
  localImage,
  firstName = "",
  lastName = "",
  fallbackText = "U",
  size = 32,
  type = 'unknown',
  sx = {},
  alt = "avatar",
  ...restProps
}, ref) => {
  const [imgError, setImgError] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    setImgError(false);
    let url = null;

    if (localImage) {
      url = URL.createObjectURL(localImage);
      setImageUrl(url);
    } else if (image) {
      if (typeof image === 'string' && image.startsWith('blob:')) {
        setImageUrl(image);
      } else {
        setImageUrl(getImageUrl(image));
      }
    } else {
      setImageUrl(null);
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [image, localImage]);

  if (imageUrl && !imgError) {
    return (
      <Avatar
        ref={ref}
        src={imageUrl}
        alt={alt}
        sx={{ width: size, height: size, fontSize: size * 0.5, ...sx }}
        onError={() => setImgError(true)}
        {...restProps}
      />
    );
  }

  const getInitials = () => {
    if (type === 'user') {
      const firstInitial = firstName.trim()[0]?.toUpperCase() || '';
      const lastInitial = lastName.trim()[0]?.toUpperCase() || '';
      if (firstInitial && lastInitial) {
        return firstInitial + lastInitial;
      }
      if (firstInitial) return firstInitial;
      return 'U';
    }

    if (type === 'project') {
      if (fallbackText && typeof fallbackText === 'string' && fallbackText.length > 0) {
        return fallbackText.trim()[0].toUpperCase();
      }
      return 'P';
    }

    return '?';
  };

  return (
    <Avatar
      ref={ref}
      sx={{ width: size, height: size, bgcolor: "#455a64", fontSize: size * 0.5, ...sx }}
      {...restProps}
    >
      {getInitials()}
    </Avatar>
  );
});

export default RenderAvatar;

