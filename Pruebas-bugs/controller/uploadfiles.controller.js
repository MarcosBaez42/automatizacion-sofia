/**
 * Controller functions for handling file upload and download.
 * @module uploadfiles.controller
 */
import * as XLSX from "xlsx/xlsx.mjs";
import path from "path";

/* load 'fs' for readFile and writeFile support */
import * as fs from "fs";
import Competence from "../models/Competence.js";
import Program from "../models/Program.js";
import Outcome from "../models/Outcome.js";
import Fiche from "../models/Fiche.js";
import Schedules from "../models/Schedule.js";
import Instructor from "../models/Instructor.js";
import Town from "../models/Town.js";
import New from "../models/News.js";
import Improvement from "../models/Improvement.js";
import registerAction from "../middlewares/binnacle.js";

XLSX.set_fs(fs);

const fileCtrl = {};

function calculateColor(currentDate, dateStart, dateEnd) {
  //en caso de que la fecha de inicio sea null retorna white
  const dateS = new Date(dateStart);
  const dateE = new Date(dateEnd);

  if (!dateS || !dateE) {
    return "white";
  }

  if (dateE < currentDate) {
    return "#9EFF9E"; //ya se dio
  } else if (dateS < currentDate) {
    return "#FFF3A3"; // esta en curso
  } else {
    return "white"; // no se ha dado
  }
}

/**
 * Reads data from an uploaded Excel file and saves it to the database.
 * @function readExcel
 * @async
 * @param {Object} req - The request object.
 * @param {Object} req.dataFile - The data from the uploaded Excel file.
 * @param {string} req.params.program - The ID of the program associated with the data.
 * @param {Object} res - The response object.
 * @returns {Object} A JSON object with a success message.
 */
fileCtrl.readExcel = async (req, res) => {
  const { dataFile } = req;
  const { program } = req.params;

  try {
    let competences = [];
    let outcomes = [];

    const searchProgram = await Program.findById(program);

    //crear las competencias en la base de datos en caso de que no existan
    for (let i = 0; i < dataFile.length; i++) {
      const { codecompetence, namecompetence } = dataFile[i];

      //validar si el codecompetence ya existe en el array de competencias
      if (
        competences.find((competence) => competence.number == codecompetence)
      ) {
      } else {
        const competenceFound = await Competence.findOne({
          number: codecompetence,
          program: searchProgram._id,
        });

        if (!competenceFound) {
          const newCompetence = new Competence({
            number: codecompetence,
            name: namecompetence,
            program: searchProgram._id,
          });
          await newCompetence.save();
          competences.push({
            competence: newCompetence._id,
            number: newCompetence.number,
          });
        } else {
          competences.push({
            competence: competenceFound._id,
            number: competenceFound.number,
          });
        }
      }
    }

    //crear los outcomes en la base de datos
    for (let i = 0; i < dataFile.length; i++) {
      const { codecompetence, outcome, codeoutcome } = dataFile[i];

      const idCompetence = competences.find(
        (competence) => competence.number == codecompetence
      );

      if (outcomes.find((outcome) => outcome.code == codeoutcome)) {
      } else {
        const outcomeFound = await Outcome.findOne({
          code: codeoutcome,
          competence: idCompetence.competence,
        });
        if (!outcomeFound) {
          const newOutcome = new Outcome({
            code: codeoutcome,
            outcomes: outcome,
            competence: idCompetence.competence,
          });
          await newOutcome.save();
          outcomes.push({
            outcome: newOutcome._id,
            code: newOutcome.code,
          });
        } else {
          outcomes.push({
            outcome: outcomeFound._id,
            code: outcomeFound.code,
          });
        }
      }
    }
    await registerAction(
      "CARGA MASIVA",
      {
        event: "CARGAR MASIVAMENTE COMPETENCIAS Y RESULTADOS",
        data: { program },
      },
      req.headers.token
    );
    res.json({ msg: "Datos cargados correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al cargar los datos" });
  }
};

/**
 * Downloads an example Excel file.
 * @function downloadExample
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The example Excel file.
 */
