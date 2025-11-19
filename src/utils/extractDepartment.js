// utils/extractDepartment.js
export const extractDepartment = (concernDoc) => {
  if (concernDoc.doctorServices) return "Doctor Services";
  if (concernDoc.billingServices) return "Billing";
  if (concernDoc.housekeeping) return "Housekeeping";
  if (concernDoc.maintenance) return "Maintenance";
  if (concernDoc.diagnosticServices) return "Diagnostics";
  if (concernDoc.dietitianServices) return "Dietitian";
  if (concernDoc.security) return "Security";
  if (concernDoc.nursing) return "Nursing";
  return null;
};
