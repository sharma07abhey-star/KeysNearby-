/*
  Small validation toolkit used by every form in the app.

  A "rule" is a function (value, allValues) => errorMessage | "".
  createValidator({ field: [rule, rule] }) turns a list of rules per field
  into one validate(values) function that returns { field: message }.
*/
export const required = (message = "This field is required.") => (value) =>
  String(value ?? "").trim() ? "" : message;

export const minLength = (n, message) => (value) =>
  !value || String(value).trim().length >= n
    ? ""
    : message || `Enter at least ${n} characters.`;

export const email = (message = "Enter a valid email address.") => (value) =>
  !value || /^\S+@\S+\.\S+$/.test(value) ? "" : message;

export const phone = (message = "Enter a valid 10-digit mobile number.") => (value) =>
  !value || /^[6-9]\d{9}$/.test(String(value).replace(/\s|-/g, "")) ? "" : message;

export const numberBetween = (min, max, message) => (value) => {
  if (value === "" || value == null) return "";
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) {
    return message || `Enter a number between ${min} and ${max}.`;
  }
  return "";
};

export const notBefore = (isoDate, message = "Date cannot be in the past.") => (value) =>
  !value || value >= isoDate ? "" : message;

export const afterField = (otherField, message = "Must be after the start date.") =>
  (value, values) => (!value || !values[otherField] || value > values[otherField] ? "" : message);

export const differentFrom = (otherField, message) => (value, values) =>
  !value || !values[otherField] ||
  value.trim().toLowerCase() !== String(values[otherField]).trim().toLowerCase()
    ? ""
    : message || "These two fields must be different.";

export function createValidator(rulesByField) {
  return function validate(values) {
    const errors = {};
    for (const [field, rules] of Object.entries(rulesByField)) {
      for (const rule of rules) {
        const message = rule(values[field], values);
        if (message) {
          errors[field] = message;
          break; // show only the first problem per field
        }
      }
    }
    return errors;
  };
}
