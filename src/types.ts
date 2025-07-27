export type Teacher = {
  id: string;
  full_name: string;
  rating: number;
  totalRatings: number;
  cabin_no: string;
  rating_count: number;
  average_rating: number | null;
  mobile_no: string;
  teachingQuality: RatingBreakdown[];
  evaluationFairness: RatingBreakdown[];
  behaviorAttitude: RatingBreakdown[];
  internalAssessment: RatingBreakdown[];
};

export type RatingBreakdown = {
  stars: number;
  percentage: number;
  count: number;
};
