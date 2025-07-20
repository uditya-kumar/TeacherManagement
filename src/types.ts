export type Teacher = {
  id: string;
  name: string;
  rating: number;
  totalRatings: number;
  cabinNumber: string;
  mobileNumber: string;
  email: string;
  teachingQuality: RatingBreakdown[];
  evaluationFairness: RatingBreakdown[];
  behaviorAttitude: RatingBreakdown[];
  internalAssessment: RatingBreakdown[];
}

export type RatingBreakdown = {
  stars: number;
  percentage: number;
  count: number;
};