import mongoose from "mongoose";
import * as dotenv from "dotenv";

import Schedule from "../models/Schedule.js";

dotenv.config();

const mongoUri = process.env.MONGO_URL || "mongodb://localhost:27017/adso076";

const buildCalificadoBootstrap = () => ({
  $or: [
    { calificado: { $exists: false } },
    { calificado: null },
    { calificado: { $nin: [true, false] } },
  ],
});

const run = async () => {
  await mongoose.connect(mongoUri);
  console.log(`Conectado a MongoDB en ${mongoUri}`);

  const filter = buildCalificadoBootstrap();
  const updateResult = await Schedule.updateMany(filter, {
    $set: { calificado: false },
  });

  console.log(
    `Documentos actualizados con calificado=false: ${updateResult.modifiedCount}`
  );

  const [total, pendientes, calificados] = await Promise.all([
    Schedule.countDocuments(),
    Schedule.countDocuments({ calificado: false }),
    Schedule.countDocuments({ calificado: true }),
  ]);

  console.log(`Total de horarios: ${total}`);
  console.log(`Horarios pendientes de calificar: ${pendientes}`);
  console.log(`Horarios calificados: ${calificados}`);

  const muestra = await Schedule.aggregate([
    { $match: { calificado: false } },
    { $limit: 5 },
    {
      $lookup: {
        from: "fiches",
        localField: "fiche",
        foreignField: "_id",
        as: "fiche",
      },
    },
    {
      $unwind: {
        path: "$fiche",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "programs",
        localField: "fiche.program",
        foreignField: "_id",
        as: "program",
      },
    },
    {
      $unwind: {
        path: "$program",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        scheduleId: "$_id",
        ficheNumber: "$fiche.number",
        programName: {
          $ifNull: [
            "$program.name",
            {
              $ifNull: ["$fiche.programName", "$fiche.program_name"],
            },
          ],
        },
      },
    },
  ]);

  const ejemplos = muestra.map((item) => {
    const nombrePrograma = item.programName || "Programa sin nombre";
    const numeroFicha = item.ficheNumber || null;

    if (numeroFicha) {
      return `${nombrePrograma} ficha: ${numeroFicha}`;
    }

    const horarioId = item.scheduleId ? item.scheduleId.toString() : "desconocido";
    return `${nombrePrograma} (horario: ${horarioId})`;
  });

  console.log(
    `Horarios sin calificar tras la migración (máximo 5):`,
    ejemplos
  );
};

run()
  .then(async () => {
    await mongoose.disconnect();
    console.log("Migración finalizada correctamente.");
  })
  .catch(async (error) => {
    console.error(
      "Error al ejecutar la migración de inicialización de calificado:",
      error
    );
    process.exitCode = 1;
    await mongoose.disconnect();
  });