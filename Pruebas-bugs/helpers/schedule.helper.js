/**
 * This file contains helper functions for schedules.
 * @fileoverview
 * @module scheduleHelper
 * @requires Schedule
 * @requires Fiche
 * @requires Program
 * @requires Competence
 * @requires Outcome
 * @requires Instructor
 * @requires Environment
 */
import { dateFormater } from "../utils/functions/dates.js";
import Schedule from "../models/Schedule.js";
import Fiche from "../models/Fiche.js";

/**
 * Helper object for schedules.
 */

const scheduleHelper = {};

/**
 * Validates if a schedule exists by ID.
 * @param {string} id - The ID of the schedule to validate.
 * @throws {Error} If the schedule does not exist.
 */
scheduleHelper.validateExistScheduleById = async (id) => {
  try {
    const schedule = await Schedule.findById(id, { status: 0 });
    if (!schedule) {
      throw new Error();
    }
  } catch (error) {
    throw new Error("El horario no existe");
  }
};

scheduleHelper.validateScheduleInstructor = async (
  program,
  fiche,
  instructor,
  environment,
  fstart,
  fend,
  tstart,
  tend,
  days,
  req
) => {
  let fiches = [];
  let dates = [];
  let datesEnvironment = [];
  let fichesEnvironment = [];
  let schedulesEnvironment = [];
  let schedules = [];
  let schedules2 = [];

  req.validation = {
    errorSchedule: "",
    errorEnvirontment: "",
  };

  try {
    const currentDate = new Date();
    const tStartToDateClient = dateFormater(currentDate, tstart);
    const tEndToDateClient = dateFormater(currentDate, tend);

    const fstartShe = dateFormater(fstart);
    const fendShe = dateFormater(fend);

    //buscar la ficha
    const searchFiche = await Fiche.findById(fiche);

    if (searchFiche.fstart == null || searchFiche.fend == null) {
      const error = new TypeError(
        `La ficha no tiene fechas de etapa lectiva, por favor actualice la ficha`
      );
      error.type = "TypeErrorDatesFiche";
      throw error;
    }


    //validar que los fechas que se intentan programar esten dentro del rango de fechas de la etapa lectiva de la ficha
    if (
      dateFormater(searchFiche.fstart) > fstartShe ||
      dateFormater(searchFiche.fend) < fendShe
    ) {
      console.log(searchFiche.fstart, fstartShe);
      console.log(searchFiche.fend, fendShe);

      const error = new TypeError(
        `Las fechas deben estar dentro del rango de fechas de la etapa lectiva de la ficha ( ${searchFiche.fstart.toISOString().split("T")[0]
        } // ${searchFiche.fend.toISOString().split("T")[0]} )`
      );
      error.type = "TypeErrorDates";
      throw error;
    }

    // Validar si el ambiente que se intenta programar ya está en uso
    if (program) {
      schedulesEnvironment = await Schedule.find({
        environment,
        status: 0,
        fiche: { $ne: fiche },
        _id: { $ne: program },
      }).populate("environment fiche");
    } else {
      schedulesEnvironment = await Schedule.find({
        environment,
        fiche: { $ne: fiche },
        status: 0,
      }).populate("environment fiche");
    }

    for (const schedule of schedulesEnvironment) {
      const tStartToDate = dateFormater(currentDate, schedule.tstart);
      const tEndToDate = dateFormater(currentDate, schedule.tend);

      if (
        schedule.fstart <= fendShe &&
        schedule.fend >= fstartShe &&
        tStartToDate <= tEndToDateClient &&
        tEndToDate >= tStartToDateClient
      ) {
        for (const event of schedule.events) {
          if (event >= fstartShe && event <= fendShe) {
            let getDay = event.getUTCDay();
            if (days.includes(getDay)) {
              if (
                !datesEnvironment.includes(event.toISOString().split("T")[0])
              ) {
                datesEnvironment.push(event.toISOString().split("T")[0]);
              }
              if (!fichesEnvironment.includes(schedule.fiche.number)) {
                fichesEnvironment.push(schedule.fiche.number);
              }
            }
          }
        }
      }
    }

    // Validar la programación del instructor

    if (program) {
      schedules = await Schedule.find({
        fiche,
        instructor,
        status: 0,
        _id: { $ne: program },
      }).populate("fiche instructor");
    } else {
      schedules = await Schedule.find({
        fiche,
        instructor,
        status: 0,
      }).populate("fiche instructor");
    }

    for (const schedule of schedules) {
      if (schedule.fstart <= fendShe && schedule.fend >= fstartShe) {
        for (const event of schedule.events) {
          if (event >= fstartShe && event <= fendShe) {
            let getDay = event.getUTCDay();
            if (days.includes(getDay)) {
              if (!fiches.includes(schedule.fiche.number)) {
                fiches.push(schedule.fiche.number);
              }
              if (!dates.includes(event.toISOString().split("T")[0])) {
                dates.push(event.toISOString().split("T")[0]);
              }
            }
          }
        }
      }
    }

    // Validar la programación de otras fichas
    if (program) {
      schedules2 = await Schedule.find({
        instructor,
        status: 0,
        _id: { $ne: program },
        fiche: { $ne: fiche },
      }).populate("fiche instructor");
    } else {
      schedules2 = await Schedule.find({
        instructor,
        status: 0,
      }).populate("fiche instructor");
    }

    for (const schedule of schedules2) {
      const tStartToDate = dateFormater(currentDate, schedule.tstart);
      const tEndToDate = dateFormater(currentDate, schedule.tend);

      if (
        schedule.fstart <= fendShe &&
        schedule.fend >= fstartShe &&
        tStartToDate <= tEndToDateClient &&
        tEndToDate >= tStartToDateClient
      ) {
        for (const event of schedule.events) {
          if (event >= fstartShe && event <= fendShe) {
            let getDay = event.getUTCDay();
            if (days.includes(getDay)) {
              if (!fiches.includes(schedule.fiche.number)) {
                fiches.push(schedule.fiche.number);
              }
              if (!dates.includes(event.toISOString().split("T")[0])) {
                dates.push(event.toISOString().split("T")[0]);
              }
            }
          }
        }
      }
    }

    if (dates.length > 0 || fiches.length > 0) {
      fiches = fiches.join(", ");
      dates = dates.join(", ");

      req.validation.errorSchedule = `El instructor tiene programación en las fechas: ${dates} y en las fichas: ${fiches} tenga en cuenta esto para la programación`;
    }
    if (datesEnvironment.length > 0 || fichesEnvironment.length > 0) {
      fichesEnvironment = fichesEnvironment.join(", ");
      datesEnvironment = datesEnvironment.join(", ");

      req.validation.errorEnvirontment = `El ambiente está programado en las fechas: ${datesEnvironment} y en las fichas: ${fichesEnvironment}`;
    }
  } catch (error) {
    console.log(error);
    // Manejo de errores
    if (error.type == "TypeErrorDates") {
      throw error;
    } else if (error.type == "TypeErrorDatesFiche") {
      throw error;
    } else {
      throw new Error(
        "Error al validar la programación, revise los datos e intente de nuevo"
      );
    }
  }
};

