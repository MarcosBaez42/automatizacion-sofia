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
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp);
    }
  }
  return null;
}