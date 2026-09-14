import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "products-source.png");
const OUT_DIR = path.join(__dirname, "..", "public", "products");

const COL_BOUNDS = [0, 305, 614, 923, 1232, 1536];
const ROW_BOUNDS = [0, 508, 1024];
const INSET = 4; // trim a few px off each edge to drop the white gutter border

const GRID = [
  ["nanas-strawberry", "nanas-wortel", "strawberry-wortel", "jeruk-wortel", "jambu-merah"],
  ["mangga", "lemon-cia-seed", "jeruk-cia-seed", "terong-belanda", "sirsak"],
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (let row = 0; row < GRID.length; row++) {
    for (let col = 0; col < GRID[row].length; col++) {
      const slug = GRID[row][col];
      const left = COL_BOUNDS[col] + INSET;
      const right = COL_BOUNDS[col + 1] - INSET;
      const top = ROW_BOUNDS[row] + INSET;
      const bottom = ROW_BOUNDS[row + 1] - INSET;
      const width = right - left;
      const height = bottom - top;

      const outPath = path.join(OUT_DIR, `${slug}.jpg`);
      await sharp(SRC)
        .extract({ left, top, width, height })
        .jpeg({ quality: 92, mozjpeg: true })
        .toFile(outPath);

      console.log(`${slug}: ${width}x${height} -> ${outPath}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
