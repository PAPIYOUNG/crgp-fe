// Keeps the raw value as a plain digit string (e.g. "12345.5") while only
// ever showing the user a friendly, comma-formatted number.
export function formatBudgetDisplay(raw?: string) {
  if (!raw) return '';

  const [integerPart, decimalPart] = raw.split('.');
  const formattedInteger = integerPart
    ? Number(integerPart).toLocaleString('en-US')
    : '';

  return decimalPart !== undefined
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
}

export function parseBudgetInput(value: string) {
  let cleaned = value.replace(/[^\d.]/g, '');

  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) +
      cleaned.slice(firstDot + 1).replace(/\./g, '');
  }

  const [integerPart, decimalPart] = cleaned.split('.');
  if (decimalPart === undefined) return integerPart;

  return `${integerPart}.${decimalPart.slice(0, 2)}`;
}
