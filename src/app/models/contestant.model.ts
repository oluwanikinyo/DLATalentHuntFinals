export type Talent = 'dance' | 'drama' | 'spoken_word' | 'singing' | 'dj' | 'instrumentalist';

export interface Contestant {
  id: string;
  name: string;
  talent: Talent;
  imageUrl: string;
  contestantNumber: number | null;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  code: number;
  returnStatus: string;
  data: T;
}

export interface ContestantsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  talent?: Talent;
}

export interface CastVotePayload {
  matricNumber: string;
  contestantId: string;
  deviceId: string;
}
