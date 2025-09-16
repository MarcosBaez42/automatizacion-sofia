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

  const muestra = await Schedule.find({ calificado: false })
    .select({ _id: 1, fiche: 1 })
    .limit(5);
  console.log(
    `Ejemplo de horarios sin calificar tras la migración (máximo 5):`,
    muestra.map((schedule) => schedule._id.toString())
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