import * as XLSX from "xlsx/xlsx.mjs";

/* load 'fs' for readFile and writeFile support */
import * as fs from "fs";
import dataknowledge from "../utils/knowledge/dataKnowledge.js";

XLSX.set_fs(fs);

/**
 * A helper object for generating information from an Excel file.
 * @namespace fileHelper
 */
const fileHelper = {};

/**
 * Generates information from an Excel file.
 * @async
 * @function generateInfoOfExcel
 * @memberof fileHelper
 * @param {Object} file - The file object to generate information from.
 * @param {Object} req - The request object.
 * @throws {Error} If any required data is missing.
 * @returns {Promise<void>}
 */
fileHelper.generateInfoOfExcel = async (file, req) => {
  const excelFile = XLSX.readFile(file.tempFilePath);
  const sheetName = excelFile.SheetNames;

  const sheet = excelFile.Sheets[sheetName[0]];
  //hacer que el json tenga un array de objetos, cada uno con la propiedad number, month, letter

  const data = XLSX.utils.sheet_to_json(sheet, {
    header: ["codecompetence", "namecompetence", "codeoutcome", "outcome"],
    range: 1, //para que empiece a leer desde la fila 2
    row: false, //para que los datos los tome como columnas
    blankrows: false, //para no incluir las filas en blanco
    defval: null, //para que los datos vacíos los tome como null
    cellDates: true, //para que las fechas las tome como fechas
    sheetStubs: true, //para que las celdas vacías las tome como null
  });

  //validar datos vacíos
  data.forEach((element) => {
    if (!element.codecompetence) {
      throw new Error("El código de la competencia no puede estar vacío");
    }
    if (!element.namecompetence) {
      throw new Error("El nombre de la competencia no puede estar vacío");
    }
    if (!element.codeoutcome) {
      throw new Error("El código del resultado no puede estar vacío");
    }

    if (!element.outcome) {
      throw new Error("El outcome de la competencia no puede estar vacío");
    }
  });

  req.dataFile = data;

  //borrar el archivo de la carpeta tmp (file.tempFilePath
  fs.unlinkSync(file.tempFilePath);
};

fileHelper.generateInfoOfExcelInst = async (file, req) => {
  const tpdocuments = ["CC", "CE", "NIT", "PASAPORTE"];
  const typesBinding = ["PLANTA", "CONTRATISTA"];

  const excelFile = XLSX.readFile(file.tempFilePath);
  const sheetName = excelFile.SheetNames;

  const sheet = excelFile.Sheets[sheetName[0]];
  //hacer que el json tenga un array de objetos, cada uno con la propiedad number, month, letter

  const data = XLSX.utils.sheet_to_json(sheet, {
    header: [
      "name",
      "tpdocument",
      "numdocument",
      "emailpersonal",
      "email",
      "phone",
      "knowledge",
      "thematicarea",
      "bindingtype",
      "caphour",
    ],
    range: 1, //para que empiece a leer desde la fila 2
    row: false, //para que los datos los tome como columnas
    blankrows: false, //para no incluir las filas en blanco
    defval: null, //para que los datos vacíos los tome como null
    cellDates: true, //para que las fechas las tome como fechas
    sheetStubs: true, //para que las celdas vacías las tome como null
  });


  //validar datos vacíos
  data.forEach((element) => {
    if (!element.name) {
      throw new Error("El nombre del instructor no puede estar vacío");
    }
    element.name = element.name.toUpperCase().trim();

    if (!element.tpdocument) {
      throw new Error(
        "El tipo de documento del instructor no puede estar vacío"
      );
    }

    element.tpdocument = element.tpdocument.toUpperCase().trim();

    if (!tpdocuments.includes(element.tpdocument)) {
      throw new Error("El tipo de documento del instructor no es valido");
    }
    if (!element.numdocument) {
      throw new Error(
        "El número de documento del instructor no puede estar vacío"
      );
    }
    if (!element.emailpersonal) {
      throw new Error("El email personal del instructor no puede estar vacío");
    }
    if (!element.email) {
      throw new Error("El email del instructor no puede estar vacío");
    }
    if (!element.phone) {
      throw new Error("El teléfono del instructor no puede estar vacío");
    }
    if (!element.knowledge) {
      throw new Error(
        "La red de conocimiento del instructor no puede estar vacío"
      );
    }

    let knowledgeString = element.knowledge.toUpperCase().trim();
    knowledgeString = knowledgeString.replace(/__/g, ", ");
    knowledgeString = knowledgeString.replace(/_/g, " ");

    element.knowledge = knowledgeString;
  
    const knowledge = dataknowledge.find(
      (element) => element.red === knowledgeString
    );

    if (!knowledge) {
      throw new Error("La red de conocimiento del instructor no fue encontrada");
    }

    if (!element.thematicarea) {
      throw new Error("El área temática del instructor no puede estar vacío");
    }

    element.thematicarea = element.thematicarea.toUpperCase().trim();

    if (!knowledge.areas.includes(element.thematicarea)) {
      throw new Error(
        "El área temática del instructor no pertenece a la red de conocimiento seleccionada"
      );
    }

    if (!element.bindingtype) {
      throw new Error(
        "El tipo de vinculación del instructor no puede estar vacío"
      );
    }
    if (!typesBinding.includes(element.bindingtype)) {
      throw new Error("El tipo de vinculación del instructor no es valido");
    }

    element.bindingtype = element.bindingtype.toUpperCase().trim();
  });


  req.dataFile = data;

  //borrar el archivo de la carpeta tmp (file.tempFilePath
  fs.unlinkSync(file.tempFilePath);
};

export { fileHelper };
