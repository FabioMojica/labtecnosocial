import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  const inputPath = req.file.path;
  const ext = path.extname(req.file.filename);
  const baseName = path.basename(req.file.filename, ext);
  const outputFileName = baseName + '.webp';
  const outputPath = path.join(process.cwd(), 'uploads', outputFileName);

  try {
    await sharp(inputPath)
      .resize(800) 
      .webp({ quality: 80 }) 
      .toFile(outputPath);

    fs.unlinkSync(inputPath);

    req.file.optimizedPath = `/uploads/${outputFileName}`;

    next();
  } catch (err) {
    console.log("error al optimizar", err)
    next(err);
  }
};
