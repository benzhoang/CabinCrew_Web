export const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to convert API date format (DD/MM/YYYY HH:mm) to ISO format
export const convertDateFormat = (dateString) => {
  if (!dateString) return "";
  // Format: "30/11/2025 00:00"
  const parts = dateString.split(" ");
  const datePart = parts[0]; // "30/11/2025"
  const [day, month, year] = datePart.split("/");
  return `${day}/${month}/${year}`;
};
