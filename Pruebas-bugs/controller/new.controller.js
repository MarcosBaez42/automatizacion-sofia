import News from "../models/News.js";
import Fiche from "../models/Fiche.js";
import Improvement from "../models/Improvement.js";
import Instructor from "../models/Instructor.js";
import registerAction from "../middlewares/binnacle.js";
import { uploadFile } from "../utils/uploadFiles/filesDrive.js";
import { compressImage } from "../utils/uploadFiles/tinifyService.js";
import sendEmail from "../utils/emails/sendEmail.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Coordination from "../models/Coordination.js";
import mongoose from "mongoose";

const newCtrl = {};

function generateHistoryText(dataArray) {
  if (dataArray.length === 0) {
    return '';  // Devuelve cadena vacía si el array está vacío
  }

  let historyText = 'Historial Novedad\n<br>';
  
  dataArray.forEach(item => {
    const date = new Date(item.date);
    const formattedDate = date.toISOString().split('T')[0]; // Formatear la fecha como YYYY-MM-DD
    historyText += `${formattedDate} - ${item.data}\n<br>`;
  });

  return historyText.trim(); // Retorna la cadena, eliminando el salto de línea al final
}

function getUserToken(token) {
  const result = jwt.verify(token, process.env.JWT_SECRET, {
    algorithm: "HS256",
  });
  return result.id;
}

async function getCoordinationsSearch(dataExtra, token) {
  try {
    let consult = {};
    const user = await User.findById(getUserToken(token));
    if (user && user.role === "COORDINADOR" && user.super !== 1) {
      const coor = await Coordination.find({ coordinator: user._id });
      coor ? (consult = { coordination: { $in: coor } }) : null;
    } else if (user && user.role === "PROGRAMADOR" && user.super !== 1) {
      const programmers = await Coordination.find({ programmers: user._id });

      programmers ? (consult = { coordination: { $in: programmers } }) : null;
    } else if (user && user.role === "NOVEDADES" && user.super !== 1) {
      user.coordinations
        ? (consult = { coordination: { $in: user.coordinations } })
        : null;
    }

    return { ...dataExtra, ...consult };
  } catch (err) {
    console.log(err);
    throw new Error(err.message);
  }
}

function generateHtml(
  name,
  document,
  ficheNumber,
  programName,
  code,
  tpnew,
  state = null,
  update = false,
  text=""
) {
  let html = `
  
    <p>
    CORDIAL SALUDO,
    <br>
    <br>
    La coordinación informa que para el aprendiz ${name} con documento ${document} 
    perteneciente a la ficha ${ficheNumber} - ${programName}
    se ha registrado una novedad de ${tpnew} con el código "${code}".
    <br>
    <br>
    Para más información, por favor comunicarse con la coordinación de su centro de formación.
    <br>
    </p>
    `;

  if (update) {
    html = `
    <p>
    CORDIAL SALUDO,
    <br>
    <br>
    La coordinación informa que para el aprendiz ${name} con documento ${document} 
    perteneciente a la ficha ${ficheNumber} - ${programName}
    se le ha actualizado la novedad de ${tpnew} con el código "${code}".
 <br>
    ${text}
    <br>
    
    ${state ? `La novedad en cuestión se encuentra en estado ${state}.` : ""}
    <br>
    <br>
    Para más información, por favor comunicarse con la coordinación de su centro de formación.
    <br>
    </p>
    `;
  }

  return html;
}

async function sendEmailNew(
  from = process.env.FROM_EMAIL,
  password = process.env.SECURY_EMAIL,
  emails,
  asunto,
  html,
  file = null
) {
  await sendEmail(
    from,
    password,
    emails,
    asunto,
    html,
    "./template/baseNew.hbs",
    file ? file : null
  );
}

