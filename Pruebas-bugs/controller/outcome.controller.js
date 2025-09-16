import Outcome from "../models/Outcome.js";
import registerAction from "../middlewares/binnacle.js";

const outcomeCtrl = {};

//register new outcome in the db
outcomeCtrl.registerOutcome = async (req, res) => {
  const { outcomes, competence } = req.body;
  const { existOutcomes, codesOutcomes } = req;

  try {
    for (let i = 0; i < outcomes.length; i++) {
      //validar if outcome exist en codesOutcomes
      if (codesOutcomes) {
        let index = codesOutcomes.findIndex(
          (code) =>
            code.toString().toUpperCase().trim() ===
            outcomes[i].code.toUpperCase().trim()
        );

        if (index !== -1) {
          continue;
        }
      }

      const newOutcome = await Outcome.create({
        outcomes: outcomes[i].name.toUpperCase().trim(),
        code: outcomes[i].code.toUpperCase().trim(),
        competence,
      });

      await newOutcome.save();
    }

    if (existOutcomes) {
      return res.json({ msg: existOutcomes });
    }
    await registerAction(
      "RESULTADO",
      {
        event: "REGISTRAR RESULTADO",
        data: outcomes,
      },
      req.headers.token
    );
    return res.json({ msg: "Resultados registrados correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//update outcome in the db
outcomeCtrl.updateOutcome = async (req, res) => {
  const { outcome, name, code, competence } = req.body;

  try {
    await Outcome.findByIdAndUpdate(outcome, {
      outcomes: name.toUpperCase().trim(),
      code: code.toUpperCase().trim(),
      competence,
    });
    await registerAction(
      "RESULTADO",
      {
        event: "ACTUALIZAR RESULTADO",
        data: { name, code, competence },
      },
      req.headers.token
    );
    res.json({ msg: "Resultado actualizado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get outcome by competence
outcomeCtrl.getOutcomesByComp = async (req, res) => {
  const { id } = req.params;
  try {
    const outcomes = await Outcome.find({ competence: id })
      .populate("competence")
      .sort({ createdAt: -1 });
    let groupByCompetence = [];

    outcomes.forEach((outcome) => {
      let index = groupByCompetence.findIndex(
        (competence) => competence.competence == outcome.competence._id
      );

      if (index == -1) {
        groupByCompetence.push({
          competence: outcome.competence._id,
          namecompetence: outcome.competence.name,
          outcomes: [
            {
              outcomes: outcome.outcomes,
              _id: outcome._id,
              code: outcome.code,
              status: outcome.status,
            },
          ],
        });
      } else {
        groupByCompetence[index].outcomes.push({
          outcomes: outcome.outcomes,
          _id: outcome._id,
          code: outcome.code,
          status: outcome.status,
        });
      }
    });

    res.json(groupByCompetence);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get all outcomes in the db
outcomeCtrl.getOutcomes = async (req, res) => {
  const { status } = req.query;
  try {
    const outcomes = await Outcome.find(status ? { status } : {})
      .populate("competence")
      .sort({ createdAt: -1 });
    console.log(outcomes);

    let groupByCompetence = [];

    outcomes.forEach((outcome) => {
      let index = groupByCompetence.findIndex(
        (competence) => competence.competence == outcome.competence._id
      );

      if (index == -1) {
        groupByCompetence.push({
          competence: outcome.competence._id,
          namecompetence: outcome.competence.name,
          outcomes: [
            {
              outcomes: outcome.outcomes,
              _id: outcome._id,
              code: outcome.code,
              status: outcome.status,
            },
          ],
        });
      } else {
        groupByCompetence[index].outcomes.push({
          outcomes: outcome.outcomes,
          _id: outcome._id,
          code: outcome.code,
          status: outcome.status,
        });
      }
    });

    res.json(groupByCompetence);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get the ultimate 100 outcomes in the db
outcomeCtrl.getOutcomesLimit = async (req, res) => {
  try {
    const outcomes = await Outcome.find()
      .populate("competence")
      .sort({ createdAt: -1 })
      .limit(100);

    let groupByCompetence = [];

    outcomes.forEach((outcome) => {
      let index = groupByCompetence.findIndex(
        (competence) => competence.competence == outcome.competence._id
      );

      if (index == -1) {
        groupByCompetence.push({
          competence: outcome.competence._id,
          namecompetence: outcome.competence.name,
          outcomes: [
            {
              outcomes: outcome.outcomes,
              _id: outcome._id,
              code: outcome.code,
              status: outcome.status,
            },
          ],
        });
      } else {
        groupByCompetence[index].outcomes.push({
          outcomes: outcome.outcomes,
          _id: outcome._id,
          code: outcome.code,
          status: outcome.status,
        });
      }
    });

    res.json(groupByCompetence);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get outcome by id in the db
outcomeCtrl.getOutcomeId = async (req, res) => {
  const { id } = req.params;
  try {
    const outcome = await Outcome.findById(id).populate("competence");
    res.json(outcome);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//active outcome in the db
outcomeCtrl.activeOutcome = async (req, res) => {
  const { id } = req.params;
  try {
    await Outcome.findByIdAndUpdate(id, { status: 0 });
    await registerAction(
      "RESULTADO",
      {
        event: "ACTIVAR RESULTADO",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Resultado activado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//inactivate outcome in the db
outcomeCtrl.inactiveOutcome = async (req, res) => {
  const { id } = req.params;
  try {
    await Outcome.findByIdAndUpdate(id, { status: 1 });
    await registerAction(
      "RESULTADO",
      {
        event: "DESACTIVAR RESULTADO",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Resultado desactivado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { outcomeCtrl };
