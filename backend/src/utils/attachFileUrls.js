export const attachFileUrls = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (data) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');

    const buildUrl = (value) => {
      if (!value) return value;

      if (typeof value === 'string' && value.startsWith('/uploads/')) {
        return `${protocol}://${host}/api${value}`;
      }

      return value; 
    };

    const walk = (obj) => {
      if (Array.isArray(obj)) return obj.map(walk);

      if (obj instanceof Date) return obj.toISOString();

      if (obj && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => {
            if (key === 'image_url') {
              return [key, buildUrl(value)];
            }
            return [key, walk(value)];
          })
        );
      }

      return obj;
    };

    return originalJson(walk(data));
  };

  next();
};