fileCtrl.downloadExample = async (req, res) => {
  const { fileDownload } = req.body;
  try {
    //obtener el archivo de la carpeta uploads con el nombre de example.xlsx
    const __dirname = path.resolve();
    let filePath = null;

    if (fileDownload == "CYR") {
      filePath = path.join(__dirname, "uploads", "CompetenciaYResultados.xlsx");
    } else {
      filePath = path.join(__dirname, "uploads", "templateInstructores.xlsm");
    }

    res.download(filePath);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al descargar el archivo" });
  }
};

/**
 * Reads data from an uploaded Excel file for judgment evaluation.
 * @function readExcelJudgment
 * @async
 * @param {Object} req - The request object.
 * @param {Object} req.files.file - The uploaded Excel file.
 * @param {Object} res - The response object.
 * @returns {Object} A JSON object with the extracted data from the Excel file.
 */
fileCtrl.readExcelJudgment = async (req, res) => {
  let moreInfo = [];
  let ficheFound = null;
  let dataExcel = [];
  let dataForStudents = [];
  let listStudents = [];
  let currentDate = new Date();
  let newsByFiche = [];
  let improvementsByFiche = [];

  try {
    //extrae el archivo excel de la carpeta temporal y sacar la información
    const excelFile = XLSX.readFile(req.files.file.tempFilePath);
    const sheetName = excelFile.SheetNames;

    //extraer la información de la hoja 1
    const sheet = excelFile.Sheets[sheetName[0]];

    //extraer desde la fila 2 hasta la 12
    moreInfo = XLSX.utils.sheet_to_json(sheet, {
      header: ["name", , "value", , ,],
      range:
        (2,
        {
          s: { c: 0, r: 1 }, //para que empiece desde la fila 2
          e: { c: 6, r: 11 }, //para que termine en la fila 12
        }),
      row: false,
      blankrows: false,
      defval: null,
      sheetStubs: true,
      cellDates: true,
    });

    //convertir la fecha de inicio y fin de la ficha de caracterizacion al formato dd/mm/aaaa
    moreInfo[6].value = XLSX.SSF.format("dd/mm/yyyy", moreInfo[6].value);
    moreInfo[7].value = XLSX.SSF.format("dd/mm/yyyy", moreInfo[7].value);

    //buscar la ficha en la base de datos
    try {
      ficheFound = await Fiche.findOne({ number: moreInfo[1].value });

      if (ficheFound) {
        //buscar todas las novendades de la ficha
        newsByFiche = await New.find({ fiche: ficheFound._id });

        //buscar todas los planes de mejoramiento de la ficha
        improvementsByFiche = await Improvement.find({ fiche: ficheFound._id });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: "Error al buscar información" });
    }

    const dataFile = XLSX.utils.sheet_to_json(sheet, {
      header: [
        "tpdocument",
        "numdocument",
        "name",
        "lastname",
        "status",
        "competence",
        "outcome",
        "judgment",
        "instructor",
      ],
      range: 13,
      row: false, //para que los datos los tome como columnas
      blankrows: false, //para no incluir las filas en blanco
      defval: null, //para que los datos vacíos los tome como null
      cellDates: true, //para que las fechas las tome como fechas
      sheetStubs: true, //para que las celdas vacías las tome como null
    });

    dataExcel = dataFile.map((item) => {
      let codeOutcome = null;
      let codeCompetence = null;
      let documentInstructor = null;

      if (item.outcome != null) {
        codeOutcome = item.outcome.split("-")[0].trim();
      }

      if (item.competence != null) {
        codeCompetence = item.competence.split("-")[0].trim();
      }

      if (item.instructor != null) {
        const parts = item.instructor.split("-"); // Separar 'CC 91079720 - WILLIAM FERNANDO MUÑOZ MUÑOZ'
        const numDocumento = parts[0].split(" ")[1]; // Obtener '91079720'
        documentInstructor = numDocumento.trim();
      }

      return {
        ...item,
        codeOutcome,
        codeCompetence,
        documentInstructor,
      };
    });

    const dataGroup = dataExcel.reduce((acc, item) => {
      const { codeOutcome, codeCompetence, documentInstructor } = item;

      //validar si existe el codigo de resultado, codigo de competencia y documento del instructor

      if (!codeOutcome || !codeCompetence) {
        return acc;
      }

      const index = acc.findIndex(
        (item) =>
          item.codeOutcome === codeOutcome &&
          item.codeCompetence === codeCompetence
      );

      if (index === -1) {
        acc.push({
          codeOutcome,
          codeCompetence,
          documentInstructor,
          outcome: item.outcome,
          competence: item.competence,
          instructor: item.instructor,
        });

        let student = {
          tpdocument: item.tpdocument,
          numdocument: item.numdocument,
          name: item.name,
          lastname: item.lastname,
          status: item.status,
          judgment: item.judgment,
          //buscar y asignar los planes de mejoramiento y novedades de cada estudiante
          newsStudent: newsByFiche.filter(
            (news) => news.document == item.numdocument
          ),
          improvementStudent: improvementsByFiche.filter(
            (improvement) => improvement.document == item.numdocument
          ),
        };

        if (item.judgment === "APROBADO") {
          acc[acc.length - 1].studentsAproved = {
            formacion: 0,
            retirado: 0,
            cancelado: 0,
            aplazado: 0,
            traslado: 0,
            noAprobado: 0,
            porCertificar: 0,
            certificado: 0,
            students: [student],
          };

          acc[acc.length - 1].studentsEvaluate = {
            formacion: 0,
            retirado: 0,
            cancelado: 0,
            aplazado: 0,
            traslado: 0,
            noAprobado: 0,
            porCertificar: 0,
            certificado: 0,
            students: [],
          };

          switch (item.status.trim()) {
            case "EN FORMACION":
              acc[acc.length - 1].studentsAproved.formacion += 1;
              break;
            case "RETIRO VOLUNTARIO":
              acc[acc.length - 1].studentsAproved.retirado += 1;
              break;
            case "CANCELADO":
              acc[acc.length - 1].studentsAproved.cancelado += 1;
              break;
            case "APLAZADO":
              acc[acc.length - 1].studentsAproved.aplazado += 1;
              break;
            case "TRASLADADO":
              acc[acc.length - 1].studentsAproved.traslado += 1;
              break;
            case "NO APROBADO":
              acc[acc.length - 1].studentsAproved.noAprobado += 1;
              break;
            case "POR CERTIFICAR":
              acc[acc.length - 1].studentsAproved.porCertificar += 1;
              break;
            case "CERTIFICADO":
              acc[acc.length - 1].studentsAproved.certificado += 1;
              break;
          }
        } else {
          acc[acc.length - 1].studentsEvaluate = {
            formacion: 0,
            retirado: 0,
            cancelado: 0,
            aplazado: 0,
            traslado: 0,
            noAprobado: 0,
            porCertificar: 0,
            certificado: 0,
            students: [student],
          };
          acc[acc.length - 1].studentsAproved = {
            formacion: 0,
            retirado: 0,
            cancelado: 0,
            aplazado: 0,
            traslado: 0,
            noAprobado: 0,
            porCertificar: 0,
            certificado: 0,
            students: [],
          };

          switch (item.status.trim()) {
            case "EN FORMACION":
              acc[acc.length - 1].studentsEvaluate.formacion += 1;
              break;
            case "RETIRO VOLUNTARIO":
              acc[acc.length - 1].studentsEvaluate.retirado += 1;
              break;
            case "CANCELADO":
              acc[acc.length - 1].studentsEvaluate.cancelado += 1;
              break;
            case "APLAZADO":
              acc[acc.length - 1].studentsEvaluate.aplazado += 1;
              break;
            case "TRASLADADO":
              acc[acc.length - 1].studentsEvaluate.traslado += 1;
              break;
            case "NO APROBADO":
              acc[acc.length - 1].studentsEvaluate.noAprobado += 1;
              break;
            case "POR CERTIFICAR":
              acc[acc.length - 1].studentsEvaluate.porCertificar += 1;
              break;
            case "CERTIFICADO":
              acc[acc.length - 1].studentsEvaluate.certificado += 1;
              break;
          }
        }
      } else {
        let student = {
          tpdocument: item.tpdocument,
          numdocument: item.numdocument,
          name: item.name,
          lastname: item.lastname,
          status: item.status,
          judgment: item.judgment,
          //buscar y asignar los planes de mejoramiento y novedades de cada estudiante
          newsStudent: newsByFiche.filter(
            (news) => news.document == item.numdocument
          ),
          improvementStudent: improvementsByFiche.filter(
            (improvement) => improvement.document == item.numdocument
          ),
        };

        if (item.judgment === "APROBADO") {
          acc[index].studentsAproved.students.push(student);
          switch (item.status.trim()) {
            case "EN FORMACION":
              acc[index].studentsAproved.formacion += 1;
              break;
            case "RETIRO VOLUNTARIO":
              acc[index].studentsAproved.retirado += 1;
              break;
            case "CANCELADO":
              acc[index].studentsAproved.cancelado += 1;
              break;
            case "APLAZADO":
              acc[index].studentsAproved.aplazado += 1;
              break;
            case "TRASLADADO":
              acc[index].studentsAproved.traslado += 1;
              break;
            case "NO APROBADO":
              acc[index].studentsAproved.noAprobado += 1;
              break;
            case "POR CERTIFICAR":
              acc[index].studentsAproved.porCertificar += 1;
              break;
            case "CERTIFICADO":
              acc[index].studentsAproved.certificado += 1;
              break;
          }
        } else {
          acc[index].studentsEvaluate.students.push(student);
          switch (item.status.trim()) {
            case "EN FORMACION":
              acc[index].studentsEvaluate.formacion += 1;
              break;
            case "RETIRO VOLUNTARIO":
              acc[index].studentsEvaluate.retirado += 1;
              break;
            case "CANCELADO":
              acc[index].studentsEvaluate.cancelado += 1;
              break;
            case "APLAZADO":
              acc[index].studentsEvaluate.aplazado += 1;
              break;
            case "TRASLADADO":
              acc[index].studentsEvaluate.traslado += 1;
              break;
            case "NO APROBADO":
              acc[index].studentsEvaluate.noAprobado += 1;
              break;
            case "POR CERTIFICAR":
              acc[index].studentsEvaluate.porCertificar += 1;
              break;
            case "CERTIFICADO":
              acc[index].studentsEvaluate.certificado += 1;
              break;
          }
        }
      }

      return acc;
    }, []);

    //buscar las programaciones de la ficha y ñadir la fecha de inicio y fin de la programacion en caso de que exista
    if (ficheFound) {
      try {
        const schedulesFound = await Schedules.find({
          fiche: ficheFound._id,
        }).populate("program competence outcome instructor environment");
        if (schedulesFound) {
          //buscar si existe una programacion con el mismo instructor, codigo de resultado y codigo de competencia, si es así agregar la fecha de inicio y fin de la programacion
          dataGroup.forEach(async (item) => {
            const { codeOutcome, codeCompetence } = item;
            const resultSearch = schedulesFound.find(
              (item) =>
                item.outcome.code == codeOutcome &&
                item.competence.number == codeCompetence
            );

            if (resultSearch) {
              item.fstart = XLSX.SSF.format("dd/mm/yyyy", resultSearch.fstart);
              item.fend = XLSX.SSF.format("dd/mm/yyyy", resultSearch.fend);
              item.color = calculateColor(
                currentDate,
                resultSearch.fstart,
                resultSearch.fend
              );
              item.instructorEval = `${resultSearch.instructor.tpdocument} ${resultSearch.instructor.numdocument} - ${resultSearch.instructor.name}`;
            } else {
              item.fstart = null;
              item.fend = null;
              item.color = null;
              item.instructorEval = " - ";
            }
          });
        } else {
          dataGroup.forEach(async (item) => {
            item.fstart = null;
            item.fend = null;
            item.color = null;
            item.instructorEval = " - ";
          });
        }
      } catch (error) {
        return res.status(500).json({
          msg: "Error al buscar las programaciones",
        });
      }
    }

    //recorrer dataGroup y crear un grupo de estudiantes donde cada uno tenga su información y los resultados que le corresponden
    dataGroup.forEach((item) => {
      const { studentsEvaluate, studentsAproved } = item;

      //recorrer los estudiantes aprobados y añadirlos al array de estudiantes
      studentsAproved.students.forEach((student) => {
        const {
          numdocument,
          name,
          lastname,
          status,
          judgment,
          newsStudent,
          improvementStudent,
        } = student;

        const index = dataForStudents.findIndex(
          (item) => item.numdocument == numdocument
        );

        if (index === -1) {
          dataForStudents.push({
            numdocument,
            name,
            lastname,
            newsStudent,
            improvementStudent,
            data: {
              porEvaluar: [],
              aprobado: [
                {
                  outcome: item.outcome,
                  competence: item.competence,
                  instructor: item.instructor,
                  documentInstructor: item.documentInstructor,
                  fstart: item.fstart ? item.fstart : null,
                  fend: item.fend ? item.fend : null,
                  color: item.color ? item.color : null,
                  instructorEval: item.instructorEval
                    ? item.instructorEval
                    : " - ",
                  status,
                  judgment,
                },
              ],
            },
          });
          listStudents.push({
            label: `${numdocument} - ${name} ${lastname}`,
            value: numdocument,
          });
        } else {
          dataForStudents[index].data.aprobado.push({
            outcome: item.outcome,
            competence: item.competence,
            instructor: item.instructor,
            documentInstructor: item.documentInstructor,
            fstart: item.fstart ? item.fstart : null,
            fend: item.fend ? item.fend : null,
            color: item.color ? item.color : null,
            instructorEval: item.instructorEval ? item.instructorEval : " - ",
            status,
            judgment,
          });
        }
      });

      //recorrer los estudiantes por evaluar y añadirlos al array de estudiantes
      studentsEvaluate.students.forEach((student) => {
        const {
          numdocument,
          name,
          lastname,
          status,
          judgment,
          newsStudent,
          improvementStudent,
        } = student;

        const index = dataForStudents.findIndex(
          (item) => item.numdocument == numdocument
        );

        if (index === -1) {
          dataForStudents.push({
            numdocument,
            name,
            lastname,
            newsStudent,
            improvementStudent,
            data: {
              porEvaluar: [
                {
                  outcome: item.outcome,
                  competence: item.competence,
                  instructor: item.instructor,
                  documentInstructor: item.documentInstructor,
                  fstart: item.fstart ? item.fstart : null,
                  fend: item.fend ? item.fend : null,
                  color: item.color ? item.color : null,
                  instructorEval: item.instructorEval
                    ? item.instructorEval
                    : " - ",
                  status,
                  judgment,
                },
              ],
              aprobado: [],
            },
          });

          listStudents.push({
            label: `${numdocument} - ${name} ${lastname}`,
            value: numdocument,
          });
        } else {
          dataForStudents[index].data.porEvaluar.push({
            outcome: item.outcome,
            competence: item.competence,
            instructor: item.instructor,
            documentInstructor: item.documentInstructor,
            fstart: item.fstart ? item.fstart : null,
            fend: item.fend ? item.fend : null,
            color: item.color ? item.color : null,
            instructorEval: item.instructorEval ? item.instructorEval : " - ",
            status,
            judgment,
          });
        }
      });
    });

    try {
      //borrar el archivo de la ruta req.files.file.tempFilePath
      fs.unlinkSync(req.files.file.tempFilePath);
    } catch (error) {}

    await registerAction(
      "CARGA DE JUICIOS EVALUATIVOS",
      {
        event: "CARGAR JUICIOS EVALUATIVOS",
      },
      req.headers.token
    );

    res.json({
      msg: "Datos procesados correctamente",
      moreInfo,
      dataGroup,
      dataForStudents,
      listStudents,
    });
  } catch (error) {
    console.log(error);

    if (error) {
      return res.status(500).json({
        msg: error,
      });
    }
    return res.status(500).json({
      msg: "Error al procesar los datos,revise casillas vacias o que el diseño del archivo sea el correcto",
      error,
    });
  }
};

