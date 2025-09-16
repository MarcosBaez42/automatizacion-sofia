import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import * as cron from "node-cron";
import axios from "axios";
import dbConnection from "./database.js";
import morgan from "morgan";
import fileUpload from "express-fileupload";

import {
  createBackupDb,
  deleteOldBackup,
} from "./controller/backupdatabase.controller.js";
import { deleteOldBinnacle } from "./controller/binnacle.controller.js";

import { routerUsers } from "./routes/users.routes.js";
import { routerInstructor } from "./routes/instructor.routes.js";
import { routerProgram } from "./routes/programs.routes.js";
import { routerCompetence } from "./routes/competences.routes.js";
import { routerEnvironment } from "./routes/environments.routes.js";
import { routerFiche } from "./routes/fiche.routes.js";
import { routerOutcome } from "./routes/outcomes.routes.js";
import { routerSchedule } from "./routes/schedules.routes.js";
import { routerReports } from "./routes/reports.routes.js";
import { routerTowns } from "./routes/towns.routes.js";
import { routerCoordination } from "./routes/coordinations.routes.js";
import { routerOtherSchedule } from "./routes/otherschedules.routes.js";
import { routerUploads } from "./routes/uploadfiles.routes.js";
import { routerBackupDatabase } from "./routes/backupdatabase.routes.js";
import { routerBinnacle } from "./routes/binnacle.routes.js";
import { routerNew } from "./routes/new.routes.js";
import { routerReportNew } from "./routes/reportnews.routes.js";

dotenv.config();

/**
 * Represents a server.
 * @class
 */
class Server {
  /**
   * Creates an instance of Server.
   * @constructor
   */
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.middlewares();
    this.routes();
    this.conexionBd();
    // this.interval();
    this.cronDatabaseBackup();
    this.deleteOldBackups();
  }

  /**
   * Adds middlewares to the server.
   */
  middlewares() {
    this.app.use(express.json());
    this.app.use(
      cors({
        handlePreflightRequest: (req, res) => {
          const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true,
          };
          res.writeHead(200, headers);
          res.end();
        },
      })
    );
    this.app.use(morgan("dev"));
    this.app.use(express.static("public"));
    this.app.use(
      fileUpload({
        createParentPath: true,
        useTempFiles: true,
      })
    );
  }

  /**
   * Adds routes to the server.
   */
  routes() {
    this.app.use("/api/users", routerUsers);
    this.app.use("/api/instructors", routerInstructor);
    this.app.use("/api/programs", routerProgram);
    this.app.use("/api/competences", routerCompetence);
    this.app.use("/api/environments", routerEnvironment);
    this.app.use("/api/fiches", routerFiche);
    this.app.use("/api/outcomes", routerOutcome);
    this.app.use("/api/schedules", routerSchedule);
    this.app.use("/api/reports", routerReports);
    this.app.use("/api/towns", routerTowns);
    this.app.use("/api/coordinations", routerCoordination);
    this.app.use("/api/othersschedules", routerOtherSchedule);
    this.app.use("/api/uploads", routerUploads);
    this.app.use("/api/backupdatabase", routerBackupDatabase);
    this.app.use("/api/binnacle", routerBinnacle); 
    this.app.use("/api/news", routerNew);
    this.app.use("/api/reportnew", routerReportNew);
    this.app.use("/life", (req, res) => {
      res.send("life server");
    });
    this.app.use("*", (req, res) => {
      res.status(404).json({
        msg: "Page not found",
      });
    });
  }

  /**
   * Establishes a connection to the database.
   */
  async conexionBd() {
    await dbConnection();
  }

  /**
   * Sets an interval to execute a request to the server every 25 minutes.
   */
  // async interval() {
  //   if (process.env.URL_SERVER) {
  //     //ejecutar una petición http cada 25 minutos mientras la hora sea mayor a las 5:00 am y menor a las 11:00 pm hora colombiana,
  //     //teniendo en cuenta que heroku tiene la hora de estados unidos
  //     setInterval(async () => {
  //       const date = new Date();
  //       const hour = date.getUTCHours() - 5; //restar 5 horas para que quede en hora colombiana

  //       if (hour >= 5 && hour <= 23) {
  //         try {
  //           //peticion get a la ruta /life del servidor
  //           await axios.get(`${process.env.URL_SERVER}/life`);
  //         } catch (err) {}
  //       }
  //     }, 1500000); //1500000 milisegundos = 25 minutos
  //   }
  // }

  /**
   * Sets a cron job to create a database backup every 5 days.
   */
  async cronDatabaseBackup() {
    //ejectuar el cron cada 5 días a la 3:00 am hora del servidor
    cron.schedule("0 3 */5 * *", async () => {
      const result = await createBackupDb();

      if (!result) {
        console.log("Error al crear el backup");
      } else {
        console.log("Backup creado correctamente");
      }
    });
  }

  /**
   * Sets a cron job to delete old backups every 30 days.
   */
  async deleteOldBackups() {
    //ejecutar cada 3 meses a la 1:00 am hora del servidor
    cron.schedule("0 1 1 */3 *", async () => {
      try {
        await deleteOldBackup();
        await deleteOldBinnacle();
      } catch (err) {
        console.log(err);
      }
    });
  }

  /**
   * Starts the server.
   */
  listen() {
    this.app.listen(this.port, () => {
      console.log(`Example app listening on port ${this.port}!`);
    });
  }
}

export default Server;
