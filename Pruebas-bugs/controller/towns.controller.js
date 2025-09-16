/**
 * @file This file contains the controller functions for managing towns in the database.
 * @module townsController
 * @requires ../models/Town.js
 */
import Town from "../models/Town.js";
/**
 * @description Object containing the controller functions for towns.
 * @const {Object} townsCtrl
 */
const townsCtrl = {};

/**
 * @description Registers a new town in the database.
 * @function registerTown
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.body.name - The name of the town.
 * @param {string} req.body.departament - The department where the town is located.
 * @returns {Object} - The response object with a success or error message.
 */
townsCtrl.registerTown = async (req, res) => {
  const { name, departament } = req.body;

  const municipiosSantander = [
    "Aguada",
    "Albania",
    "Almeida",
    "Amparo",
    "Aratoca",
    "Barbosa",
    "Barichara",
    "Barrancabermeja",
    "Betulia",
    "Bolívar",
    "Bucaramanga",
    "Cabrera",
    "California",
    "Capitanejo",
    "Carcasí",
    "Cepitá",
    "Cerrito",
    "Charalá",
    "Charta",
    "Chima",
    "Chipatá",
    "Cimitarra",
    "Concepción",
    "Confines",
    "Contratación",
    "Coromoro",
    "Curití",
    "El Carmen de Chucurí",
    "El Guacamayo",
    "El Peñón",
    "El Playón",
    "Encino",
    "Enciso",
    "Florián",
    "Floridablanca",
    "Galán",
    "Gambita",
    "Girón",
    "Guaca",
    "Guadalupe",
    "Guapotá",
    "Guavatá",
    "Güepsa",
    "Hato",
    "Jesús María",
    "Jordán",
    "La Belleza",
    "La Paz",
    "Landázuri",
    "Lebrija",
    "Los Santos",
    "Macaravita",
    "Málaga",
    "Matanza",
    "Mogotes",
    "Molagavita",
    "Ocamonte",
    "Oiba",
    "Onzaga",
    "Palmar",
    "Palmas del Socorro",
    "Páramo",
    "Piedecuesta",
    "Pinchote",
    "Puente Nacional",
    "Puerto Parra",
    "Puerto Wilches",
    "Rionegro",
    "Sabana de Torres",
    "San Andrés",
    "San Benito",
    "San Gil",
    "San Joaquín",
    "San José de Miranda",
    "San Miguel",
    "San Vicente de Chucurí",
    "Santa Bárbara",
    "Santa Helena del Opón",
    "Simacota",
    "Socorro",
    "Suaita",
    "Sucre",
    "Suratá",
    "Tona",
    "Valle de San José",
    "Vélez",
    "Vetas",
    "Villanueva",
    "Zapatoca",
  ];

  try {
    for (let i = 0; i < municipiosSantander.length; i++) {
      const town = await Town.create({
        name: municipiosSantander[i].toUpperCase().trim(),
        departament: "SANTANDER",
      });

      await town.save();
    }

    res.json({ msg: "Municipio registrado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * @description Gets all towns from the database.
 * @function getTowns
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.query.status - The status of the towns to retrieve.
 * @returns {Object} - The response object with the list of towns or an error message.
 */
townsCtrl.getTowns = async (req, res) => {
  const { status } = req.query;
  try {
    const towns = await Town.find({ status: status });

    res.json(towns);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

townsCtrl.getDepartaments = async (req, res) => {
  try {
    const departaments = await Town.find().distinct("departament");

    res.json(departaments);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

townsCtrl.getTownsByDepartament = async (req, res) => {
  const { departament } = req.params;
  try {
    const towns = await Town.find({ departament: departament });

    res.json(towns);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { townsCtrl };
