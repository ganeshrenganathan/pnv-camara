export function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, key) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
      return acc[key];
    }
    return undefined;
  }, obj);
}

export function normalizePhoneNumber(phoneNumber) {
  const value = String(phoneNumber ?? "").trim();
  if (!value) return "";

  // Keep a conservative E.164-safe shape: + followed by 8-15 digits.
  return value.replace(/\s+/g, "");
}

export function isE164(phoneNumber) {
  return /^\+[1-9]\d{7,14}$/.test(phoneNumber);
}

export function asBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value !== "string") return false;

  return ["true", "1", "yes", "y"].includes(value.toLowerCase().trim());
}