//register new in the db
newCtrl.registerNew = async (req, res) => {
  let {
    tpnew,
    tpdocument,
    typetransfer,
    subtype,
    workingday,
    center,
    city,
    duration,
    document,
    name,
    email,
    phone,
    cause,
    datesofia,
    fiche,
    instructor,
  } = req.body;

  try {
    let urlImg = "";
    const findFiche = await Fiche.findById(fiche)
      .populate({
        path: "coordination",
        populate: {
          path: "coordinator",
        },
      })
      .populate("owner program");

    console.log(instructor !== "undefined");
    
    let instru, emailInstru;
    if (instructor !== "undefined") {
      instru = instructor;
      const instructorPublish = await Instructor.findById(instructor);
      emailInstru = instructorPublish.email;
    } else {
    //  instru = findFiche.owner._id;
    }

    if (req.files != null && req.files.file != null) {
      const { file } = req.files;

      const image = await compressImage(
        file.tempFilePath,
        tpnew,
        document,
        file.name
      );

      urlImg = await uploadFile(image, findFiche.coordination.namefoldernew, [
        process.env.FROM_EMAIL,
        findFiche.coordination.email,
      ]);
    }

    //generar codigo autoincremental
    let code = 1;

    const lastNews = await News.findOne().sort({ createdAt: -1 });

    if (lastNews) {
      code = lastNews.code + 1;
    }

    const data = {
      code,
      tpnew: tpnew.toUpperCase().trim(),
      tpdocument: tpdocument.toUpperCase().trim(),
      typetransfer: typetransfer?.toUpperCase().trim(),
      subtype: subtype?.toUpperCase().trim(),
      workingday: workingday?.toUpperCase().trim(),
      center: center?.toUpperCase().trim(),
      city: city?.toUpperCase().trim(),
      duration: duration ? parseInt(duration) : 0,
      document: document.toUpperCase().trim(),
      name: name.toUpperCase().trim(),
      email: email.toUpperCase().trim(),
      phone: phone.toUpperCase().trim(),
      cause: cause?.toUpperCase().trim(),
      datesofia: datesofia ? new Date(datesofia) : "",
      fiche,
      coordination: findFiche.coordination._id,
      img: urlImg,
      instructor: instru,
    };

    new News(data).save();

    console.log("findFiche  ", findFiche);

    await sendEmailNew(
      findFiche.coordination.email,
      findFiche.coordination.passapp,
      [
        findFiche.owner.email.trim(),
        findFiche.owner.emailpersonal?.trim(),
        findFiche.coordination.coordinator.email.trim(),
        email.toUpperCase().trim(),
        emailInstru ? emailInstru : undefined,
      ].filter((item) => item !== undefined),
      `${code} - REGISTRO DE ${tpnew.toUpperCase().trim()}`,
      {
        html: generateHtml(
          name.toUpperCase().trim(),
          document.toUpperCase().trim(),
          findFiche.number,
          findFiche.program.name.toUpperCase().trim(),
          code,
          tpnew.toUpperCase().trim()
        ),
      }
    );

    await registerAction(
      "NOVEDAD",
      {
        event: "REGISTRAR NOVEDAD",
        data: data,
      },
      req.headers.token
    );

    res.json({ msg: "Novedad registrada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//register new in the db
newCtrl.registerNewPublic = async (req, res) => {
  const {
    tpnew,
    tpdocument,
    typetransfer,
    subtype,
    workingday,
    center,
    city,
    document,
    name,
    email,
    phone,
    cause,
    datesofia,
    fiche,
  } = req.body;
  try {
    let code = 1;

    const { file, pdf } = req.files;

    const findFiche = await Fiche.findById(fiche)
      .populate({
        path: "coordination",
        populate: {
          path: "coordinator",
        },
      })
      .populate("owner program");

    const image = await compressImage(
      file.tempFilePath,
      tpnew,
      document,
      file.name
    );
    const urlImg = await uploadFile(
      image,
      findFiche.coordination.namefoldernew,
      [process.env.FROM_EMAIL, findFiche.coordination.email]
    );

    //genarate code autoincremental

    const lastNew = await News.findOne().sort({ createdAt: -1 });

    if (lastNew) {
      code = lastNew.code + 1 || 1;
    }

    //get email coordination and owner fiche

    await new News({
      code,
      tpnew: tpnew.toUpperCase().trim(),
      tpdocument: tpdocument.toUpperCase().trim(),
      typetransfer: typetransfer?.toUpperCase().trim(),
      subtype: subtype?.toUpperCase().trim(),
      workingday: workingday?.toUpperCase().trim(),
      center: center?.toUpperCase().trim(),
      city: city?.toUpperCase().trim(),
      document: document.toUpperCase().trim(),
      name: name.toUpperCase().trim(),
      email: email.toUpperCase().trim(),
      phone: phone.toUpperCase().trim(),
      cause: cause?.toUpperCase().trim(),
      datesofia: datesofia ? new Date(datesofia) : "",
      fiche,
      coordination: findFiche.coordination._id,
      img: urlImg,
    }).save();

    //enviar correos
    await sendEmailNew(
      findFiche.coordination.email,
      findFiche.coordination.passapp,
      [email.trim()],
      `${code} - REGISTRO EXITOSO DE SU NOVEDAD`,
      {
        html: `
        <p>
        Buen día, ${name.toUpperCase().trim()}<br>
        <br>
        Su novedad de ${tpnew
          .toUpperCase()
          .trim()} identificada con el código "${code}" ha sido registrada exitosamente.<br>
        A continuación, se relaciona una copia de la novedad en formato PDF.<br>
        <br>
        Para cualquier inquietud, por favor comunicarse con la coordinación de su centro de formación.<br>
        <br>
        </p>
        `,
      },
      [
        {
          filename: `${code}.pdf`,
          path: pdf.tempFilePath,
          contentType: pdf.contentType ?? "application/pdf",
        },
      ]
    );

    await sendEmailNew(
      findFiche.coordination.email,
      findFiche.coordination.passapp,
      [
        findFiche.owner.email.trim(),
        findFiche.owner.emailpersonal?.trim(),
        findFiche.coordination.coordinator.email.trim(),
      ],
      `${code} - REGISTRO DE ${tpnew.toUpperCase().trim()}`,
      {
        html: `
        <p>
        CORDIAL SALUDO Sr(a),
        <br>
        <br>
        Repfora informa que el aprendiz ${name
          .toUpperCase()
          .trim()} con documento ${document.toUpperCase().trim()} 
        perteneciente a la ficha ${findFiche.number} - ${findFiche.program.name
          .toUpperCase()
          .trim()}
        ha registrado una novedad de ${tpnew
          .toUpperCase()
          .trim()} con el código "${code}".
        <br>
        </p>
        `,
      }
    );

    res.json({ msg: "Novedad registrada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

newCtrl.registerImprovement = async (req, res) => {
  const {
    tpnew,
    tpdocument,
    document,
    name,
    email,
    phone,
    fiche,
    competence,
    outcome,
    activity,
    fend,
    instructor,
    status,
    type
  } = req.body;

  const findInstructor = await Instructor.findById(instructor);
  const findFiche = await Fiche.findById(fiche)
    .populate({
      path: "coordination",
      populate: {
        path: "coordinator",
      },
    })
    .populate("owner program");
  const lastImprovement = await Improvement.findOne().sort({ createdAt: -1 });

  //generar codigo autoincremental
  let code = 1;
  if (lastImprovement) {
    code = lastImprovement.code + 1;
  }

  const data = {
    code: code,
    tpnew: tpnew.toUpperCase().trim(),
    tpdocument: tpdocument.toUpperCase().trim(),
    document: document.toUpperCase().trim(),
    name: name.toUpperCase().trim(),
    email: email.toUpperCase().trim(),
    phone: phone.toUpperCase().trim(),
    fiche,
    coordination: findFiche.coordination._id,
    competence,
    outcome,
    activity: activity ? activity.toUpperCase().trim() : "",
    fend: new Date(fend),
    instructor,
    type,
    status: status?.toUpperCase().trim(),
  };

  await new Improvement(data).save();

  await sendEmailNew(
    findFiche.coordination.email,
    findFiche.coordination.passapp,
    [
      findFiche.owner.email.trim(),
      findFiche.owner.emailpersonal?.trim(),
      findFiche.coordination.coordinator.email.trim(),
      email.trim(),
    ],
    `${code} - REGISTRO DE ${tpnew.toUpperCase().trim()}`,
    {
      html: generateHtml(
        name.toUpperCase().trim(),
        document.toUpperCase().trim(),
        findFiche.number,
        findFiche.program.name.toUpperCase().trim(),
        code,
        tpnew.toUpperCase().trim()
      ),
    }
  );

  await sendEmailNew(
    findFiche.coordination.email,
    findFiche.coordination.passapp,
    [findInstructor.email.trim(), findInstructor.emailpersonal?.trim()],
    `${code} - ASIGNACIÓN DE ${tpnew.toUpperCase().trim()}`,
    {
      html: `
      <p>
      CORDIAL SALUDO Instructor(a) ${findInstructor.name.trim()},
      <br>
      <br>
      La coordinación le informa que se le ha ASIGNADO el siguiente plan de mejoramiento "${activity}" con el código "${code}"
      para el aprendiz ${name.trim()} con documento ${document.trim()} de la ficha ${
        findFiche.number
      } - ${findFiche.program.name.trim()}.<br>
      El plan de mejoramiento en cuestion tiene como fecha limite de entrega el
      ${new Date(fend)}.<br>
      <br>

      Recuerde hacer el siguiente procedimiento para la atención del plan de mejoramiento,
      para más información comunicarse con la coordinación de su centro de formación.<br>
      <br>

      </p>
      `,
    }
  );

  try {
    await registerAction(
      "NOVEDAD",
      {
        event: "REGISTRO DE PLAN DE MEJORAMIENTO",
        data: data,
      },
      req.headers.token
    );
    res.json({ msg: "Plan de mejoramiento registrado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//update new  in the db
newCtrl.updateNew = async (req, res) => {
  const { id } = req.params;
  const {
    tpnew,
    tpdocument,
    typetransfer,
    subtype,
    workingday,
    center,
    city,
    duration,
    document,
    name,
    email,
    phone,
    cause,
    datesofia,
    fiche,
    instructor,
  } = req.body;

  try {
    let urlImg = "";
    const findFiche = await Fiche.findById(fiche)
      .populate({
        path: "coordination",
        populate: {
          path: "coordinator",
        },
      })
      .populate("owner program");

    let instru, emailInstru;
    if (instructor) {
      instru = instructor;
      const instructorPublish = await Instructor.findById(instructor);
      emailInstru = instructorPublish.email;
    } 
    //TODO miguel
    // else instru = findFiche.owner._id;

    if (req.files != null && req.files.file != null) {
      const { file } = req.files;

      const image = await compressImage(
        file.tempFilePath,
        tpnew,
        document,
        file.name
      );
      urlImg = await uploadFile(
        image,
        findFiche.coordination.namefoldernew,
        [process.env.FROM_EMAIL, findFiche.coordination.email],
        req.newbd.img.id
      );
    }

    const data = {
      tpnew: tpnew.toUpperCase().trim(),
      tpdocument: tpdocument.toUpperCase().trim(),
      typetransfer: typetransfer?.toUpperCase().trim(),
      subtype: subtype?.toUpperCase().trim(),
      workingday: workingday?.toUpperCase().trim(),
      center: center?.toUpperCase().trim(),
      city: city?.toUpperCase().trim(),
      duration: duration ? parseInt(duration) : 0,
      document: document.toUpperCase().trim(),
      name: name.toUpperCase().trim(),
      email: email.toUpperCase().trim(),
      phone: phone.toUpperCase().trim(),
      cause: cause?.toUpperCase().trim(),
      datesofia: datesofia ? new Date(datesofia) : "",
      fiche,
      coordination: findFiche.coordination._id,
      instructor: instru,
    };

    if (urlImg) {
      data.img = urlImg;
    }

    const findNew = await News.findByIdAndUpdate(id, data, { new: true }); //new: true para que retorne el objeto actualizado

    await sendEmailNew(
      findFiche.coordination.email,
      findFiche.coordination.passapp,
      [
        findFiche.owner.email.trim(),
        findFiche.owner.emailpersonal?.trim(),
        findFiche.coordination.coordinator.email.trim(),
        email.trim(),
        emailInstru ? emailInstru : undefined,
      ].filter((item) => item !== undefined),
      `${findNew.code} - ACTUALIZACIÓN DE ${findNew.tpnew
        .toUpperCase()
        .trim()}`,
      {
        html: generateHtml(
          name.toUpperCase().trim(),
          document.toUpperCase().trim(),
          findFiche.number,
          findFiche.program.name.toUpperCase().trim(),
          findNew.code,
          tpnew.toUpperCase().trim(),
          null,
          true
        ),
      }
    );

    await registerAction(
      "NOVEDAD",
      {
        event: "ACTUALIZAR NOVEDAD",
        data: data,
      },
      req.headers.token
    );
    res.json({ msg: "Novedad actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//actualizar plan de mejoramiento
newCtrl.updateImprovement = async (req, res) => {
  const { id } = req.params;
  const {
    tpnew,
    tpdocument,
    document,
    name,
    email,
    phone,
    fiche,
    competence,
    outcome,
    activity,
    fend,
    status,
    type,
    instructor,
  } = req.body;
  try {
    const searchImprovement = await Improvement.findById(id).populate(
      "instructor"
    );
    const findInstructor = await Instructor.findById(instructor);
    const findFiche = await Fiche.findById(fiche)
      .populate({
        path: "coordination",
        populate: {
          path: "coordinator",
        },
      })
      .populate("owner program");
    const data = {
      tpnew: tpnew.toUpperCase().trim(),
      tpdocument: tpdocument.toUpperCase().trim(),
      document: document.toUpperCase().trim(),
      name: name.toUpperCase().trim(),
      email: email.toUpperCase().trim(),
      phone: phone.toUpperCase().trim(),
      fiche,
      coordination: findFiche.coordination._id,
      competence,
      outcome,
      activity: activity ? activity.toUpperCase().trim() : "",
      fend: new Date(fend),
      status: status.toUpperCase().trim(),
      type,
      instructor,
    };

    const findImprovement = await Improvement.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (searchImprovement.instructor != instructor) {
      await sendEmailNew(
        findFiche.coordination.email,
        findFiche.coordination.passapp,
        [
          searchImprovement.instructor.email.trim(),
          searchImprovement.instructor.emailpersonal?.trim(),
          emailInstru ? emailInstru : undefined,
        ].filter((item) => item !== undefined),
        `${findImprovement.code} - ACTUALIZACIÓN DE ${findImprovement.tpnew
          .toUpperCase()
          .trim()}`,
        {
          html: `
          <p>
          CORDIAL SALUDO Instructor(a) ${searchImprovement.instructor.name.trim()},
          <br>
          <br>
          La coordinación le informa que el plan de mejoramiento con el código "${
            findImprovement.code
          }"
           del aprendiz ${name.trim()} 
           ahora se encuentra asignado a otro instructor.<br>
           Agradecemos su colaboración en el proceso de formación de nuestros aprendices.
          <br>
          <br>
  
          </p>
          `,
        }
      );

      await sendEmailNew(
        findFiche.coordination.email,
        findFiche.coordination.passapp,
        [findInstructor.email.trim(), findInstructor.emailpersonal?.trim()],
        `${code} - ASIGNACIÓN DE ${tpnew.toUpperCase().trim()}`,
        {
          html: `
          <p>
          CORDIAL SALUDO Instructor(a) ${findInstructor.name.trim()},
          <br>
          <br>
          La coordinación le informa que se le ha asignado un plan de mejoramiento con el código "${code}"
          para el aprendiz ${name.trim()} con documento ${document.trim()} de la ficha ${
            findFiche.number
          } - ${findFiche.program.name.trim()}.<br>
          El plan de mejoramiento en cuestion debe ser atendido antes del ${
            new Date(fend).split("T")[0]
          }.<br>
          <br>
    
          Recuerde hacer el siguiente procedimiento para la atención del plan de mejoramiento,
          para más información comunicarse con la coordinación de su centro de formación.<br>
          <br>
    
          </p>
          `,
        }
      );
    }

    await sendEmailNew(
      findFiche.coordination.email,
      findFiche.coordination.passapp,
      [
        searchImprovement.instructor != instructor
          ? findInstructor.email.trim()
          : null,
        searchImprovement.instructor != instructor
          ? findInstructor.emailpersonal?.trim()
          : null,
        findFiche.coordination.coordinator.email.trim(),
        findFiche.owner.email.trim(),
        findFiche.owner.emailpersonal?.trim(),
        email.trim(),
      ],
      `${findImprovement.code} - ACTUALIZACIÓN DE ${findImprovement.tpnew
        .toUpperCase()
        .trim()}`,
      {
        html: generateHtml(
          name.toUpperCase().trim(),
          document.toUpperCase().trim(),
          findFiche.number,
          findFiche.program.name.toUpperCase().trim(),
          findImprovement.code,
          tpnew.toUpperCase().trim(),
          status.toUpperCase().trim(),
          true
        ),
      }
    );

    await registerAction(
      "NOVEDAD",
      {
        event: "ACTUALIZAR PLAN DE MEJORAMIENTO",
        data: data,
      },
      req.headers.token
    );
    res.json({ msg: "Plan de mejoramiento actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//actualizar novedad avanzada
newCtrl.updateAdvancedNew = async (req, res) => {
  const { id } = req.params;
  const { answers, numberact, datesofia, state, processed } = req.body;

  try {
    const answersFiltered = answers.filter((item) => item.data != "");
    const history = generateHistoryText(answersFiltered);
    const data = {
      answers: answersFiltered,
      acta: numberact,
      datesofia,
      state: state == "REGISTRADA" ? "EN PROCESO" : state,
      processed,
      dateprocessed: processed ? new Date() : "",
    };

    const updateNew = await News.findByIdAndUpdate(id, data, { new: true })
      .populate({
        path: "fiche",
        populate: {
          path: "program",
        },
      })
      .populate({
        path: "fiche",
        populate: {
          path: "owner",
        },
      })
      .populate({
        path: "coordination",
        populate: {
          path: "coordinator",
        },
      });

    if (processed) {
      await sendEmailNew(
        updateNew.coordination.email,
        updateNew.coordination.passapp,
        [
          updateNew.email.trim(),
          updateNew.fiche.owner.emailpersonal?.trim(),
          updateNew.fiche.owner.email.trim(),
          updateNew.coordination.coordinator.email.trim(),
        ],
        `${updateNew.code} - ACTUALIZACIÓN DE ${updateNew.tpnew
          .toUpperCase()
          .trim()}`,
        {
          html: generateHtml(
            updateNew.name.toUpperCase().trim(),
            updateNew.document.toUpperCase().trim(),
            updateNew.fiche.number,
            updateNew.fiche.program.name.toUpperCase().trim(),
            updateNew.code,
            updateNew.tpnew.toUpperCase().trim(),
            updateNew.state.toUpperCase().trim(),
            true,
            history
          ),
        }
      );
    }

    await registerAction(
      "NOVEDAD",
      {
        event: "ACTUALIZACIÓN AVANZADA NOVEDAD",
        data: data,
      },
      req.headers.token
    );

    res.json({ msg: "Novedad actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

newCtrl.updateMultiplesNew = async (req, res) => {
  const { news, answers, numberact, state, type, processed } = req.body;

  try {
    const answersFiltered = answers.filter((item) => item.data != "");
    const history = generateHistoryText(answersFiltered);
    //Para cada uno de los ids de news agregar más respuestas a cada uno de ellos y actulizar el estado en caso de que no sea null

    if (type == "acta") {
      //agregar el array de respuestas al array de respuestas que ya tiene la novedad

      if (state) {
        await News.updateMany(
          { _id: { $in: news } },
          {
            $push: { answers: { $each: answersFiltered } },
            $set: {
              state: state == "REGISTRADA" ? "EN PROCESO" : state,
              acta: numberact,
              processed,
              dateprocessed: processed ? new Date() : "",
            },
          }
        );
      } else {
        await News.updateMany(
          { _id: { $in: news } },
          {
            $push: { answers: { $each: answersFiltered } },
            $set: {
              processed,
              acta: numberact,
              dateprocessed: processed ? new Date() : "",
            },
          }
        );
      }
    } else if (type == "process") {
      //agregar el array de respuestas al array de respuestas que ya tiene la novedad

      if (state) {
        await News.updateMany(
          { _id: { $in: news } },
          {
            $push: { answers: { $each: answersFiltered } },
            $set: { state: state == "REGISTRADA" ? "EN PROCESO" : state },
          }
        );
      } else {
        await News.updateMany(
          { _id: { $in: news } },
          {
            $push: { answers: { $each: answersFiltered } },
          }
        );
      }
    }

    //seleccionar todos los correos de los aprendices,instructores y coordinadores de las novedades
    const newsSelected = await News.find({ _id: { $in: news } })
      .populate({
        path: "fiche",
        populate: {
          path: "program",
        },
      })
      .populate({
        path: "fiche",
        populate: {
          path: "owner",
        },
      })
      .populate({
        path: "coordination",
        populate: {
          path: "coordinator",
        },
      });

    if (processed) {
      for (let i = 0; i < newsSelected.length; i++) {
        await sendEmailNew(
          newsSelected[i].coordination.email,
          newsSelected[i].coordination.passapp,
          [
            newsSelected[i].email.trim(),
            newsSelected[i].fiche.owner.emailpersonal?.trim(),
            newsSelected[i].fiche.owner.email.trim(),
            newsSelected[i].coordination.coordinator.email.trim(),
          ],
          `${newsSelected[i].code} - ACTUALIZACIÓN DE ${newsSelected[i].tpnew
            .toUpperCase()
            .trim()}`,
          {
            html: generateHtml(
              newsSelected[i].name.toUpperCase().trim(),
              newsSelected[i].document.toUpperCase().trim(),
              newsSelected[i].fiche.number,
              newsSelected[i].fiche.program.name.toUpperCase().trim(),
              newsSelected[i].code,
              newsSelected[i].tpnew.toUpperCase().trim(),
              newsSelected[i].state.toUpperCase().trim(),
              true,
              history
            ),
          }
        );
      }
    }

    res.json({ msg: "Novedad actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

newCtrl.upgradePostponeNews = async (req, res) => {
  const { news } = req.body;

  try {
    //crear nuevas novedades a partir de los datos de los aplzamientos ya creados
    let newsSave = [];

    for (let i = 0; i < news.length; i++) {
      let dataNew = await News.findById(news[i])
        .populate({
          path: "fiche",
          populate: {
            path: "program",
          },
        })
        .populate({
          path: "fiche",
          populate: {
            path: "owner",
          },
        })
        .populate({
          path: "coordination",
          populate: {
            path: "coordinator",
          },
        });
      //generate code
      let code = 1;

      const lastNews = await News.findOne().sort({ createdAt: -1 });

      if (lastNews) {
        code = lastNews.code + 1;
      }

      newsSave.push({
        code,
        tpnew: "REINGRESO",
        tpdocument: dataNew.tpdocument,
        typetransfer: dataNew.typetransfer,
        subtype: dataNew.subtype,
        workingday: dataNew.workingday,
        center: dataNew.center,
        city: dataNew.city,
        duration: dataNew.duration,
        document: dataNew.document,
        name: dataNew.name,
        email: dataNew.email,
        phone: dataNew.phone,
        cause: dataNew.cause,
        datesofia: dataNew.datesofia,
        fiche: dataNew.fiche._id,
        coordination: dataNew.coordination._id,
        status: 0,
        state: "REGISTRADA",
        processed: false,
      });

      await sendEmailNew(
        dataNew.coordination.email,
        dataNew.coordination.passapp,
        [
          dataNew.email.trim(),
          dataNew.fiche.owner.emailpersonal?.trim(),
          dataNew.fiche.owner.email.trim(),
          dataNew.coordination.coordinator.email.trim(),
        ],
        `${code} - REGISTRO DE REINGRESO`,
        {
          html: generateHtml(
            dataNew.name.toUpperCase().trim(),
            dataNew.document.toUpperCase().trim(),
            dataNew.fiche.number,
            dataNew.fiche.program.name.toUpperCase().trim(),
            code,
            "REINGRESO"
          ),
        }
      );
    }

    await News.insertMany(newsSave);

    await registerAction(
      "NOVEDAD",
      {
        event: "MIGRACIÓN APLAZAMIENTOS",
        data: news,
      },
      req.headers.token
    );

    res.json({ msg: "Novedad actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get all news
newCtrl.getNews = async (req, res) => {
  const { status } = req.query;
  const { token } = req.headers;

  try {
    let consult = await getCoordinationsSearch(
      status ? (consult = { status }) : {},
      token
    );

    const news = await News.find(consult)
      .populate({
        path: "fiche",
        populate: {
          path: "program",
        },
      })
      .populate("instructor")
      .sort({ createdAt: -1 });

    //only news postponed
    let newsPostpone = news.filter(
      (newItem) =>
        newItem.tpnew === "APLAZAMIENTO" &&
        newItem.status === 0 &&
        newItem.processed === true
    );

    //ordenar los newsPostpone por fecha
    newsPostpone.sort((a, b) => {
      return new Date(b.datesofia) - new Date(a.datesofia);
    });

    res.json({
      news,
      newsPostpone,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

newCtrl.getItemsByFiche = async (req, res) => {
  const { fiche } = req.params;

  try {
    const ficheObjectId = new mongoose.Types.ObjectId(fiche);

    const news = await News.find({ fiche: ficheObjectId })
      .populate("fiche")
      .populate("coordination")
      .populate("instructor")
      .lean();

    const improvements = await Improvement.find({ fiche: ficheObjectId })
      .populate("fiche")
      .populate("coordination")
      .populate("instructor")
      .populate("competence")
      .populate("outcome")
      .lean();

    const combined = [
      ...news.map((item) => ({ ...item, source: "NEWS" })),
      ...improvements.map((item) => ({ ...item, source: "IMPROVEMENT" })),
    ];

    // Ordenar por fecha de creación (más reciente primero)
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json(combined);
  } catch (error) {
    console.error("Error al obtener datos por ficha:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
};

//get all news not processed
newCtrl.getNewsNotProcessed = async (req, res) => {
  const { token } = req.headers;
  try {
    let consult = await getCoordinationsSearch(
      { status: 0, processed: false },
      token
    );
    const news = await News.find(consult)
      .populate("fiche")
      .populate("instructor")
      .sort({ createdAt: -1 });

    res.json({ news });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get all news not processed and acta is null
newCtrl.getNewsNotProcessedActaNull = async (req, res) => {
  const { token } = req.headers;
  try {
    let consult = await getCoordinationsSearch(
      { status: 0, processed: false, acta: "" },
      token
    );

    const news = await News.find(consult)
      .populate("fiche")
      .populate("instructor")
      .sort({ createdAt: -1 });
    res.json({ news });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get news by id
newCtrl.getNewId = async (req, res) => {
  const { id } = req.params;
  try {
    let newSearch = await News.findById(id)
      .populate({
        path: "fiche",
        populate: {
          path: "program",
        },
      })
      .populate("instructor");

    //ordenar las answers por fecha
    newSearch.answers.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    res.json(newSearch);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get news by id instructor
newCtrl.getNewsByInstructor = async (req, res) => {
  const { id } = req.params;
  try {
    //traer el programa de fiche que se ecnuentra en la novedad yo ordenar las answers por fecha
    let improvements = await Improvement.find({ instructor: id })
      .populate({
        path: "fiche",
        populate: {
          path: "program",
        },
      })
      .populate("competence outcome")
  

    //recorrer las novedades y dar un indice a cada new
    improvements.forEach((newItem, index) => {
      newItem.index = index + 1;
    });

    let news = await News.find({ instructor: id })
    .populate({
      path: "fiche",
      populate: {
        path: "program",
      },
    })
    .populate("instructor");

    news.forEach((newItem, index) => {
      newItem.index = index + 1;
    });

    res.json({ improvements, news });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//get all improvement
newCtrl.getImprovement = async (req, res) => {
  const { token } = req.headers;
  try {
    const consult = await getCoordinationsSearch({}, token);

    const improvement = await Improvement.find(consult)
      .populate({
        path: "fiche",
        populate: {
          path: "program",
        },
      })
      .populate("instructor")
      .sort({ createdAt: -1 });

    res.json(improvement);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//active new in the db
newCtrl.activeNew = async (req, res) => {
  const { id } = req.params;
  try {
    const newSearch = await News.findById(id);
    if (newSearch && newSearch.processed) {
      return res
        .status(400)
        .json({ msg: "No es posible eliminar una novedad ya finalizada" });
    }

    await News.findByIdAndUpdate(id, { status: 0 });

    await registerAction(
      "NOVEDAD",
      {
        event: "ACTIVAR NOVEDAD",
        data: { id },
      },
      req.headers.token
    );

    res.json({ msg: "Novedad activada correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//inactivate new in the db
newCtrl.inactiveNew = async (req, res) => {
  const { id } = req.params;
  try {
    await News.findByIdAndUpdate(id, { status: 1 });

    await registerAction(
      "NOVEDAD",
      {
        event: "INACTIVAR NOVEDAD",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Novedad inactivada correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

//aprove imporvement in the db
newCtrl.aproveNew = async (req, res) => {
  const { newid } = req.body;
  try {
    const updateImprove = await Improvement.findByIdAndUpdate(newid, {
      status: "APROBADO",
    })
      .populate({
        path: "fiche",
        populate: {
          path: "program",
        },
      })
      .populate({
        path: "fiche",
        populate: {
          path: "owner",
        },
      })
      .populate("coordination instructor");

    await sendEmailNew(
      updateImprove.coordination.email,
      updateImprove.coordination.passapp,
      [
        updateImprove.email.trim(),
        updateImprove.emailpersonal?.trim(),
        updateImprove.coordination.coordinator.email?.trim(),
        updateImprove.fiche.owner.email?.trim(),
        updateImprove.fiche.owner.emailpersonal?.trim(),
        updateImprove.email?.trim(),
      ],
      `${updateImprove.code} - PLAN DE MEJORAMIENTO APROBADO`,
      {
        html: generateHtml(
          updateImprove.name.toUpperCase().trim(),
          updateImprove.document.toUpperCase().trim(),
          updateImprove.fiche.number,
          updateImprove.fiche.program.name.toUpperCase().trim(),
          updateImprove.code,
          updateImprove.tpnew.toUpperCase().trim(),
          updateImprove.status.toUpperCase().trim(),
          true
        ),
      }
    );

    await registerAction(
      "NOVEDAD",
      {
        event: "APROBAR NOVEDAD",
        data: { newid },
      },
      req.headers.token
    );
    res.json({ msg: "Novedad inactivada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

newCtrl.notAproveNew = async (req, res) => {
  const { newid } = req.body;
  try {
    const updateImprove = await Improvement.findByIdAndUpdate(
      newid,
      { status: "NO APROBADO" },
      { new: true }
    )
      .populate({
        path: "fiche",
        populate: {
          path: "program",
        },
      })
      .populate({
        path: "fiche",
        populate: {
          path: "owner",
        },
      })
      .populate("coordination instructor");

    await sendEmailNew(
      updateImprove.coordination.email,
      updateImprove.coordination.passapp,
      [
        updateImprove.email.trim(),
        updateImprove.emailpersonal?.trim(),
        updateImprove.coordination.coordinator.email?.trim(),
        updateImprove.fiche.owner.email?.trim(),
        updateImprove.fiche.owner.emailpersonal?.trim(),
        updateImprove.email?.trim(),
      ],
      `${updateImprove.code} - PLAN DE MEJORAMIENTO NO APROBADO`,
      {
        html: generateHtml(
          updateImprove.name.toUpperCase().trim(),
          updateImprove.document.toUpperCase().trim(),
          updateImprove.fiche.number,
          updateImprove.fiche.program.name.toUpperCase().trim(),
          updateImprove.code,
          updateImprove.tpnew.toUpperCase().trim(),
          updateImprove.status.toUpperCase().trim(),
          true
        ),
      }
    );

    await registerAction(
      "NOVEDAD",
      {
        event: "NO APROBAR NOVEDAD",
        data: { newid },
      },
      req.headers.token
    );
    res.json({ msg: "Novedad inactivada correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

newCtrl.sendEmailNew = async (req, res) => {
  const { id } = req.params;
  try {
    const searchImprovement = await Improvement.findById(id)
      .populate({
        path: "fiche",
        populate: {
          path: "program",
        },
      })
      .populate({
        path: "fiche",
        populate: {
          path: "owner",
        },
      })
      .populate({
        path: "coordination",
        populate: {
          path: "coordinator",
        },
      })
      .populate("instructor");

    await sendEmailNew(
      searchImprovement.coordination.email,
      searchImprovement.coordination.passapp,
      [
        searchImprovement.email.trim(),
        searchImprovement.emailpersonal?.trim(),
        searchImprovement.coordination.coordinator.email?.trim(),
        searchImprovement.fiche.owner.email?.trim(),
        searchImprovement.fiche.owner.emailpersonal?.trim(),
        searchImprovement.email.trim(),
      ],
      `${searchImprovement.code} - RECORDATORIO PLAN DE MEJORAMIENTO`,
      {
        html: `
        <p>
        CORDIAL SALUDO,
        <br>
        <br>
        La coordinación informa que para el aprendiz ${searchImprovement.name.trim()} 
        con documento ${searchImprovement.document.trim()} 
        perteneciente a la ficha ${
          searchImprovement.fiche.number
        } - ${searchImprovement.fiche.program.name.trim()}
          tiene un plan de mejoramiento en estado ${searchImprovement.status} 
          con fecha de finalización ${searchImprovement.fend}
        <br>
        Por favor tome las medidas necesarias para finalizar el plan de mejoramiento.
        <br>
        <br>
        Para cualquier inquietud, por favor comunicarse con la coordinación de su centro de formación.
        </p>
        `,
      }
    );

    await registerAction(
      "NOVEDAD",
      {
        event: "NOTIFICAR PLAN DE MEJORAMIENTO",
        data: { id },
      },
      req.headers.token
    );
    res.json({ msg: "Novedad inactivada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { newCtrl };
