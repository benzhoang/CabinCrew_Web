export const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to format date without time (from "DD/MM/YYYY HH:mm" to "DD/MM/YYYY")
export const formatDate2 = (dateString) => {
  if (!dateString) return "N/A";
  // If dateString contains time, split and take only date part
  const datePart = dateString.split(" ")[0];
  return datePart;
};

export const formatDate3 = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Helper function to convert API date format (DD/MM/YYYY HH:mm) to MM/DD/YYYY format
export const convertDateFormat = (dateString) => {
  if (!dateString) return "";
  // Format: "30/11/2025 00:00"
  const parts = dateString.split(" ");
  const datePart = parts[0]; // "30/11/2025"
  const [day, month, year] = datePart.split("/");
  return `${day}/${month}/${year} `;
};

// Helper function to parse API date string (DD/MM/YYYY HH:mm) and format to DD/MM/YYYY
// This function correctly handles dates from API that are in DD/MM/YYYY format
// Use this for Round timeline to ensure all rounds display dates in DD/MM/YYYY format
export const formatDateFromAPI = (dateString) => {
  if (!dateString) return "";

  // If it's an ISO string (contains T or starts with YYYY-MM-DD), use standard formatDate
  if (dateString.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    const date = new Date(dateString);
    if (!Number.isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  // If it's a formatted string like "DD/MM/YYYY HH:mm" or "DD/MM/YYYY"
  // Split by space to remove time part
  const datePart = dateString.split(" ")[0];
  const parts = datePart.split("/");

  if (parts.length === 3) {
    const [day, month, year] = parts;
    // API returns DD/MM/YYYY, so we just return it as is (already in correct format)
    return `${day}/${month}/${year}`;
  }

  // Fallback: try to parse as Date object
  const date = new Date(dateString);
  if (!Number.isNaN(date.getTime())) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // If all else fails, return original string
  return dateString;
};
