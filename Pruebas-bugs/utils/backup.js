import cron from 'node-cron';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const mongoUrl = process.env.MONGO_URL;
const backupPath = "/var/backups/mongo"; // Ruta segura para guardar los respaldos
const retentionDays = 7; // Número de días que se retendrán los respaldos

const command = `mongodump --uri="${mongoUrl}" --out=${backupPath}/$(date +\\%Y-\\%m-\\%d) > /var/log/mongodump.log 2>&1`;

// Función para eliminar respaldos antiguos
function deleteOldBackups() {
    const now = new Date().getTime();
    fs.readdir(backupPath, (err, files) => {
        if (err) {
            console.error(`Error leyendo el directorio de respaldos: ${err.message}`);
            return;
        }
        files.forEach(file => {
            const filePath = path.join(backupPath, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`Error obteniendo información del archivo: ${err.message}`);
                    return;
                }
                const backupAge = (now - new Date(stats.mtime).getTime()) / (1000 * 60 * 60 * 24); // Edad en días
                if (backupAge > retentionDays) {
                    fs.rm(filePath, { recursive: true, force: true }, (err) => {
                        if (err) {
                            console.error(`Error eliminando el respaldo antiguo: ${err.message}`);
                        } else {
                            console.log(`Respaldo eliminado: ${filePath}`);
                        }
                    });
                }
            });
        });
    });
}

// Función para crear el directorio de respaldo si no existe
function createBackupDirectory() {
    if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
        fs.chownSync(backupPath, process.getuid(), process.getgid()); // Configurar permisos
        console.log(`Directorio de respaldo creado en: ${backupPath}`);
    }
}

// Programar la tarea para que se ejecute diariamente a la medianoche
cron.schedule('0 0 * * *', () => {
    createBackupDirectory();
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al realizar el respaldo: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
        }
        console.log(`Respaldo realizado correctamente: ${stdout}`);
        deleteOldBackups();
    });
});

export { deleteOldBackups, command };
