import { Router } from "express";
import { backupdatabaseCtrl } from "../controller/backupdatabase.controller.js";
import { backupdatabasVali } from "../validations/backupdatabase.validation.js";

/**
 * Controller functions containing validation functions for backupdatabase registration, existence, update, and headers.
 * @typedef {Object} backupdatabaseCtrl
 * @property {Function} backupDatabase - backups of database.
 * @property {Function} listBackup - list of backup.
 * @property {Function} downloadBackup - download of backup.
 * @property {Function} restoreBackup - restore of backup.
 */
const { backupDatabase, listBackup, downloadBackup, restoreBackup } =
  backupdatabaseCtrl;
const { validateToken } = backupdatabasVali;

const routerBackupDatabase = Router();

routerBackupDatabase.get("/", validateToken, backupDatabase);
routerBackupDatabase.get("/listbackup", validateToken, listBackup);
routerBackupDatabase.get("/downloadbackup", validateToken, downloadBackup);
// routerBackupDatabase.get("/restorebackup",validateToken, restoreBackup);

export { routerBackupDatabase };
