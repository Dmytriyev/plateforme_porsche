const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const priceMonthlyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const numberFormatter = new Intl.NumberFormat("fr-FR");

export const formatPrice = (prix) => priceFormatter.format(prix);
export const formatPriceMonthly = (prix) => priceMonthlyFormatter.format(prix);
export const formatDate = (date) => dateFormatter.format(new Date(date));
export const formatDateTime = (date) =>
  dateTimeFormatter.format(new Date(date));
export const formatKilometrage = (km) => `${numberFormatter.format(km)} km`;

export const formatTelephone = (tel) => {
  if (!tel) return "";
  const cleaned = tel.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  return match
    ? `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`
    : tel;
};
