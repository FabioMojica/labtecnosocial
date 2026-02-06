import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  // filename: function (req, file, cb) {
  //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //   cb(null, uniqueSuffix + '-' + file.originalname);
  // }
  filename: function (req, file, cb) {
    const ext =
      file.mimetype === 'image/webp' ? '.webp' :
        file.mimetype === 'image/png' ? '.png' :
          '.jpg';

    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  }

});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});
