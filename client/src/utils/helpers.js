// Format currency with proper symbols and formatting
export const formatCurrency = (amount, currency = 'MKD', locale = 'en-US') => {
  const currencyMap = {
    'MKD': 'MKD',
    'EUR': 'EUR',
    'USD': 'USD'
  };

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyMap[currency] || currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    const symbol = currency === 'MKD' ? 'ден' : currency === 'EUR' ? '€' : '$';
    return `${parseFloat(amount).toFixed(2)} ${symbol}`;
  }
};

// Format date for display
export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Date(dateString).toLocaleDateString('en-US', defaultOptions);
};

// Format date for form inputs (YYYY-MM-DD)
export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Calculate percentage
export const calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return ((part / total) * 100).toFixed(1);
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random color for categories
export const generateRandomColor = () => {
  const colors = [
    '#2563EB', '#059669', '#DC2626', '#7C3AED',
    '#F59E0B', '#EC4899', '#10B981', '#6366F1',
    '#EF4444', '#8B5CF6', '#F97316', '#06B6D4'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Format number with K, M suffixes
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Get month name from date
export const getMonthName = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'long' });
};

// Calculate days between dates
export const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((new Date(date1) - new Date(date2)) / oneDay));
};

// Export CSV data
export const exportToCSV = (data, filename) => {
  const csvContent = "data:text/csv;charset=utf-8," 
    + data.map(row => Object.values(row).join(",")).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};