import { upload } from "../middlewares/uploads.js";

export const uploadSingleFile = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.log(err)
      return next(err);
    }
    next();
  });
};
