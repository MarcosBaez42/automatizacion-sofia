import tinify from "tinify";
import axios from "axios";
import fs from "fs";

let tipesNews = [
  "TRASLADO",
  "RETIRO VOLUNTARIO",
  "REINGRESO",
  "REINGRESO ESPECIAL",
  "APLAZAMIENTO",
  "DESERCIÓN",
];

const generateNameImg = (tpnew, document,fileName) => {
  //extraer el 2023-01-01
  const date = new Date().toISOString().split("T")[0];

  const extFiles= fileName.split('.')

  let extFile=extFiles[1]


  switch (tpnew) {
    case tipesNews[0]:
      return `traslado_${document}_${date}.${extFile}`;
    case tipesNews[1]:
      return `retiro_${document}_${date}.${extFile}`;
    case tipesNews[2]:
      return `reingreso_${document}_${date}.${extFile}`;
    case tipesNews[3]:
      return `reingreso_especial_${document}_${date}.${extFile}`;
    case tipesNews[4]:
      return `aplazamiento_${document}_${date}.${extFile}`;
    case tipesNews[5]:
      return `desercion_${document}_${date}.${extFile}`;
    default:
      return `otro_${document}_${date}.${extFile}`;
  }
};

async function downloadImage(imageUrl, nameImg) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer", // Set responseType to arraybuffer to handle binary data
    });

    const imageBuffer = Buffer.from(response.data, "binary");
    //guardar la imagen en la carpeta tmp
    const imageStream = fs.createWriteStream(`tmp/${nameImg}`);
    imageStream.write(imageBuffer);
    imageStream.end();

    //retornar la url de la imagen descargada
    return {
      name: nameImg,
      mimetype: "image/jpeg",
      path: `tmp/${nameImg}`,
    };
  } catch (error) {
    console.error("Error al descargar la imagen:", error);
  }
}

export async function compressImage(image, tpnew, document,fileName) {
  try {
    const nameImg = generateNameImg(tpnew, document,fileName);

    return {
      name: nameImg,
      mimetype: "image/jpeg",
      path: image,
    };

  } catch (error) {
    console.log(error);
  }
}
