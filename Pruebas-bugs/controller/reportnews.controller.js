import News from "../models/News.js";
import Improvement from "../models/Improvement.js";
import colorsEvents from "../utils/colors/colorsEvents.js";

const reportNewCtrl = {};

const months = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

reportNewCtrl.getReportBasic = async (req, res) => {
  try {
    const { fstart, fend } = req.body;
    let colors = [...colorsEvents];

    let newsByMonth = {
      months: [],
      news: [],
    };
    let newsAnual = [];

    //buscar todas las novedades del acta y agruparlas por meses y por tipo de novedad
    const news = await News.find({
      status: 0, //solo las novedades activas
      createdAt: {
        //reemplazar todos los / por - para que funcione en safari
        $gte: new Date(`${fstart.replace(/\//g, "-")}T00:00:00.000Z`),
        $lte: new Date(`${fend.replace(/\//g, "-")}T23:59:59.000Z`),
      },
    })
      .populate("coordination")
      .sort({ createdAt: 1 });

    news.forEach((n) => {
      const year = new Date(n.createdAt).getFullYear();
      const idMonth = new Date(n.createdAt).getMonth() + 1;
      const concatDate = `${new Date(n.createdAt).getMonth() + 1}${year}`;

      let indexMonth = newsByMonth.months.findIndex(
        (a) => a.idMonth == concatDate
      );
      let indexAnual = newsAnual.findIndex((a) => a.tpnew === n.tpnew);

      //data for char linear
      if (indexMonth === -1) {
        newsByMonth.months.push({
          idMonth: concatDate,
          nameMonth: months[idMonth - 1],
          dateMY: `${months[idMonth - 1]} ${year}`,
          count: 1,
        });

        //agregar a todos los tipos de novedades un cero a la data para indicar el valor del mes actual
        newsByMonth.news.forEach((item, index) => {
          newsByMonth.news[index].data.push(0);
        });
      } else {
        newsByMonth.months[indexMonth].count++;
      }

      //si el tipo de novedad ya existe, aumentar el valor del ultimo digito del array de data
      const indexTpNew = newsByMonth.news.findIndex(
        (item) => item.tpnew == n.tpnew
      );

      if (indexTpNew === -1) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        colors.splice(colors.indexOf(color), 1);
        newsByMonth.news.push({
          tpnew: n.tpnew,
          data: [],
          color: color.background,
          statusNews: [
            {
              state: n.state,
              count: 1,
            },
          ],
          coordinations: [
            {
              id: n.coordination?._id ?? "0",
              name: n.coordination?.name ?? "DESCONOCIDA",
              count: 1,
            },
          ],
        });

        for (let i = 1; i < newsByMonth.months.length; i++) {
          newsByMonth.news[newsByMonth.news.length - 1].data.push(0);
        }
        newsByMonth.news[newsByMonth.news.length - 1].data.push(1);
      } else {
        newsByMonth.news[indexTpNew].data[
          newsByMonth.news[indexTpNew].data.length - 1
        ]++;

        //si no existe el estado de novedad entre el array agregarlo de lo contrario aumentar el contador
        const existStateNew = newsByMonth.news[indexTpNew].statusNews.findIndex(
          (item) => item.state == n.state
        );

        if (existStateNew === -1) {
          newsByMonth.news[indexTpNew].statusNews.push({
            state: n.state,
            count: 1,
          });
        } else {
          newsByMonth.news[indexTpNew].statusNews[existStateNew].count++;
        }

        //si no existe la coordinación agregarla de lo contrario aumentar el contador

        const existCoord = newsByMonth.news[indexTpNew].coordinations.findIndex(
          (item) => (n.coordination?._id ?? "0") == item.id
        );

        if (existCoord === -1) {
          newsByMonth.news[indexTpNew].coordinations.push({
            id: n.coordination?._id ?? "0",
            name: n.coordination?.name ?? "DESCONOCIDA",
            count: 1,
          });
        } else {
          newsByMonth.news[indexTpNew].coordinations[existCoord].count++;
        }
      }

      //data for chart circular
      if (indexAnual === -1) {
        //validar si ya existe el mismo estado
        const color = colors[Math.floor(Math.random() * colors.length)];
        colors.splice(colors.indexOf(color), 1);
        newsAnual.push({
          tpnew: n.tpnew,
          count: 1,
          color: color.background,
          news: [
            {
              state: n.state,
              count: 1,
            },
          ],
          coordinations: [
            {
              id: n.coordination?._id ?? "0",
              name: n.coordination?.name ?? "DESCONOCIDA",
              count: 1,
            },
          ],
        });
      } else {
        newsAnual[indexAnual].count++;

        const indexNewAnual = newsAnual[indexAnual].news.findIndex(
          (i) => n.state == i.state
        );
        const indexCoorA = newsAnual[indexAnual].coordinations.findIndex(
          (i) => (n.coordination?._id ?? "0") == i.id
        );

        //agregar el tipo de estado de novedad en caso de no existir o aumentar el contador en caso de si existir
        if (indexNewAnual === -1) {
          newsAnual[indexAnual].news.push({
            state: n.state,
            count: 1,
          });
        } else {
          newsAnual[indexAnual].news[indexNewAnual].count++;
        }

        //agregar la coordinación en caso de no existir o auemntar el contador
        if (indexCoorA === -1) {
          newsAnual[indexAnual].coordinations.push({
            id: n.coordination?._id ?? "0",
            name: n.coordination?.name ?? "DESCONOCIDA",
            count: 1,
          });
        } else {
          newsAnual[indexAnual].coordinations[indexCoorA].count++;
        }
      }
    });

    res.json({
      newsAnual,
      newsByMonth,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

reportNewCtrl.getReportActa = async (req, res) => {
  const { acta } = req.body;
  try {
    //buscar todas las novedades del acta y agruparlas por meses y por tipo de novedad
    const news = await News.find({
      status: 0,
      acta,
    }).populate({
      path: "fiche",
      populate: {
        path: "program",
      },
    });

    res.json({ news });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

reportNewCtrl.getReportTypeNew = async (req, res) => {
  const { tpnew, coordination, fstart, fend } = req.body;
  try {
    const dateStart = new Date(`${fstart.replace(/\//g, "-")}T00:00:00.000Z`);
    const dateEnd = new Date(`${fend.replace(/\//g, "-")}T00:00:00.000Z`);

    let consult = {
      createdAt: {
        $gte: dateStart,
        $lte: dateEnd,
      },
      status: 0,
    };

    if (coordination != "TODAS") {
      consult.coordination = { $in: coordination };
    }
    if (tpnew != "TODOS") {
      consult.tpnew = tpnew.toUpperCase().trim();
    }

    const news = await News.find(consult).populate({
      path: "fiche",
      populate: {
        path: "program",
      },
    });

    res.json({ news });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

reportNewCtrl.getReportImprovement = async (req, res) => {
  const { fstart, fend } = req.body;
  try {
    let improvements;
    const dateStart = new Date(`${fstart.replace(/\//g, "-")}T00:00:00.000Z`);
    const dateEnd = new Date(`${fend.replace(/\//g, "-")}T00:00:00.000Z`);

    improvements = await Improvement.find({
      createdAt: {
        $gte: dateStart,
        $lte: dateEnd,
      },
    })
      .populate({
        path: "fiche",
        populate: {
          path: "program",
        },
      })
      .populate("competence outcome instructor");
    res.json({ improvements });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

reportNewCtrl.getReportStatus = async (req, res) => {
  const { state, fstart, fend } = req.body;
  console.log(state)
  console.log(fstart)
  console.log(fend)
  try {
    const dateStart = new Date(`${fstart.replace(/\//g, "-")}T00:00:00.000Z`);
    const dateEnd = new Date(`${fend.replace(/\//g, "-")}T00:00:00.000Z`);
    let consult = {
      createdAt: {
        $gte: dateStart,
        $lte: dateEnd,
      },
    };

    if (state != "TODOS") {
      consult.state = state.toUpperCase().trim();
    }

    const news = await News.find(consult).populate({
      path: "fiche",
      populate: {
        path: "program",
      },
    });

    console.log(news);

    res.json({ news });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

reportNewCtrl.getReportFiche = async (req, res) => {
  const { fiche } = req.body;
  try {
    const news = await News.find({
      fiche: fiche,
    }).populate({
      path: "fiche",
      populate: {
        path: "program",
      },
    });

    res.json({ news });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

reportNewCtrl.getReportStudent = async (req, res) => {
  const { student } = req.body;
  try {
    const news = await News.find({
      document: student,
      status: 0,
    }).populate({
      path: "fiche",
      populate: {
        path: "program",
      },
    });

    res.json({ news });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};
export { reportNewCtrl };
