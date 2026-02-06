import { upload } from "../middlewares/uploads.js";

export const uploadSingleFile = (req, res, next) => {
  upload.array('file')(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};
