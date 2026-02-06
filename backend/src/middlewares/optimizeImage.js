import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export const optimizeImage = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    for (const file of req.files) {
      const inputPath = file.path;
      const ext = path.extname(file.filename).toLowerCase();

      if (file.mimetype === 'image/webp') {
        file.optimizedPath = `/uploads/${file.filename}`;
        continue;
      }

      const baseName = path.basename(file.filename, ext);
      const outputFileName = baseName + '.webp';
      const outputPath = path.join(process.cwd(), 'uploads', outputFileName);

      await sharp(inputPath)
        .resize(800)
        .webp({ quality: 80 })
        .toFile(outputPath);

      fs.unlinkSync(inputPath);

      file.optimizedPath = `/uploads/${outputFileName}`;
    }

    next();
  } catch (err) {
    console.error("error al optimizar", err);
    next(err);
  }
};