fileCtrl.generateSummaryExcel = async (req, res) => {
  let dataToExcel = [];
  try {
    //buscar todos lso programas
    const programsFound = await Program.find();

    //recorrer los programas y buscar las competencias y resultados
    for (let i = 0; i < programsFound.length; i++) {
      const program = programsFound[i];
      const competencesFound = await Competence.find({ program: program._id });

      for (let j = 0; j < competencesFound.length; j++) {
        const competence = competencesFound[j];
        const outcomesFound = await Outcome.find({
          competence: competence._id,
        });

        for (let k = 0; k < outcomesFound.length; k++) {
          const outcome = outcomesFound[k];
          dataToExcel.push({
            program: program.code + " - " + program.name,
            codecompetence: competence.number,
            competence: competence.name,
            codeoutcome: outcome.code,
            outcome: outcome.outcomes,
          });
        }
      }
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExcel);

    //agregar los datos al libro
    XLSX.utils.book_append_sheet(wb, ws, "Resumen de los programas");

    //escribir el archivo excel
    const __dirname = path.resolve();
    const filePath = path.join(
      __dirname,
      "tmp",
      "Resumen de los programas.xlsx"
    );
    XLSX.writeFile(wb, filePath);

    await registerAction(
      "RESUMEN DE PROGRAMAS",
      {
        event: "GENERAR ARCHIVO EXCEL DE RESUMEN DE PROGRAMAS",
      },
      req.headers.token
    );

    //enviar el archivo excel
    res.download(filePath);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al generar el archivo" });
  }
};

