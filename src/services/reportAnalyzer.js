import fs from 'fs';
import * as XLSX from 'xlsx/xlsx.mjs';
import {
  findHeaderIndex,
  findHeaderIndexes,
  normalizeText,
  parseExcelDate
} from '../utils/reportProcessing.js';

XLSX.set_fs(fs);

export function analyzeReport(reportPath) {
  const workbook = XLSX.readFile(reportPath, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('El reporte no contiene hojas para procesar');
  }
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: true
  });
  if (!rows.length) {
    return {
      graded: false,
      gradeStatus: 'Reporte sin información',
      gradeDate: null,
      qualifiableDate: null,
      gradedRows: [],
      pendingRows: [],
      statusIndex: -1,
      dateIndex: -1
    };
  }

  const headers = rows[0].map(value => (value == null ? '' : String(value)));
  const statusIndex = findHeaderIndex(headers, header =>
    header.includes('estado') && header.includes('calific')
  );
  const fallbackStatusIndex =
    statusIndex === -1
      ? findHeaderIndex(headers, header =>
          header.includes('estado') && header.includes('juicio')
        )
      : statusIndex;
  const resolvedStatusIndex =
    fallbackStatusIndex === -1
      ? findHeaderIndex(headers, header => header.includes('estado'))
      : fallbackStatusIndex;

  const dateIndex = findHeaderIndex(headers, header =>
    header.includes('fecha') && header.includes('calific')
  );
  const fallbackDateIndex =
    dateIndex === -1
      ? findHeaderIndex(headers, header => header.includes('fecha'))
      : dateIndex;
  const resolvedDateIndex = fallbackDateIndex;

  const gradedRows = [];
  const pendingRows = [];
  const qualifiableDateIndexes = findHeaderIndexes(
    headers,
    header => header.includes('fecha') && header.includes('calificable')
  );

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    if (!Array.isArray(row)) {
      continue;
    }
    const stateValue = resolvedStatusIndex >= 0 ? row[resolvedStatusIndex] : null;
    const normalized = normalizeText(stateValue);
    if (!normalized) {
      continue;
    }
    if (normalized.includes('sin calific') || normalized.includes('pendiente')) {
      pendingRows.push({ row, state: stateValue });
    } else if (normalized.includes('calific') || normalized.includes('aprob')) {
      gradedRows.push({ row, state: stateValue });
    }
  }

  const graded = gradedRows.length > 0 && pendingRows.length === 0;
  let gradeDate = null;
  let qualifiableDate = null;

  if (graded && resolvedDateIndex >= 0) {
    gradedRows.forEach(({ row }) => {
      const value = row[resolvedDateIndex];
      const parsed = parseExcelDate(value);
      if (parsed && (!gradeDate || parsed > gradeDate)) {
        gradeDate = parsed;
      }
    });
  }

  if (qualifiableDateIndexes.length > 0) {
    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i];
      if (!Array.isArray(row)) {
        continue;
      }
      for (const index of qualifiableDateIndexes) {
        const value = row[index];
        const parsed = parseExcelDate(value);
        if (parsed && (!qualifiableDate || parsed > qualifiableDate)) {
          qualifiableDate = parsed;
        }
      }
    }
  }

  const gradeStatus = graded
    ? 'Calificado'
    : pendingRows.length > 0
    ? 'Pendiente de Calificación'
    : 'Sin información de calificación';

  return {
    graded,
    gradeStatus,
    gradeDate,
    qualifiableDate,
    gradedRows,
    pendingRows,
    statusIndex: resolvedStatusIndex,
    dateIndex: resolvedDateIndex
  };
}