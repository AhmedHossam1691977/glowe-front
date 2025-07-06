// src/utils/reviewCalculations.js

/**
 * Calculates the percentage of each star rating from a list of reviews.
 *
 * @param {Array<Object>} allReviews - An array of review objects, each with a 'rate' property.
 * @returns {Object} - An object where keys are star ratings (1-5) and values are their percentages.
 */
export const calculateReviewPercentages = (allReviews) => {
  const percentages = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalReviews = allReviews ? allReviews.length : 0;

  if (totalReviews > 0) {
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach(review => {
      if (review.rate >= 1 && review.rate <= 5) { // Ensure rate is within expected range
        starCounts[review.rate]++;
      }
    });

    for (let i = 1; i <= 5; i++) {
      percentages[i] = Math.round((starCounts[i] / totalReviews) * 100);
    }
  }
  return percentages;
};