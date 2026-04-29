import { upload } from "../middlewares/uploads.js";

export const uploadAnyFiles = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};
