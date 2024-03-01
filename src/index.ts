import fs from "fs";
import archiver from "archiver";
import path from "path";
import Yargs from "yargs";

const archiveFolder = (
  sourceDir: string,
  mod_name: string,
  outPath: string
) => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outPath);

  return new Promise<void>((resolve, reject) => {
    archive
      .directory(sourceDir, mod_name)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
};

const MODS_FOLDER = path.join(process.cwd(), "mods");
const ARCHIVED_PATH = path.join(process.cwd(), "archived");

const argv = Yargs(process.argv.slice(2))
  .help()
  .command("archive", "Create an archive", async () => {
    const mods = fs.readdirSync(MODS_FOLDER);
    if (!fs.existsSync(ARCHIVED_PATH)) {
      fs.mkdirSync(ARCHIVED_PATH);
    }
    for (const mod of mods) {
      const archivePath = path.join(ARCHIVED_PATH, `${mod}.zip`);
      await archiveFolder(path.join(MODS_FOLDER, mod), mod, archivePath);
      console.log(archivePath);
    }
  })
  .strict().argv;
