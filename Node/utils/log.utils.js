export const anonymizeIp = (ip) => {
  if (!ip || typeof ip !== "string") return "unknown";
  if (ip.includes(".")) {
    const parts = ip.split(".");
    parts[parts.length - 1] = "xxx";
    return parts.join(".");
  }
  if (ip.includes(":")) {
    return ip.split(":").slice(0, 3).join(":") + ":xxxx";
  }
  return "redacted";
};

export const formatTypeVoiture = (val) => {
  if (typeof val === "string") {
    const lower = val.toLowerCase();
    if (["neuve", "nouvelle", "new"].includes(lower)) return "neuve";
    if (["occasion", "used"].includes(lower)) return "occasion";
    return lower;
  }
  return typeof val === "boolean" ? (val ? "neuve" : "occasion") : "inconnu";
};
