import colorsEvents from "../utils/colors/colorsEvents.js";
import { dateFormater, formatDate12Hours } from "../utils/functions/dates.js";

import Schedule from "../models/Schedule.js";
import OthersSchedule from "../models/OthersSchedule.js";
import Fiche from "../models/Fiche.js";
import Instructor from "../models/Instructor.js";
import Coordination from "../models/Coordination.js";
import sendEmail from "../utils/emails/sendEmail.js";
import sendEmailMicrosoft from "../utils/emails/sendEmailOutlook.js";
import webToken from "../middlewares/webToken.js";
import registerAction from "../middlewares/binnacle.js";
import { formatEventSchedule } from "../utils/functions/eventsCalender.js";
import HistorySchedule from "../models/HistorySchedule.js";
import { token } from "morgan";

const reportsCtrl = {};


//funcion para convertir numero a letra

const calculateNameMonth = (numMonth) => {
  switch (numMonth) {
    case "01":
      return "ENERO";
    case "02":
      return "FEBRERO";
    case "03":
      return "MARZO";
    case "04":
      return "ABRIL";
    case "05":
      return "MAYO";
    case "06":
      return "JUNIO";
    case "07":
      return "JULIO";
    case "08":
      return "AGOSTO";
    case "09":
      return "SEPTIEMBRE";
    case "10":
      return "OCTUBRE";
    case "11":
      return "NOVIEMBRE";
    case "12":
      return "DICIEMBRE";
    default:
      return "";
  }
};



const calculateNameDay = (numDay) => {
  switch (numDay) {
    case 1:
      return "Lunes";
    case 2:
      return "Martes";
    case 3:
      return "Miercoles";
    case 4:
      return "Jueves";
    case 5:
      return "Viernes";
    case 6:
      return "Sabado";
    case 0:
      return "Domingo";
    default:
      return "";
  }
};




//retornar las horas de trabajo de acuerdo a los eventos de una programacion

const calculateHours = (events, tstart, tend, fstart, fend) => {
  const currentDate = new Date();
  const newTstart = dateFormater(currentDate, tstart);

  const newTend = dateFormater(currentDate, tend);

  const newFstart = dateFormater(fstart);

  const newFend = dateFormater(fend);

  //sacar la diferencia de horas entre newTstart y newTend
  const diference = newTend.getTime() - newTstart.getTime();
  const minutes = Math.round(diference / 60000);
  const hours = parseFloat(minutes / 60).toFixed(2);

  //recorrer los eventos y solo contar los que esten en el rango de fechas
  let hourswork = 0;
  events.forEach((event) => {
    if (event >= newFstart && event <= newFend) {
      hourswork += parseFloat(hours);
    }
  });
  return hourswork;
};
 


//validate if exist the instructor
reportsCtrl.responseInstr = async (req, res) => {  
  const { document, email } = req.body;
  
  try {
    const instructor = await Instructor.findOne({
      numdocument: document,
    }).lean();
    instructor.role="INSTRUCTOR"
    const token = await webToken.generateToken(instructor); 

    if (instructor.email.toLowerCase() == email.toLowerCase() || instructor.emailpersonal.toLowerCase() == email.toLowerCase()) {
      return res.json({ instructor,token });
    }
    return res.status(400).json({ msg: "El instructor no existe "});
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }

};

