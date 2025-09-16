const formatDate12Hours = (date) => {
  const currentDate = new Date();
  let dateFormated = `${
    currentDate.toISOString().split("T")[0]
  }T${date}:00.000Z`;

  //retornar solo la hora y minutos sin cambiar el FORMATO DE HORA Y FECHA
  const dateNew = new Date(dateFormated);

  let hours = dateNew.getUTCHours();
  const AmOrPm = hours >= 12 ? "P.M." : "A.M.";
  hours = hours % 12 || 12;
  const minutes = dateNew.getUTCMinutes();

  return hours + ":" + (minutes == 0 ? "00" : minutes) + " " + AmOrPm;
};

/**
 * Calculates the difference in minutes between two dates
 * @function
 * @memberof scheduleCtrl
 * @name calculateNumHoursWork
 * @param {string} hour1 - The start time of the first date
 * @param {string} hour2 - The start time of the second date
 * @param {number} cuantityEvents - The number of events to calculate the difference for
 * @returns {number} The difference in hours multiplied by the number of events
 */
const calculateNumHoursWork = (hour1, hour2, cuantityEvents) => {
  const dateStart = new Date(`2023-05-01T${hour1}:00.000Z`);
  const dateEnd = new Date(`2023-05-01T${hour2}:00.000Z`);
  const diference = dateEnd.getTime() - dateStart.getTime();
  const minutes = Math.round(diference / 60000);
  const hours = parseFloat(minutes / 60).toFixed(2);
  return hours * parseInt(cuantityEvents);
};

const dateFormater = (date, hour = null) => {
  const dateNew = new Date(date);
  let dateFormated;

  if (!hour) {
    dateFormated = new Date(
      `${dateNew.toISOString().split("T")[0]}T00:00:00.000Z`
    );
  } else {
    dateFormated = new Date(
      `${dateNew.toISOString().split("T")[0]}T${hour}:00.000Z`
    );
  }

  return dateFormated;
};

//validar si dos fechas tienen una diferencia mayor a 12 meses

const differenceBetweenDates = (fstart, fend) => {
  const dateStart = new Date(fstart);
  const dateEnd = new Date(fend);
  const months = (dateEnd - dateStart) / (1000 * 60 * 60 * 24 * 30);
  return months;
};


export { formatDate12Hours, calculateNumHoursWork, dateFormater, differenceBetweenDates };
