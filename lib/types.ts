export type Role = "user" | "admin";

export type MovieStatus =
  | "in_programmazione"
  | "prossimamente"
  | "archivio"
  | "catalogo";

export type RequestStatus =
  | "in_attesa"
  | "approvata"
  | "programmata"
  | "rifiutata";

export type PollStatus = "aperto" | "chiuso";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  suspended_until: string | null;
  created_at: string;
}

export interface Movie {
  id: number;
  tmdb_id: number | null;
  title: string;
  original_title: string | null;
  year: number | null;
  genres: string;
  duration_min: number | null;
  director: string | null;
  cast_list: string | null;
  synopsis: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  trailer_url: string | null;
  age_rating: string | null;
  status: MovieStatus;
  featured: number;
  created_at: string;
}

export interface MovieWithStats extends Movie {
  avg_rating: number | null;
  reviews_count: number;
  next_showtime: string | null;
}

export interface Showtime {
  id: number;
  movie_id: number;
  starts_at: string;
  hall: string;
  format: string;
  price_cents: number;
  seats_total: number;
  created_at: string;
}

export interface ShowtimeWithMovie extends Showtime {
  title: string;
  poster_url: string | null;
  genres: string;
  duration_min: number | null;
  year: number | null;
}

export interface Review {
  id: number;
  movie_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  body: string;
  hidden: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithAuthor extends Review {
  author: string;
  author_email?: string;
  movie_title?: string;
}

export interface MovieRequest {
  id: number;
  user_id: number | null;
  title: string;
  year: number | null;
  note: string | null;
  status: RequestStatus;
  admin_note: string | null;
  created_at: string;
  author?: string;
  votes?: number;
  voted_by_me?: number;
}

export interface Poll {
  id: number;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  status: PollStatus;
  created_at: string;
}

export interface PollOption {
  id: number;
  poll_id: number;
  movie_id: number | null;
  label: string;
  poster_url: string | null;
  votes: number;
}

export interface PollWithOptions extends Poll {
  options: PollOption[];
  total_votes: number;
  my_option_id: number | null;
}
