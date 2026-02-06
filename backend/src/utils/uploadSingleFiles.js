import { upload } from "../middlewares/uploads.js";

// export const uploadSingleFile = (req, res, next) => {
//   upload.single('file')(req, res, (err) => {
//     if (err) {
//       return next(err);
//     }
//     next();
//   });
// };
export const uploadSingleFile = (req, res, next) => {
  upload.array('file')(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};
