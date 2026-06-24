export interface RoastCategory {
  name: string;
  score: number;
  roast: string;
  suggestions: string[];
}

export interface RoastResponse {
  id?: string;
  overallScore: number;
  roastLevel: string;
  summary: string;
  finalVerdict: string;
  categories: RoastCategory[];
}

const API_BASE_URL = 'http://localhost:5000/api';

export const roastCV = async (file: File): Promise<RoastResponse> => {
  const formData = new FormData();
  formData.append('cv', file);

  const response = await fetch(`${API_BASE_URL}/roast`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to roast CV');
  }

  return response.json();
};
