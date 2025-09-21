// Utility functions
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calculateTotalCost = (itinerary) => {
  if (!itinerary || !itinerary.days) return 0;
  
  return itinerary.days.reduce((total, day) => {
    const dayCost = day.activities.reduce((dayTotal, activity) => {
      return dayTotal + (activity.cost || 0);
    }, 0);
    return total + dayCost;
  }, 0);
};

module.exports = {
  asyncHandler,
  validateEmail,
  formatDate,
  calculateTotalCost
};