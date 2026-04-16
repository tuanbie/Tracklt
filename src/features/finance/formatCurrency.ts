/** EUR formatting aligned with common EU display (e.g. €8.098,74). */
export function formatEur(amount: number): string {
  return formatCurrency(amount, 'EUR', 'de-DE');
}

const CURRENCY_CONVERSION_RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.1,
  VND: 25000,
};

export function formatCurrency(
  amount: number,
  currency: 'EUR' | 'USD' | 'VND',
  locale: string,
): string {
  const converted = amount * (CURRENCY_CONVERSION_RATES[currency] ?? 1);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(converted);
}
