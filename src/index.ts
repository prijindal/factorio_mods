import fs from "fs";
import archiver from "archiver";
import path from "path";
import Yargs from "yargs";

const archiveFolder = (sourceDir: string, outPath: string) => {
  console.log(sourceDir, outPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outPath);

  return new Promise<void>((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
};

const argv = Yargs(process.argv.slice(2))
  .help()
  .command(
    "upload",
    "Create an archive and upload to mods.factorio.com",
    async () => {
      console.log(process.cwd());
      const MODS_FOLDER = path.join(process.cwd(), "mods");
      const ARCHIVED_PATH = path.join(process.cwd(), "archived");
      const mods = fs.readdirSync(MODS_FOLDER);
      if (!fs.existsSync(ARCHIVED_PATH)) {
        fs.mkdirSync(ARCHIVED_PATH);
      }
      console.log(mods);
      for (const mod of mods) {
        await archiveFolder(
          path.join(MODS_FOLDER, mod),
          path.join(ARCHIVED_PATH, `${mod}.zip`)
        );
      }
    }
  )
  .strict().argv;
