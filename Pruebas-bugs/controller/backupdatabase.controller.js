import registerAction from "../middlewares/binnacle.js";
import { exec } from "child_process";
import fs from "fs";
import archiver from "archiver";
import path from "path";

const backupdatabaseCtrl = {};

//craer un backup de la base de datos
async function createBackupDb() {
  try {
    const date = new Date();
    const dateFormated = `${date.getFullYear()}-${
      date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1
    }-${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}`;

    const backupFolderPath = `./backup/${dateFormated}`;

    if (!fs.existsSync("./backup")) {
      fs.mkdirSync("./backup");
    }

    const command = `mongodump --uri ${process.env.COPY_DB} --out ${backupFolderPath}`;

    try {
      const { stdout, stderr } = await exec(command);
      console.log("Backup successful:");
      return true;
    } catch (err) {
      console.error("Error during backup:", err);
      return false;
    }
  } catch (err) {
    return false;
  }
}

//aliminar las copias de seguridad antiguas de más de 90 días
async function deleteOldBackup() {
  const backupFolder = "./backup";

  try {
    const folders = fs.readdirSync(backupFolder);
    const date = new Date();

    folders.forEach((folder) => {
      const folderDate = folder.split("-");
      const folderDateFormated = `${folderDate[0]}-${folderDate[1]}-${folderDate[2]}`;
      const dateFolder = new Date(folderDateFormated);
      const diffTime = Math.abs(date.getTime() - dateFolder.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 90) {
        fs.rmdirSync(`${backupFolder}/${folder}`, { recursive: true });
      }
    });
  } catch (err) {
    console.log(err);
  }
}

backupdatabaseCtrl.backupDatabase = async (req, res) => {
  try {
    await registerAction("DATABASE",{event: "COPIA DE LA BASE DE DATOS"}, req.headers.token);
    const result = await createBackupDb();

    if (!result) {
      return res.status(500).json({
        msg: "Error al crear el backup",
      });
    } else {
      return res.status(200).json({
        msg: "Backup creado correctamente",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      msg: "Error al crear el backup",
    });
  }
};

//listar las carpetas de backup disponibles
backupdatabaseCtrl.listBackup = async (req, res) => {
  try {
    await registerAction("DATABASE",{event: "LISTAR COPIAS DE SEGURIDAD"}, req.headers.token);
    const backupFolder = "./backup";
    const folders = fs.readdirSync(backupFolder);
    return res.status(200).json({
      msg: "Listado de backups",
      folders,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      msg: "Error al listar los backups",
    });
  }
};

//descargar un backup
backupdatabaseCtrl.downloadBackup = async (req, res) => {
  const { folder } = req.query;
  try {
    await registerAction("DATABASE",{event: "DESCARGAR COPIA DE SEGURIDAD"}, req.headers.token);
    //validar que exista la carpeta
    const backupFolder = "./backup";
    const folders = fs.readdirSync(backupFolder);
    if (!folders.includes(folder)) {
      return res.status(404).json({
        msg: "No existe la carpeta de backup",
      });
    }

    //crear el archivo zip
    const zipFilePath = `./backup/${folder}.zip`;
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      throw new Error(err);
    });

    output.on("close", async () => {
      console.log(archive.pointer() + " total bytes");
      console.log(
        "Se ha creado el archivo zip correctamente en la ruta: " + zipFilePath
      );
      res.download(zipFilePath, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Se ha descargado el archivo zip correctamente");
          //eliminar el archivo zip
          fs.unlinkSync(zipFilePath);
        }
      });
    });

    archive.pipe(output); // para que se guarde en el archivo zip
    archive.directory(`${backupFolder}/${folder}`, false); // para que se guarde en el archivo zip
    await archive.finalize(); // para que se guarde en el archivo zip

    const __dirname = path.resolve();
    const filePath = path.join(__dirname, "backup", `${folder}.zip`);
    console.log(filePath);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      msg: "Error al descargar el backup",
    });
  }
};

//restaurar un backup
backupdatabaseCtrl.restoreBackup = async (req, res) => {
  const { folder } = req.query;

  try {
    await registerAction("DATABASE",{event: "RESTAURAR COPIA DE SEGURIDAD"}, req.headers.token);
    //validar que exista la carpeta
    const backupFolder = "./backup";
    const folders = fs.readdirSync(backupFolder);
    if (!folders.includes(folder)) {
      return res.status(404).json({
        msg: "No existe la carpeta de backup",
      });
    }

    const command = `mongorestore --uri ${process.env.COPY_DB} --nsInclude=Horarios_SENA.* --drop ${backupFolder}/${folder}`;

    try {
      const { stdout, stderr } = await exec(command);
      return res.status(200).json({
        msg: "Backup restaurado correctamente",
      });
    } catch (err) {
      console.error("Error during restore:", err);
      return res.status(500).json({
        msg: "Error al restaurar el backup",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      msg: "Error al restaurar el backup",
    });
  }
};

export { backupdatabaseCtrl, createBackupDb, deleteOldBackup };
