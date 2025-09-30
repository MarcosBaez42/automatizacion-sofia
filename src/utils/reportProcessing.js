import * as XLSX from 'xlsx/xlsx.mjs';

/**
 * Normalizes a textual value by removing diacritics, trimming whitespace and
 * lowercasing the result. Non-string values are converted to strings before
 * normalization and `null`/`undefined` values return an empty string.
 *
 * @param {unknown} value - Raw value to normalize.
 * @returns {string} Normalized string representation of the input.
 */
export function normalizeText(value) {
  if (value == null) {
    return '';
  }
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Finds the index of a column header that matches the provided predicate.
 *
 * @param {Array<unknown>} headers - List of headers from the spreadsheet.
 * @param {(normalizedValue: string) => boolean} predicate - Predicate applied to
 *   the normalized header values.
 * @returns {number} Index of the first header that satisfies the predicate or
 *   `-1` when there is no match.
 */
export function findHeaderIndex(headers, predicate) {
  for (let i = 0; i < headers.length; i += 1) {
    const header = headers[i];
    if (!header) continue;
    const normalized = normalizeText(header);
    if (predicate(normalized)) {
      return i;
    }
  }
  return -1;
}

/**
 * Finds the indexes of all column headers that satisfy the provided
 * predicate.
 *
 * @param {Array<unknown>} headers - List of headers from the spreadsheet.
 * @param {(normalizedValue: string) => boolean} predicate - Predicate applied to
 *   the normalized header values.
 * @returns {Array<number>} Indexes of the headers that satisfy the predicate.
 */
export function findHeaderIndexes(headers, predicate) {
  const indexes = [];
  for (let i = 0; i < headers.length; i += 1) {
    const header = headers[i];
    if (!header) continue;
    const normalized = normalizeText(header);
    if (predicate(normalized)) {
      indexes.push(i);
    }
  }
  return indexes;
}

/**
 * Parses the value found in a spreadsheet cell into a JavaScript `Date`.
 *
 * @param {unknown} value - Raw value from the cell.
 * @returns {Date|null} Parsed date when the value is recognized as a temporal
 *   representation or `null` otherwise.
 */
export function parseExcelDate(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) {
      return null;
    }
    return new Date(
      parsed.y,
      (parsed.m || 1) - 1,
      parsed.d || 1,
      parsed.H || 0,
      parsed.M || 0,
      parsed.S || 0
    );
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const customMatch = trimmed.match(
      /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:\s+(\d{1,2})(?::(\d{1,2})(?::(\d{1,2}))?)?)?$/
    );

    if (customMatch) {
      const [, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = customMatch;
      const day = Number(dayStr);
      const monthIndex = Number(monthStr) - 1;
      const year = Number(yearStr);
      const hour = hourStr ? Number(hourStr) : 0;
      const minute = minuteStr ? Number(minuteStr) : 0;
      const second = secondStr ? Number(secondStr) : 0;

      if (
        Number.isNaN(day) ||
        Number.isNaN(monthIndex) ||
        Number.isNaN(year) ||
        Number.isNaN(hour) ||
        Number.isNaN(minute) ||
        Number.isNaN(second)
      ) {
        return null;
      }

      if (
        day < 1 ||
        day > 31 ||
        monthIndex < 0 ||
        monthIndex > 11 ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59 ||
        second < 0 ||
        second > 59
      ) {
        return null;
      }

      const manualDate = new Date(year, monthIndex, day, hour, minute, second);

      if (
        manualDate.getFullYear() === year &&
        manualDate.getMonth() === monthIndex &&
        manualDate.getDate() === day &&
        manualDate.getHours() === hour &&
        manualDate.getMinutes() === minute &&
        manualDate.getSeconds() === second
      ) {
        console.debug(
          '[parseExcelDate] Fecha personalizada reconocida:',
          trimmed,
          manualDate
        );
        return manualDate;
      }
    }

    const timestamp = Date.parse(trimmed);
    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp);
    }
  }
  return null;
}