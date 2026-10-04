// Format INR currency or others
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  if (currency === 'INR') {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

// Format short date (e.g., "10 Oct")
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

// Format date range (e.g., "10 Oct — 14 Oct")
export const formatDateRange = (startStr, endStr) => {
  if (!startStr) return '';
  const start = formatDate(startStr);
  if (!endStr) return start;
  const end = formatDate(endStr);
  return `${start} — ${end}`;
};

// Format duration
export const formatDuration = (days) => {
  if (!days) return '4 days';
  return `${days} ${days === 1 ? 'day' : 'days'}`;
};
