export type Evaluation = {
  overallScore?: number;
  verdict?: {
    level?: string;
    reason?: string;
    isRecommended?: boolean;
  };
  summary?: string;
  recommendation?: string;
  categories?: {
    name: string;
    score: number;
  }[];
};