fileCtrl.getTowns = async (req, res) => {
  let infoTowns;
  try {
    //../uploads/towns.xlsx
    const excelFile = XLSX.readFile("./uploads/towns.xlsx");
    const sheetName = excelFile.SheetNames;

    //extraer la información de la hoja 1
    const sheet = excelFile.Sheets[sheetName[0]];

    //extraer desde la fila 2 hasta la 12
    infoTowns = XLSX.utils.sheet_to_json(sheet, {
      header: [, "departament", , "name"],
      range: 2,
      row: false,
      blankrows: false,
      defval: null,
      sheetStubs: true,
      cellDates: true,
    });

    /*   //eliminar los towns con el departamento de SANTANDER
    infoTowns = infoTowns.filter((item) => item.departament != "SANTANDER"); */

    //insertar todos los municipios en la base de datos
    Town.insertMany(infoTowns);

    res.json({ msg: "Datos cargados correctamente", infoTowns });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al descargar el archivo" });
  }
};

fileCtrl.readExcelInstructor = async (req, res) => {
  const { dataFile } = req;
  try {
    //crear las competencias en la base de datos en caso de que no existan
    for (let i = 0; i < dataFile.length; i++) {
      const {
        numdocument,
        emailpersonal,
        email,
        name,
        knowledge,
        tpdocument,
        phone,
        thematicarea,
        bindingtype,
        caphour,
      } = dataFile[i];

      //buscar si existe el instructor ya sea por el numero de documento o por el email
      const instructorFound = await Instructor.findOne({
        $or: [{ numdocument }, { emailpersonal }, { email }],
      });

      //si existe en el array más de una vez eliminarlo
      const index = dataFile.findIndex(
        (item) =>
          item.numdocument == numdocument ||
          item.emailpersonal == emailpersonal ||
          item.email == email ||
          item.name == name ||
          item.phone == phone
      );

      if (index !== i) {
        dataFile.splice(i, 1);
      }

      //si existe elininarlo del array
      if (instructorFound) {
        dataFile.splice(i, 1);
      } else {
        dataFile[i] = {
          name: name.toUpperCase().trim(),
          tpdocument: tpdocument.toUpperCase().trim(),
          numdocument: numdocument.trim(),
          emailpersonal: emailpersonal.toUpperCase().trim(),
          email: email.toUpperCase().trim(),
          phone,
          knowledge: knowledge.toUpperCase().trim(),
          thematicarea: thematicarea.toUpperCase().trim(),
          bindingtype: bindingtype.toUpperCase().trim(),
          caphour,
        };
      }
    }

    await Instructor.insertMany(dataFile);

    await registerAction(
      "CARGA MASIVA",
      {
        event: "CARGAR MASIVAMENTE DE INSTRUCTORES",
      },
      req.headers.token
    );
    res.json({ msg: "Datos cargados correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al cargar los datos" });
  }
};

export { fileCtrl };