//validate if exist the fiche
reportsCtrl.responseFiche = async (req, res) => {
  const { fiche } = req.body;
  const numberFiche = fiche.toString().trim();

  try {
    const fiche = await Fiche.find({ number: numberFiche });
    res.json({ fiche });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//generar reporte
reportsCtrl.newReport = async (req, res) => {
  const { fiche, fstart, fend } = req.body;
  let daysProgram = {};
  let colors = [...colorsEvents];

  try {
    const schedules = await Schedule.find({ fiche: fiche, status: 0 }).populate(
      "fiche instructor program competence outcome environment"
    );

    let newListProgramaFiche = [];
    const newFstart = new Date(fstart);
    const newFend = new Date(fend);

    //capturar los meses entre las fechas de inicio y fin
    let dates = [];
    let yearsMonth = [];
    let month = newFstart.getUTCMonth() + 1;
    let tempDateStart = new Date(newFstart);

    while (tempDateStart <= newFend) {
      //pasar la fecha completa sin Timepo 2023-05-01
      dates.push(month.toString().padStart(2, "0"));
      yearsMonth.push(
        `${tempDateStart.getUTCFullYear()}-${month.toString().padStart(2, "0")}`
      );

      if (month === 12) {
        month = 0;
      }

      month++;
      tempDateStart.setMonth(tempDateStart.getMonth() + 1);
    }
    schedules.forEach((progra) => {
      if (progra.fstart <= newFend && progra.fend >= newFstart) {
        newListProgramaFiche.push(progra);
      }
    });

    if (newListProgramaFiche.length === 0) {
      return res.status(400).json({
        msg: "La ficha no tiene programación en el rango de fechas selecionadas",
      });
    }

    let index = 1;
    //extraer los eventos de cada programacion y crear un objeto con id, idInstructor, title, start
    newListProgramaFiche.forEach((progra) => {
      if (colors.length===0){
        colors = [...colorsEvents];
      }
      const color = colors[Math.floor(Math.random() * colors.length)];
      

      colors.splice(colors.indexOf(color), 1);

      progra.events.forEach((event) => {
        const newDate = new Date(event);
        const month = (newDate.getUTCMonth() + 1).toString().padStart(2, "0");

        if (dates.includes(month)) {
          if (daysProgram[month]) {
            daysProgram[month].push(
              formatEventSchedule(progra, event, index, color, false)
            );
          } else {
            daysProgram[month] = [];
            daysProgram[month].push(
              formatEventSchedule(progra, event, index, color, false)
            );
          }
          index++;
        }
      });
    });

    return res.json({
      msg: "Reporte generado correctamente",
      fiche: schedules[0] ? schedules[0].fiche.number : "",
      program: schedules[0] ? schedules[0].program.name : "",
      months: dates,
      yearsMonth,
      events: daysProgram,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

reportsCtrl.newReportInstructor = async (req, res) => {
  const { instructor, fstart, fend } = req.body;
  let daysProgram = {};
  let colors = [...colorsEvents];

  let hourswork1 = 0;
  let hourswork2 = 0;

  try {
    const schedules = await Schedule.find({
      instructor: instructor,
      status: 0,
    }).populate("fiche instructor program competence outcome environment");

    const otherSchedule = await OthersSchedule.find({
      instructor: instructor,
      status: 0,
    }).populate("instructor");

    let newListProgramaFiche = [];
    let newListOtherSchedule = [];

    const newFstart = new Date(fstart);
    const newFend = new Date(fend);

    //capturar los meses entre las fechas de inicio y fin
    let dates = [];
    let yearsMonth = [];
    let month = newFstart.getUTCMonth() + 1;
    let tempDateStart = new Date(newFstart);

    while (tempDateStart <= newFend) {
      //pasar la fecha completa sin Timepo 2023-05-01
      dates.push(month.toString().padStart(2, "0"));
      yearsMonth.push(
        `${tempDateStart.getUTCFullYear()}-${month.toString().padStart(2, "0")}`
      );

      if (month === 12) {
        month = 0;
      }

      month++;
      tempDateStart.setMonth(tempDateStart.getMonth() + 1);
    }

    //sacar los eventos de las programaciones normales
    schedules.forEach((progra) => {
      if (progra.fstart <= newFend && progra.fend >= newFstart) {
        newListProgramaFiche.push(progra);
      }
    });

    let index = 1;
    let colorsFiche = {};

    //extraer los eventos de cada programacion y crear un objeto con id, idInstructor, title, start
    newListProgramaFiche.forEach((progra) => {
      let color;
      if (colorsFiche[progra.fiche.number]) {
        color = colorsFiche[progra.fiche.number];
      } else {
        color = colors[Math.floor(Math.random() * colors.length)];
        colors.splice(colors.indexOf(color), 1);
        colorsFiche[progra.fiche.number] = color;
      }

      hourswork1 += calculateHours(
        progra.events,
        progra.tstart,
        progra.tend,
        newFstart,
        newFend
      );

      progra.events.forEach((event) => {
        const newDate = new Date(event);
        const month = (newDate.getUTCMonth() + 1).toString().padStart(2, "0");

        if (dates.includes(month)) {
          if (daysProgram[month]) {
            daysProgram[month].push(
              formatEventSchedule(
                progra,
                event,
                index,
                color,
                false,
                progra.fiche.number
              )
            );
          } else {
            daysProgram[month] = [];
            daysProgram[month].push(
              formatEventSchedule(
                progra,
                event,
                index,
                color,
                false,
                progra.fiche.number
              )
            );
          }
          index++;
        }
      });
    });

    //sacar los eventos de otras programaciones
    otherSchedule.forEach((progra) => {
      if (progra.fstart <= newFend && progra.fend >= newFstart) {
        newListOtherSchedule.push(progra);
      }
    });

    if (
      newListOtherSchedule.length === 0 &&
      newListProgramaFiche.length === 0
    ) {
      return res.status(400).json({
        msg: "El instructor no tiene programación en el rango de fechas selecionadas",
      });
    }

    //extraer los eventos de cada programacion y crear un objeto con id, idInstructor, title, start
    newListOtherSchedule.forEach((progra) => {
      let color = colors[Math.floor(Math.random() * colors.length)];
      colors.splice(colors.indexOf(color), 1);

      hourswork2 += calculateHours(
        progra.events,
        progra.tstart,
        progra.tend,
        newFstart,
        newFend
      );

      progra.events.forEach((event) => {
        const newDate = new Date(event);
        const month = (newDate.getUTCMonth() + 1).toString().padStart(2, "0");

        if (dates.includes(month)) {
          if (daysProgram[month]) {
            daysProgram[month].push({
              id: index,
              idInstructor: progra.instructor._id,
              typeactivity: progra.typeactivity,
              additionalactivity: progra.additionalactivity,
              justification: progra.justification,
              title: "ACTIVIDAD COMPLEMENTARIA",
              instructor: progra.instructor.name,
              start: event.toISOString().split("T")[0],
              tstart: formatDate12Hours(progra.tstart),
              tend: formatDate12Hours(progra.tend),
              backgroundColor: color.background,
              borderColor: color.background,
              textColor: color.colortext,
              type: 1,
            });
          } else {
            daysProgram[month] = [];
            daysProgram[month].push({
              id: index,
              idInstructor: progra.instructor._id,

              typeactivity: progra.typeactivity,
              additionalactivity: progra.additionalactivity,
              justification: progra.justification,

              instructor: progra.instructor.name,
              title: "ACTIVIDAD COMPLEMENTARIA",
              start: event.toISOString().split("T")[0],
              tstart: formatDate12Hours(progra.tstart),
              tend: formatDate12Hours(progra.tend),
              backgroundColor: color.background,
              borderColor: color.background,
              textColor: color.colortext,
              type: 1,
            });
          }
          index++;
        }
      });
    });

    return res.json({
      msg: "Reporte generado correctamente",
      months: dates,
      instructor: schedules[0]
        ? schedules[0].instructor.name
        : otherSchedule[0]
        ? otherSchedule[0].instructor.name
        : "",
      yearsMonth,
      hoursworkFormacion: hourswork1,
      hoursworkOthers: hourswork2,
      events: daysProgram,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//reporte por ambiente
reportsCtrl.newReportEnvironment = async (req, res) => {
  const { environment, fstart, fend } = req.body;
  let daysProgram = {};

  try {
    const schedules = await Schedule.find({
      environment: environment,
      status: 0,
    }).populate("fiche instructor program competence outcome environment");

    let newListProgramaFiche = [];
    const newFstart = new Date(fstart);
    const newFend = new Date(fend);

    //capturar los meses entre las fechas de inicio y fin
    let dates = [];
    let yearsMonth = [];
    let month = newFstart.getUTCMonth() + 1;
    let tempDateStart = new Date(newFstart);

    while (tempDateStart <= newFend) {
      //pasar la fecha completa sin Timepo 2023-05-01
      dates.push(month.toString().padStart(2, "0"));
      yearsMonth.push(
        `${tempDateStart.getUTCFullYear()}-${month.toString().padStart(2, "0")}`
      );

      if (month === 12) {
        month = 0;
      }

      month++;
      tempDateStart.setMonth(tempDateStart.getMonth() + 1);
    }
    schedules.forEach((progra) => {
      if (progra.fstart <= newFend && progra.fend >= newFstart) {
        newListProgramaFiche.push(progra);
      }
    });

    if (newListProgramaFiche.length === 0) {
      return res.status(400).json({
        msg: "El ambiente no tiene programación en el rango de fechas selecionadas",
      });
    }

    let index = 1;
    //extraer los eventos de cada programacion y crear un objeto con id, idInstructor, title, start
    newListProgramaFiche.forEach((progra) => {
      //calcular el color apartir de la hora de inicio y fin de la programacion
      let color;
      const newTstart = dateFormater(new Date(), progra.tstart);

      if (newTstart >= dateFormater(new Date(), "18:30")) {
        color = {
          background: "#3A49BA",
          colortext: "#FFFFFF",
        };
      } else if (newTstart >= dateFormater(new Date(), "12:30")) {
        color = {
          background: "#FD6212",
          colortext: "#FFFFFF",
        };
      } else {
        color = {
          background: "#00a91c",
          colortext: "#FFFFFF",
        };
      }

      progra.events.forEach((event) => {
        const newDate = new Date(event);
        const month = (newDate.getUTCMonth() + 1).toString().padStart(2, "0");
        if (dates.includes(month)) {
          if (daysProgram[month]) {
            daysProgram[month].push(
              formatEventSchedule(progra, event, index, color, false)
            );
          } else {
            daysProgram[month] = [];
            daysProgram[month].push(
              formatEventSchedule(progra, event, index, color, false)
            );
          }
          index++;
        }
      });
    });

    return res.json({
      msg: "Reporte generado correctamente",
      environment: schedules[0] ? schedules[0].environment.name : "",
      months: dates,
      yearsMonth,
      events: daysProgram,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

reportsCtrl.sendReport = async (req, res) => {
  const { fiche, fstart, fend } = req.body;
  let namesInstrc = [];
  let emailsInstrc = [];
  let idsSchedules = [];
  let daysProgram = []
  let dateStart = dateFormater(fstart);
  let dateEnd = dateFormater(fend);

  try {
    const searchFiche = await Fiche.findById(fiche).populate(
      "owner program coordination"
    );

    const searchCoordination = await Coordination.findById(
      searchFiche.coordination._id
    ).populate("coordinator programmers");

    namesInstrc.push(searchFiche.owner.name);
    emailsInstrc.push(searchFiche.owner.email);

    emailsInstrc.push(searchCoordination.coordinator.email);
    searchCoordination.programmers.forEach((programmer) => {
      emailsInstrc.push(programmer.email);
    });

    const schedules = await Schedule.find({ fiche: fiche, status: 0 }).populate(
      "instructor environment"
    );

    schedules.forEach((progra) => {
      //solo las programaciones que tengan eventos en el rango de fechas
      progra.events.forEach((event) => {
        let dateEvent = new Date(event);
       
        if (dateEvent >= dateStart && dateEvent <= dateEnd) {
          let numDay = dateEvent.getUTCDay()
          let dayName = calculateNameDay(numDay)
          let indexDay = daysProgram.findIndex((item, i)=>
            item.num == numDay
          )
          if (indexDay==-1){
            daysProgram.push({num:numDay, dayName})
          }

          idsSchedules.push(progra._id);
          if (!namesInstrc.includes(progra.instructor.name)) {
            namesInstrc.push(progra.instructor.name);
          }
          if (!emailsInstrc.includes(progra.instructor.email)) {
            emailsInstrc.push(progra.instructor.email);
          }
          if (progra.instructor.emailpersonal) {
            if (!emailsInstrc.includes(progra.instructor.emailpersonal)) {
              emailsInstrc.push(progra.instructor.emailpersonal);
            }
          }
        }

      });
    });

    const historySche = await HistorySchedule.find({
      shedule: { $in: idsSchedules },
      status: 0,
    }).populate("instructor");

    //si existe el id en el historial de programaciones agregar el correo y nombre del instructor

    historySche.forEach((progra) => {
      if (!namesInstrc.includes(progra.instructor.name)) {
        namesInstrc.push(progra.instructor.name);
      }
      if (!emailsInstrc.includes(progra.instructor.email)) {
        emailsInstrc.push(progra.instructor.email);
      }
      if (progra.instructor.emailpersonal) {
        if (!emailsInstrc.includes(progra.instructor.emailpersonal)) {
          emailsInstrc.push(progra.instructor.emailpersonal);
        }
      }
    });

    //eliminar todos los historiales de programaciones
    await HistorySchedule.deleteMany({
      shedule: { $in: idsSchedules },
    });

    //search schedule with tstart and tend más grande en diferencia de minutos

    const currentDate = new Date();
    let positionSchedule = {};
    let diferenciaInitial = 0;

    schedules.forEach((progra) => {
      const newTstart = dateFormater(currentDate, progra.tstart);

      const newTend = dateFormater(currentDate, progra.tend);

      const diffMinutes =
        Math.abs(new Date(newTend) - new Date(newTstart)) / 60000;

      if (diffMinutes > diferenciaInitial) {
        diferenciaInitial = diffMinutes;
        positionSchedule = progra;
      }
    });
    
    const token = await webToken.generateTempToken(fiche, fstart, fend);
    
    await sendEmail(
      searchCoordination.email,
      searchCoordination.passapp,
      emailsInstrc,
      "REPORTE DE PROGRAMACIÓN",
      {
        namesInstrc,
        ownerName: searchFiche.owner.name,
        ownerPhone: searchFiche.owner.phone,
        ownerEmail: searchFiche.owner.email,
        program: searchFiche.program.name,
        daysProgram:daysProgram?.sort((a,b)=>{
          if(a.num<b.num){
            return -1
          }else{
            return 1
          }
        }).map(item=>item.dayName).join(", "),
        environment: schedules[schedules.length - 1].environment.name,
        ficheNumber: searchFiche.number,
        hours: `${formatDate12Hours(
          positionSchedule.tstart
        )} - ${formatDate12Hours(positionSchedule.tend)}`,
        url: `${process.env.URL_FRONTEND}/programacion/${token}`,
      },
      "./template/instructorEmail.hbs"
    );

    await registerAction(
      "REPORTES",
      {
        event: "ENVIAR REPORTE",
        data: { fiche, fstart, fend },
      },
      req.headers.token
    );
    res.json({
      msg: "Reporte enviado correctamente",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

reportsCtrl.reportHoursInstructors = async (req, res) => {
  const { fstart, fend, type } = req.body;
  try {
    let months = [];
    let groupInstructor = [];
    let nameType = type == "TODOS" ? " - EN FORMACIÓN" : "".trim();

    //buscar todas las programaciones cuya fecha de inicio sea mayoor o igual a fstart
    //retroceder 3 meses para que no se pierda el mes anterior
    let dateStart = new Date(fstart);
    dateStart.setMonth(dateStart.getMonth() - 3);

    if (type == "EN FORMACION" || type == "TODOS") {
      const schedules = await Schedule.find({
        fstart: { $gte: dateStart },
        status: 0,
        //agrupar por instructor
      }).populate("instructor");

      //agrupar por instructor
      schedules.forEach((progra) => {
        let indexInstructor = groupInstructor.findIndex(
          (instructor) =>
            instructor.document == progra.instructor.numdocument.trim()
        );

        const newTstart = dateFormater(new Date(), progra.tstart);
        const newTend = dateFormater(new Date(), progra.tend);

        const diference = newTend.getTime() - newTstart.getTime();
        const minutes = Math.round(diference / 60000); // 60000 = 1000 * 60

        const hours = Math.round(minutes / 60);

        if (indexInstructor === -1) {
          groupInstructor.push({
            id: progra.instructor._id,
            name: progra.instructor.name,
            document: progra.instructor.numdocument,
            hours: 0,
            months: [],
          });

          //rellenar los meses con 0 anteriormente
          for (let i = 0; i < months.length - 1; i++) {
            groupInstructor[groupInstructor.length - 1].months.push({
              year: months[i].year,
              month: months[i].month,
              name: months[i].name,
              hours: 0,
              concat: `${months[i].year} - ${months[i].name}${nameType}`,
            });
          }

          indexInstructor = groupInstructor.length - 1;
        }

        progra.events.forEach((event) => {
          //validar que el evento sea ma
          const dateEvent = new Date(event);

          if (dateEvent >= new Date(fstart) && dateEvent <= new Date(fend)) {
            //si el mes no existe en la lista de meses agregarlo
            const month = (dateEvent.getUTCMonth() + 1)
              .toString()
              .padStart(2, "0");
            let indexM = months.findIndex(
              (searchMonth) =>
                searchMonth.concat ==
                `${dateEvent.getUTCFullYear()} - ${calculateNameMonth(
                  month
                )}${nameType}`
            );

            if (indexM === -1) {
              months.push({
                type: "EN FORMACIÓN",
                year: dateEvent.getUTCFullYear(),
                month: month,
                name: calculateNameMonth(month),
                concat: `${dateEvent.getUTCFullYear()} - ${calculateNameMonth(
                  month
                )}${nameType}`,
              });

              //recorrer la lista de instructores un 0 en cada mes
              groupInstructor.forEach((instructor) => {
                instructor.months.push({
                  year: dateEvent.getUTCFullYear(),
                  month: month,
                  name: calculateNameMonth(month),
                  concat: `${dateEvent.getUTCFullYear()} - ${calculateNameMonth(
                    month
                  )}${nameType}`,
                  hours: 0,
                });
              });

              indexM = months.length - 1;
            } else {
              //validar si el mes ya existe en el instructor
              const indexMonth = groupInstructor[
                indexInstructor
              ].months.findIndex(
                (searchMonth) => searchMonth.concat == months[indexM].concat
              );

              if (indexMonth === -1) {
                groupInstructor[indexInstructor].months.push({
                  year: dateEvent.getUTCFullYear(),
                  month: month,
                  name: calculateNameMonth(month),
                  concat: `${dateEvent.getUTCFullYear()} - ${calculateNameMonth(
                    month
                  )}${nameType}`,
                  hours: 0,
                });
              }
            }

            //sumar las horas al instructor
            groupInstructor[indexInstructor].hours += hours;

            //sumar las horas al mes
            const indexMonth = groupInstructor[
              indexInstructor
            ].months.findIndex(
              (searchMonth) => searchMonth.concat == months[indexM].concat
            );

            groupInstructor[indexInstructor].months[indexMonth].hours += hours;
          }
        });
      });
    }

    //agrupar por instructor otras actividades

    if (type == "OTRAS ACTIVIDADES" || type == "TODOS") {
      nameType = type == "TODOS" ? " - OTRAS ACTIVIDADES" : "".trim();
      const otherSchedule = await OthersSchedule.find({
        fstart: { $gte: dateStart },
        status: 0,
      }).populate("instructor");

      otherSchedule.forEach((progra) => {
        let indexInstructor = groupInstructor.findIndex(
          (instructor) =>
            instructor.document == progra.instructor.numdocument.trim()
        );

        const newTstart = dateFormater(new Date(), progra.tstart);
        const newTend = dateFormater(new Date(), progra.tend);

        const diference = newTend.getTime() - newTstart.getTime();
        const minutes = Math.round(diference / 60000); // 60000 = 1000 * 60

        const hours = Math.round(minutes / 60);

        if (indexInstructor === -1) {
          groupInstructor.push({
            id: progra.instructor._id,
            name: progra.instructor.name,
            document: progra.instructor.numdocument,
            hours: 0,
            months: [],
          });

          //rellenar los meses con 0 anteriormente
          for (let i = 0; i < months.length - 1; i++) {
            groupInstructor[groupInstructor.length - 1].months.push({
              year: months[i].year,
              month: months[i].month,
              name: months[i].name,
              hours: 0,
              concat: `${months[i].year} - ${months[i].name}${nameType}`,
            });
          }

          indexInstructor = groupInstructor.length - 1;
        }

        progra.events.forEach((event) => {
          //validar que el evento sea ma
          const dateEvent = new Date(event);

          if (dateEvent >= new Date(fstart) && dateEvent <= new Date(fend)) {
            //si el mes no existe en la lista de meses agregarlo
            const month = (dateEvent.getUTCMonth() + 1)
              .toString()
              .padStart(2, "0");
            let indexM = months.findIndex(
              (searchMonth) =>
                searchMonth.concat ==
                `${dateEvent.getUTCFullYear()} - ${calculateNameMonth(
                  month
                )}${nameType}`
            );

            if (indexM === -1) {
              months.push({
                type: "OTRAS ACTIVIDADES",
                year: dateEvent.getUTCFullYear(),
                month: month,
                name: calculateNameMonth(month),
                concat: `${dateEvent.getUTCFullYear()} - ${calculateNameMonth(
                  month
                )}${nameType}`,
              });

              //recorrer la lista de instructores un 0 en cada mes
              groupInstructor.forEach((instructor) => {
                instructor.months.push({
                  year: dateEvent.getUTCFullYear(),
                  month: month,
                  name: calculateNameMonth(month),
                  concat: `${dateEvent.getUTCFullYear()} - ${calculateNameMonth(
                    month
                  )}${nameType}`,
                  hours: 0,
                });
              });

              indexM = months.length - 1;
            } else {
              //validar si el mes ya existe en el instructor
              const indexMonth = groupInstructor[
                indexInstructor
              ].months.findIndex(
                (searchMonth) => searchMonth.concat == months[indexM].concat
              );

              if (indexMonth === -1) {
                groupInstructor[indexInstructor].months.push({
                  year: dateEvent.getUTCFullYear(),
                  month: month,
                  name: calculateNameMonth(month),
                  concat: `${dateEvent.getUTCFullYear()} - ${calculateNameMonth(
                    month
                  )}${nameType}`,
                  hours: 0,
                });
              }
            }

            //sumar las horas al instructor
            groupInstructor[indexInstructor].hours += hours;

            //sumar las horas al mes
            const indexMonth = groupInstructor[
              indexInstructor
            ].months.findIndex(
              (searchMonth) => searchMonth.concat == months[indexM].concat
            );

            groupInstructor[indexInstructor].months[indexMonth].hours += hours;
          }
        });
      });
    }
    //SACAR POR CADA INTRUCTOR EL TOTAL DE HORAS DE CADA MES Y SUMARLAS

    //recorrer la lista de meses y por cada mes agregar el mes de FORMACIÓN y OTRAS ACTIVIDADES Y TOTAL
    let newMonths = [];

    months.forEach((month) => {
      const nameOther = `${month.year} - ${month.name}${
        type == "TODOS" ? " - OTRAS ACTIVIDADES" : ""
      }
      `.trim();
      const nameFormacion = `${month.year} - ${month.name}${
        type == "TODOS" ? " - EN FORMACIÓN" : ""
      }`.trim();
      const nameTotal = `${month.year} - ${month.name} - TOTAL`.trim();

      const indexOther = newMonths.findIndex(
        (searchMonth) => searchMonth.concat == nameOther
      );
      const indexFormacion = newMonths.findIndex(
        (searchMonth) => searchMonth.concat == nameFormacion
      );
      const indexTotal = newMonths.findIndex(
        (searchMonth) => searchMonth.concat == nameTotal
      );

      if (
        indexOther === -1 &&
        (type == "OTRAS ACTIVIDADES" || type == "TODOS")
      ) {
        newMonths.push({
          type: "OTRAS ACTIVIDADES",
          year: month.year,
          month: month.month,
          name: month.name,
          concat: nameOther,
          hours: 0,
        });
      }

      if (
        indexFormacion === -1 &&
        (type == "EN FORMACION" || type == "TODOS")
      ) {
        newMonths.push({
          type: "EN FORMACIÓN",
          year: month.year,
          month: month.month,
          name: month.name,
          concat: nameFormacion,
          hours: 0,
        });
      }

      if (indexTotal === -1 && type == "TODOS") {
        newMonths.push({
          type: "TOTAL",
          year: month.year,
          month: month.month,
          name: month.name,
          concat: nameTotal,
          hours: 0,
        });
      }
    });

    //ordenar los meses por año y mes y tipo (FORMACION, OTRAS ACTIVIDADES, TOTAL)
    newMonths.sort((a, b) => {
      if (a.year > b.year) {
        return 1;
      } else if (a.year < b.year) {
        return -1;
      } else {
        if (a.month > b.month) {
          return 1;
        } else if (a.month < b.month) {
          return -1;
        } else {
          if (a.type > b.type) {
            return 1;
          } else if (a.type < b.type) {
            return -1;
          } else {
            return 0;
          }
        }
      }
    });

    groupInstructor.forEach((instructor) => {
      newMonths.forEach((month) => {
        const indexMonth = instructor.months.findIndex(
          (searchMonth) => searchMonth.concat == month.concat
        );
        if (indexMonth === -1) {
          instructor.months.push({
            year: month.year,
            month: month.month,
            name: month.name,
            concat: month.concat,
            hours: 0,
          });
        }
        if (month.type === "TOTAL") {
          //sumar las horas de cada mes EN FORMACION y OTRAS ACTIVIDADES y asignarlas al mes TOTAL
          const indexMonthFormacion = instructor.months.findIndex(
            (searchMonth) =>
              searchMonth.concat ==
              `${month.year} - ${month.name} - EN FORMACIÓN`
          );

          const indexMonthOther = instructor.months.findIndex(
            (searchMonth) =>
              searchMonth.concat ==
              `${month.year} - ${month.name} - OTRAS ACTIVIDADES`
          );

          const indexMonthTotal = instructor.months.findIndex(
            (searchMonth) =>
              searchMonth.concat == `${month.year} - ${month.name} - TOTAL`
          );

          instructor.months[indexMonthTotal].hours =
            instructor.months[indexMonthFormacion].hours +
            instructor.months[indexMonthOther].hours;
        }
      });

      //organizar los meses por año y mes y tipo (FORMACION, OTRAS ACTIVIDADES, TOTAL)
      instructor.months.sort((a, b) => {
        if (a.year > b.year) {
          return 1;
        } else if (a.year < b.year) {
          return -1;
        } else {
          if (a.month > b.month) {
            return 1;
          } else if (a.month < b.month) {
            return -1;
          } else {
            if (a.type > b.type) {
              return 1;
            } else if (a.type < b.type) {
              return -1;
            } else {
              return 0;
            }
          }
        }
      });
    });

    res.json({
      msg: "Reporte generado correctamente",
      data: groupInstructor,
      months: newMonths,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

reportsCtrl.testEmail = async (req, res) => {
  try {
    await sendEmail(
      process.env.FROM_EMAIL,
      process.env.SECURY_EMAIL,
      ["jroatoro362@gmail.com", "jlroa82@soy.sena.edu.co"],
      "REPORTE DE PROGRAMACION",
      {
        namesInstrc: ["test"],
        ownerName: "test",
        ownerPhone: "test",
        ownerEmail: "test",
        program: "test",
        environment: "test",
        ficheNumber: "test",
        hours: "test",
        url: "www.google.com",
      },
      "./template/instructorEmail.hbs"
    );

    res.json({
      msg: "Correo enviado correctamente",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

reportsCtrl.testEmailMicrosoft = async (req, res) => {
  await sendEmailMicrosoft(
    "pruebapersonal182@outlook.com",
    "xvplgkteghauvlxa",
    [
      "senapruebas123@gmail.com",
      "jlroa82@misena.edu.co",
      "jaguevaras@sena.edu.co",
      "alexguevara31@gmail.com",
      "emcampos@sena.edu.co",
      "jlroa82@soy.sena.edu.co",
    ],
    "REPORTE DE PROGRAMACION",
    {
      namesInstrc: ["test"],
      ownerName: "test",
      ownerPhone: "test",
      ownerEmail: "test",
      program: "test",
      environment: "test",
      ficheNumber: "test",
      hours: "test",
      url: "www.google.com",
    },
    "./template/instructorEmail.hbs"
  );

  res.json({
    msg: "Correo enviado correctamente",
  });
};

export { reportsCtrl };