//validar cuando se intente registrar un horario
scheduleHelper.validateSaveSchedule = async (
  program,
  fiche,
  instructor,
  environment,
  fstart,
  fend,
  tstart,
  tend,
  events
) => {
  let existError = "";
  let newListOfEvents = [];
  let schedules = [];
  let schedules2 = [];
  let schedulesEnvironment = [];

  try {
    const currentDate = new Date();
    const fstartShe = dateFormater(fstart);
    const fendShe = dateFormater(fend);

    const tStartToDateClient = dateFormater(currentDate, tstart);
    const tEndToDateClient = dateFormater(currentDate, tend);

    //extraer solo la start de cada evento y validar que idInstructor sea igual a instructor
    events.forEach((event) => {
      if (event.idInstructor == instructor && event.autogenerated == true) {
        if (event.start != null || event.start != undefined) {
          newListOfEvents.push(event.start);
        }
      }
    });

    //buscar la ficha
    console.log(fiche)
    const searchFiche = await Fiche.findById(fiche);
    console.log("search fiche" + searchFiche)

    //validar que los fechas que se intentan programar esten dentro del rango de fechas de la etapa lectiva de la ficha
    if (
      dateFormater(searchFiche.fstart) > fstartShe ||
      dateFormater(searchFiche.fend) < fendShe
    ) {
      console.log(searchFiche.fstart, fstartShe);
      console.log(searchFiche.fend, fendShe);

      existError = `Las fechas deben estar dentro del rango de fechas de la etapa lectiva de la ficha ( ${searchFiche.fstart.toISOString().split("T")[0]
        } // ${searchFiche.fend.toISOString().split("T")[0]} )`;

      throw new Error(existError);
    }

    //validar si el ambiente que se intenta programar ya está en uso
    if (program) {
      schedulesEnvironment = await Schedule.find({
        environment,
        status: 0,
        fiche: { $ne: fiche },
        _id: { $ne: program },
      }).populate("environment fiche");
    } else {
      schedulesEnvironment = await Schedule.find({
        environment,
        fiche: { $ne: fiche },
        status: 0,
      }).populate("environment fiche");
    }

    for (const schedule of schedulesEnvironment) {
      const tStartToDate = dateFormater(currentDate, schedule.tstart);
      const tEndToDate = dateFormater(currentDate, schedule.tend);

      //validar si el ambiente que se intenta programar ya está en uso dentro de las fechas de la programacion y dentro de las mismas horas
      if (
        schedule.fstart <= fendShe &&
        schedule.fend >= fstartShe &&
        tStartToDate <= tEndToDateClient &&
        tEndToDate >= tStartToDateClient
      ) {
        for (const event of schedule.events) {
          //si el evento es igual o mayor a la fecha de inicio y menor o igual a la fecha de fin validar que este el día no este dentro dentro del array de days
          if (event >= fstartShe && event <= fendShe) {
            let eventFormat = event.toISOString().split("T")[0]; //2023-07-10
            if (newListOfEvents.includes(eventFormat)) {
              existError = `El ambiente ya está programado en la fecha: ${eventFormat}, en la ficha: ${schedule.fiche.number}`;
              break;
            }
          }
        }
      }
      if (existError) throw new Error(existError);
    }

    if (program) {
      schedules = await Schedule.find({
        fiche,
        instructor,
        status: 0,
        _id: { $ne: program },
      }).populate("fiche instructor");
    } else {
      schedules = await Schedule.find({
        fiche,
        instructor,
        status: 0,
      }).populate("fiche instructor");
    }
    //validar que ni fstart y fend esten dentro de las fechas de la programacion

    for (const schedule of schedules) {
      // ---------- validar que un instructor no tenga programacion en las mismas fechas de las misma ficha
      if (schedule.fstart <= fendShe && schedule.fend >= fstartShe) {
        for (const event of schedule.events) {
          //si el evento es igual o mayor a la fecha de inicio y menor o igual a la fecha de fin validar que este el día no este dentro dentro del array de days
          if (event >= fstartShe && event <= fendShe) {
            let eventFormat = event.toISOString().split("T")[0]; //2023-07-10
            if (newListOfEvents.includes(eventFormat)) {
              existError = `El instructor ya está programado en la fecha:${eventFormat} en la misma ficha`;
              break;
            }
          }
        }
      }
      if (existError) throw new Error(existError);
    }

    //buscar todas las programaciones que sean mayores a fstart y menores a fend con el mismo instructor

    if (program) {
      schedules2 = await Schedule.find({
        instructor,
        status: 0,
        _id: { $ne: program },
        fiche: { $ne: fiche },
      }).populate("fiche instructor");
    } else {
      schedules2 = await Schedule.find({
        instructor,
        status: 0,
      }).populate("fiche instructor");
    }

    //validar que el instructor no tenga programacion en otra ficha en las mismas horas

    for (const schedule of schedules2) {
      const tStartToDate = dateFormater(currentDate, schedule.tstart);
      const tEndToDate = dateFormater(currentDate, schedule.tend);
      //validar que el instructor no tenga programacion en otra ficha en las mismas horas, dentro de las fechas de la programacion

      if (
        schedule.fstart <= fendShe &&
        schedule.fend >= fstartShe &&
        tStartToDate <= tEndToDateClient &&
        tEndToDate >= tStartToDateClient
      ) {
        for (const event of schedule.events) {
          //si el evento es igual o mayor a la fecha de inicio y menor o igual a la fecha de fin validar que este el día no este dentro dentro del array de days
          if (event >= fstartShe && event <= fendShe) {
            let eventFormat = event.toISOString().split("T")[0];
            if (newListOfEvents.includes(eventFormat)) {
              existError = `El instructor ya está programado en la fecha: ${eventFormat}, en la ficha: ${schedule.fiche.number}`;
              break;
            }
          }
        }
      }

      if (existError) throw new Error(existError);
    }
  } catch (error) {
    console.log(error)
    if (existError) throw new Error(existError);
    else
      throw new Error(
        "Error al validar la programación, revise los datos e intente de nuevo"
      );
  }
};
scheduleHelper.validateActiveSchedule = async (id) => {
  console.log(id);
  let existError = "";
  try {
    const currentDate = new Date();
    const searchSchedule = await Schedule.findById(id);
    const tStartToDateClient = dateFormater(currentDate, searchSchedule.tstart);
    const tEndToDateClient = dateFormater(currentDate, searchSchedule.tend);


    //validar si el ambiente que se intenta programar ya está en uso
    const schedulesEnvironment = await Schedule.find({
      environment: searchSchedule.environment,
      fiche: { $ne: searchSchedule.fiche },
      status: 0,
      _id: { $ne: id },
    }).populate("environment fiche");
    console.log("1");
    for (const schedule of schedulesEnvironment) {
      const tStartToDate = dateFormater(currentDate, schedule.tstart);
      const tEndToDate = dateFormater(currentDate, schedule.tend);

      //validar si el ambiente que se intenta programar ya está en uso dentro de las fechas de la programacion y dentro de las mismas horas
      if (
        schedule.fstart <= searchSchedule.fend &&
        schedule.fend >= searchSchedule.fstart &&
        tStartToDate <= tEndToDateClient &&
        tEndToDate >= tStartToDateClient
      ) {
        for (const event of schedule.events) {
          //si el evento es igual o mayor a la fecha de inicio y menor o igual a la fecha de fin validar que este el día no este dentro dentro del array de days
          

          // if (event >= fstartShe && event <= fendShe) {
            let eventFormat = event.toISOString().split("T")[0];
            if (searchSchedule.events.includes(eventFormat)) {
              existError = `El instructor ya está programado en la fecha: ${eventFormat}, en la ficha: ${schedule.fiche.number}`;
              break;
            }
          // }
        }
      }

      if (existError) throw new Error(existError);
    }
    console.log("2");
    if (searchSchedule.status == 1) {
      //buscar si hay programaciones activas con la misma ficha e instructor sin contar la programacion que se esta editando
      const schedules = await Schedule.find({
        fiche: searchSchedule.fiche,
        instructor: searchSchedule.instructor,
        status: 0,
        _id: { $ne: id },
      }).populate("fiche");

      for (const schedule of schedules) {
        if (
          schedule.fstart <= searchSchedule.fend &&
          schedule.fend >= searchSchedule.fstart
        ) {
          for (const event of schedule.events) {
            if (
              event >= searchSchedule.fstart &&
              event <= searchSchedule.fend
            ) {
              if (searchSchedule.events.includes(event)) {
                existError = `El instructor ya tiene programación activa en la fecha: ${event.toISOString().split("T")[0]
                  } en la ficha: ${schedule.fiche.number}`;
                break;
              }
            }
          };
        }
        if (existError) throw new Error(existError);
      }
    }

    //buscar si hay programaciones activas con el mismo instructor sin contar la programacion que se esta editando
    const schedules2 = await Schedule.find({
      instructor: searchSchedule.instructor,
      status: 0,
      _id: { $ne: id },
      fiche: { $ne: searchSchedule.fiche },
    }).populate("fiche");



    for (const schedule of schedules2) {
      const tStartToDate = dateFormater(currentDate, schedule.tstart);
      const tEndToDate = dateFormater(currentDate, schedule.tend);

      //validar que el instructor no tenga programacion en otra ficha en las mismas horas, dentro de las fechas de la programacion
      if (
        schedule.fstart <= searchSchedule.fend &&
        schedule.fend >= searchSchedule.fstart &&
        tStartToDate <= tEndToDateClient &&
        tEndToDate >= tStartToDateClient
      ) {
        for (const event of schedule.events) {
          //si el evento es igual o mayor a la fecha de inicio y menor o igual a la fecha de fin validar que este el día no este dentro dentro del array de days
          if (
            event >= searchSchedule.fstart &&
            event <= searchSchedule.fend
          ) {
            if (searchSchedule.events.includes(event)) {
              existError = `El instructor ya tiene programación activa en la fecha: ${event.toISOString().split("T")[0]
                } en la ficha: ${schedule.fiche.number}`;
              break;
            }
          }
        };
      }

      if (existError) throw new Error(existError);
    };
  } catch (error) {
    console.log("mierror", error)
    if (existError) throw new Error(existError);
    else
      throw new Error(
        "Error al validar la programación, revise los datos e intente de nuevo12"
      );
  }
};

export { scheduleHelper };
