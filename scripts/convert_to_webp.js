const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directory containing public assets
const publicDir = path.resolve(__dirname, '../public');

// Supported image extensions
const exts = ['.jpg', '.jpeg', '.png'];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (exts.includes(path.extname(entry.name).toLowerCase())) {
      const webpPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      if (!fs.existsSync(webpPath)) {
        sharp(fullPath)
          .webp({ quality: 80 })
          .toFile(webpPath)
          .then(() => console.log(`Created ${webpPath}`))
          .catch(err => console.error(`Error converting ${fullPath}:`, err));
      }
    }
  }
}

walk(publicDir);
