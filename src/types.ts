import { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

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
