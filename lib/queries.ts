import "server-only";
import { dbAll, dbGet, type Args } from "./db";
import { nowKey, todayKey } from "./format";
import type {
  Movie,
  MovieRequest,
  MovieStatus,
  MovieWithStats,
  PollOption,
  PollWithOptions,
  ReviewWithAuthor,
  ShowtimeWithMovie,
} from "./types";

const MOVIE_STATS_SELECT = `
  SELECT m.*,
         (SELECT ROUND(AVG(r.rating), 1) FROM reviews r
           WHERE r.movie_id = m.id AND r.hidden = 0)      AS avg_rating,
         (SELECT COUNT(*) FROM reviews r
           WHERE r.movie_id = m.id AND r.hidden = 0)      AS reviews_count,
         (SELECT MIN(s.starts_at) FROM showtimes s
           WHERE s.movie_id = m.id AND s.starts_at >= @now) AS next_showtime
    FROM movies m
`;

export async function listMoviesByStatus(
  status: MovieStatus,
  limit = 30,
): Promise<MovieWithStats[]> {
  return dbAll<MovieWithStats>(
    `${MOVIE_STATS_SELECT}
      WHERE m.status = @status
      ORDER BY (next_showtime IS NULL), next_showtime, m.title
      LIMIT @limit`,
    { status, limit, now: nowKey() },
  );
}

export async function listFeatured(limit = 6): Promise<MovieWithStats[]> {
  return dbAll<MovieWithStats>(
    `${MOVIE_STATS_SELECT}
      WHERE m.featured = 1
      ORDER BY (next_showtime IS NULL), next_showtime, m.year DESC
      LIMIT @limit`,
    { limit, now: nowKey() },
  );
}

export async function listTopRated(limit = 15): Promise<MovieWithStats[]> {
  return dbAll<MovieWithStats>(
    `${MOVIE_STATS_SELECT}
      WHERE (SELECT COUNT(*) FROM reviews r WHERE r.movie_id = m.id AND r.hidden = 0) > 0
      ORDER BY avg_rating DESC, reviews_count DESC
      LIMIT @limit`,
    { limit, now: nowKey() },
  );
}

export async function listByGenre(genre: string, limit = 20): Promise<MovieWithStats[]> {
  return dbAll<MovieWithStats>(
    `${MOVIE_STATS_SELECT}
      WHERE ',' || REPLACE(LOWER(m.genres), ', ', ',') || ',' LIKE '%,' || LOWER(@genre) || ',%'
      ORDER BY m.year DESC
      LIMIT @limit`,
    { genre, limit, now: nowKey() },
  );
}

export async function listAllGenres(): Promise<string[]> {
  const rows = await dbAll<{ genres: string }>(`SELECT genres FROM movies`);
  const set = new Set<string>();
  for (const r of rows) {
    for (const g of r.genres.split(",")) {
      const clean = g.trim();
      if (clean) set.add(clean);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, "it"));
}

export async function getMovie(id: number): Promise<MovieWithStats | null> {
  const row = await dbGet<MovieWithStats>(`${MOVIE_STATS_SELECT} WHERE m.id = @id`, {
    id,
    now: nowKey(),
  });
  return row ?? null;
}

export async function searchMovies(opts: {
  q?: string;
  genre?: string;
  status?: string;
  sort?: string;
  limit?: number;
}): Promise<MovieWithStats[]> {
  const q = (opts.q || "").trim();
  const genre = (opts.genre || "").trim();
  const status = (opts.status || "").trim();
  const sort = opts.sort || "titolo";

  const where: string[] = [];
  if (q) {
    where.push(
      `(m.title LIKE @like OR IFNULL(m.original_title,'') LIKE @like
        OR IFNULL(m.director,'') LIKE @like OR IFNULL(m.cast_list,'') LIKE @like)`,
    );
  }
  if (genre) {
    where.push(`LOWER(m.genres) LIKE '%' || LOWER(@genre) || '%'`);
  }
  if (status) where.push(`m.status = @status`);

  const order =
    sort === "voto"
      ? `avg_rating DESC NULLS LAST, m.title`
      : sort === "anno"
        ? `m.year DESC, m.title`
        : sort === "recenti"
          ? `m.created_at DESC`
          : `m.title COLLATE NOCASE`;

  return dbAll<MovieWithStats>(
    `${MOVIE_STATS_SELECT}
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY ${order}
     LIMIT @limit`,
    {
      like: `%${q}%`,
      genre,
      status,
      limit: opts.limit ?? 60,
      now: nowKey(),
    },
  );
}

/* ---------------------------------------------------------------- spettacoli */

const SHOWTIME_SELECT = `
  SELECT s.*, m.title, m.poster_url, m.genres, m.duration_min, m.year
    FROM showtimes s
    JOIN movies m ON m.id = s.movie_id
`;

export async function upcomingShowtimes(days = 21): Promise<ShowtimeWithMovie[]> {
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + days);
  const end = `${limitDate.getFullYear()}-${String(
    limitDate.getMonth() + 1,
  ).padStart(2, "0")}-${String(limitDate.getDate()).padStart(2, "0")}T23:59`;
  return dbAll<ShowtimeWithMovie>(
    `${SHOWTIME_SELECT}
      WHERE s.starts_at >= @now AND s.starts_at <= @end
      ORDER BY s.starts_at`,
    { now: nowKey(), end },
  );
}

/**
 * Prima giornata con proiezioni ancora da venire, con tutti i suoi spettacoli.
 * Se oggi restano spettacoli, la giornata è oggi; altrimenti si passa al primo
 * giorno utile successivo.
 */
export async function nextScreeningDay(): Promise<{
  giorno: string;
  spettacoli: ShowtimeWithMovie[];
} | null> {
  const primo = await dbGet<{ inizio: string | null }>(
    `SELECT MIN(starts_at) AS inizio FROM showtimes WHERE starts_at >= @now`,
    { now: nowKey() },
  );
  if (!primo?.inizio) return null;

  const giorno = primo.inizio.slice(0, 10);
  const spettacoli = await dbAll<ShowtimeWithMovie>(
    `${SHOWTIME_SELECT}
      WHERE s.starts_at >= @now AND s.starts_at LIKE @giorno
      ORDER BY s.starts_at`,
    { now: nowKey(), giorno: `${giorno}T%` },
  );
  return { giorno, spettacoli };
}

export async function showtimesForMovie(movieId: number): Promise<ShowtimeWithMovie[]> {
  return dbAll<ShowtimeWithMovie>(
    `${SHOWTIME_SELECT}
      WHERE s.movie_id = @id AND s.starts_at >= @now
      ORDER BY s.starts_at
      LIMIT 40`,
    { id: movieId, now: nowKey() },
  );
}

/**
 * Per ogni film indicato, le altre giornate in cui torna in sala dopo quella
 * mostrata. Serve al carosello per dire "torna in sala anche il…".
 */
export async function upcomingDatesForMovies(
  ids: number[],
  dopoGiorno: string,
): Promise<Record<number, string[]>> {
  if (!ids.length) return {};

  const segnaposto = ids.map((_, i) => `@id${i}`).join(", ");
  const args: Record<string, unknown> = { dopo: `${dopoGiorno}T23:59` };
  ids.forEach((id, i) => {
    args[`id${i}`] = id;
  });

  const righe = await dbAll<{ movie_id: number; giorno: string }>(
    `SELECT DISTINCT movie_id, substr(starts_at, 1, 10) AS giorno
       FROM showtimes
      WHERE movie_id IN (${segnaposto}) AND starts_at > @dopo
      ORDER BY giorno`,
    args as Args,
  );

  const perFilm: Record<number, string[]> = {};
  for (const r of righe) {
    (perFilm[r.movie_id] ??= []).push(`${r.giorno}T00:00`);
  }
  return perFilm;
}

export async function pastShowtimesForMovie(
  movieId: number,
  limit = 10,
): Promise<ShowtimeWithMovie[]> {
  return dbAll<ShowtimeWithMovie>(
    `${SHOWTIME_SELECT}
      WHERE s.movie_id = @id AND s.starts_at < @now
      ORDER BY s.starts_at DESC
      LIMIT @limit`,
    { id: movieId, now: nowKey(), limit },
  );
}

export async function searchArchive(opts: {
  q?: string;
  from?: string;
  to?: string;
  genre?: string;
  limit?: number;
}): Promise<ShowtimeWithMovie[]> {
  const where: string[] = [`s.starts_at < @today`];
  const q = (opts.q || "").trim();
  if (q) where.push(`(m.title LIKE @like OR IFNULL(m.director,'') LIKE @like)`);
  if (opts.from) where.push(`s.starts_at >= @from`);
  if (opts.to) where.push(`s.starts_at <= @to`);
  if (opts.genre) where.push(`LOWER(m.genres) LIKE '%' || LOWER(@genre) || '%'`);

  return dbAll<ShowtimeWithMovie>(
    `${SHOWTIME_SELECT}
      WHERE ${where.join(" AND ")}
      ORDER BY s.starts_at DESC
      LIMIT @limit`,
    {
      today: `${todayKey()}T00:00`,
      like: `%${q}%`,
      from: opts.from ? `${opts.from}T00:00` : null,
      to: opts.to ? `${opts.to}T23:59` : null,
      genre: opts.genre || "",
      limit: opts.limit ?? 200,
    },
  );
}

export async function archiveStats(): Promise<{
  films: number;
  shows: number;
  first: string | null;
}> {
  const row = await dbGet<{ shows: number; films: number; first: string | null }>(
    `SELECT COUNT(*) AS shows,
            COUNT(DISTINCT movie_id) AS films,
            MIN(starts_at) AS first
       FROM showtimes WHERE starts_at < @today`,
    { today: `${todayKey()}T00:00` },
  );
  return row!;
}

/* ---------------------------------------------------------------- recensioni */

export async function reviewsForMovie(
  movieId: number,
  includeHidden = false,
): Promise<ReviewWithAuthor[]> {
  return dbAll<ReviewWithAuthor>(
    `SELECT r.*, u.name AS author
       FROM reviews r JOIN users u ON u.id = r.user_id
      WHERE r.movie_id = @id ${includeHidden ? "" : "AND r.hidden = 0"}
      ORDER BY r.updated_at DESC`,
    { id: movieId },
  );
}

export async function myReview(
  movieId: number,
  userId: number,
): Promise<ReviewWithAuthor | null> {
  const row = await dbGet<ReviewWithAuthor>(
    `SELECT r.*, u.name AS author
       FROM reviews r JOIN users u ON u.id = r.user_id
      WHERE r.movie_id = @movieId AND r.user_id = @userId`,
    { movieId, userId },
  );
  return row ?? null;
}

export async function latestReviews(limit = 8): Promise<ReviewWithAuthor[]> {
  return dbAll<ReviewWithAuthor>(
    `SELECT r.*, u.name AS author, m.title AS movie_title
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN movies m ON m.id = r.movie_id
      WHERE r.hidden = 0
      ORDER BY r.created_at DESC
      LIMIT @limit`,
    { limit },
  );
}

export async function allReviews(): Promise<ReviewWithAuthor[]> {
  return dbAll<ReviewWithAuthor>(
    `SELECT r.*, u.name AS author, u.email AS author_email, m.title AS movie_title
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN movies m ON m.id = r.movie_id
      ORDER BY r.created_at DESC`,
  );
}

export async function reviewsByUser(userId: number): Promise<ReviewWithAuthor[]> {
  return dbAll<ReviewWithAuthor>(
    `SELECT r.*, u.name AS author, m.title AS movie_title
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN movies m ON m.id = r.movie_id
      WHERE r.user_id = @userId
      ORDER BY r.updated_at DESC`,
    { userId },
  );
}

/* ---------------------------------------------------------------- richieste */

export async function listRequests(userId?: number | null): Promise<MovieRequest[]> {
  return dbAll<MovieRequest>(
    `SELECT rq.*, IFNULL(u.name, 'Ospite') AS author,
            (SELECT COUNT(*) FROM request_votes v WHERE v.request_id = rq.id) AS votes,
            (SELECT COUNT(*) FROM request_votes v
              WHERE v.request_id = rq.id AND v.user_id = @uid) AS voted_by_me
       FROM movie_requests rq
       LEFT JOIN users u ON u.id = rq.user_id
      ORDER BY votes DESC, rq.created_at DESC`,
    { uid: userId ?? -1 },
  );
}

export async function requestsByUser(userId: number): Promise<MovieRequest[]> {
  return dbAll<MovieRequest>(
    `SELECT rq.*, (SELECT COUNT(*) FROM request_votes v WHERE v.request_id = rq.id) AS votes
       FROM movie_requests rq WHERE rq.user_id = @userId ORDER BY rq.created_at DESC`,
    { userId },
  );
}

/* ---------------------------------------------------------------- sondaggi */

export async function listPolls(
  userId?: number | null,
  status?: string,
): Promise<PollWithOptions[]> {
  const polls = await dbAll<PollWithOptions>(
    `SELECT * FROM polls ${status ? "WHERE status = @status" : ""}
      ORDER BY (status = 'aperto') DESC, created_at DESC`,
    { status: status ?? null },
  );

  return Promise.all(
    polls.map(async (p) => {
      const options = await dbAll<PollOption>(
        `SELECT o.id, o.poll_id, o.movie_id, o.label, m.poster_url,
                (SELECT COUNT(*) FROM poll_votes v WHERE v.option_id = o.id) AS votes
           FROM poll_options o
           LEFT JOIN movies m ON m.id = o.movie_id
          WHERE o.poll_id = @pollId
          ORDER BY votes DESC, o.id`,
        { pollId: p.id },
      );
      const mine = userId
        ? await dbGet<{ option_id: number }>(
            `SELECT option_id FROM poll_votes WHERE poll_id = @pollId AND user_id = @userId`,
            { pollId: p.id, userId },
          )
        : undefined;
      return {
        ...p,
        options,
        total_votes: options.reduce((sum, o) => sum + o.votes, 0),
        my_option_id: mine?.option_id ?? null,
      };
    }),
  );
}

export async function getPoll(
  id: number,
  userId?: number | null,
): Promise<PollWithOptions | null> {
  const all = await listPolls(userId);
  return all.find((p) => p.id === id) ?? null;
}

/* ---------------------------------------------------------------- statistiche */

export async function siteStats() {
  const count = async (sql: string, params: Args = {}) =>
    (await dbGet<{ n: number }>(sql, params))!.n;

  const [movies, upcoming, reviews, users, requests, polls] = await Promise.all([
    count(`SELECT COUNT(*) AS n FROM movies`),
    count(`SELECT COUNT(*) AS n FROM showtimes WHERE starts_at >= @now`, { now: nowKey() }),
    count(`SELECT COUNT(*) AS n FROM reviews`),
    count(`SELECT COUNT(*) AS n FROM users`),
    count(`SELECT COUNT(*) AS n FROM movie_requests WHERE status = 'in_attesa'`),
    count(`SELECT COUNT(*) AS n FROM polls WHERE status = 'aperto'`),
  ]);

  return { movies, upcoming, reviews, users, requests, polls };
}

export async function allMoviesSimple(): Promise<Movie[]> {
  return dbAll<Movie>(`SELECT * FROM movies ORDER BY title COLLATE NOCASE`);
}

/**
 * Film corrispondenti a un elenco di id, restituiti nello stesso ordine in cui
 * gli id sono stati passati (l'SQL non garantisce l'ordine di una IN).
 * I segnaposto sono nominati perché il resto della query ne usa già (@now):
 * mescolare "?" e "@nome" non è ammesso.
 */
export async function moviesByIds(ids: number[]): Promise<MovieWithStats[]> {
  if (!ids.length) return [];

  const segnaposto = ids.map((_, i) => `@id${i}`).join(", ");
  const args: Record<string, unknown> = { now: nowKey() };
  ids.forEach((id, i) => {
    args[`id${i}`] = id;
  });

  const trovati = await dbAll<MovieWithStats>(
    `${MOVIE_STATS_SELECT} WHERE m.id IN (${segnaposto})`,
    args as Args,
  );

  const perId = new Map(trovati.map((m) => [m.id, m]));
  return ids.map((id) => perId.get(id)).filter((m): m is MovieWithStats => !!m);
}

/* ------------------------------------------------ interesse sui film */

/** Quante persone hanno segnalato interesse, e se fra queste c'è l'utente. */
export async function movieInterest(
  movieId: number,
  userId?: number | null,
): Promise<{ totale: number; mio: boolean }> {
  const [conteggio, mio] = await Promise.all([
    dbGet<{ n: number }>(
      `SELECT COUNT(*) AS n FROM movie_interests WHERE movie_id = @movieId`,
      { movieId },
    ),
    userId
      ? dbGet(
          `SELECT 1 FROM movie_interests WHERE movie_id = @movieId AND user_id = @userId`,
          { movieId, userId },
        )
      : Promise.resolve(undefined),
  ]);
  return { totale: conteggio?.n ?? 0, mio: !!mio };
}

export interface InterestRow {
  movie_id: number;
  title: string;
  year: number | null;
  status: string;
  poster_url: string | null;
  genres: string;
  interessati: number;
  ultimo: string;
  in_programmazione: number;
}

/** Classifica dei film di catalogo che il pubblico vorrebbe rivedere. */
export async function listInterests(): Promise<InterestRow[]> {
  return dbAll<InterestRow>(
    `SELECT m.id AS movie_id, m.title, m.year, m.status, m.poster_url, m.genres,
            COUNT(i.user_id) AS interessati,
            MAX(i.created_at) AS ultimo,
            (SELECT COUNT(*) FROM showtimes s
              WHERE s.movie_id = m.id AND s.starts_at >= @now) AS in_programmazione
       FROM movie_interests i
       JOIN movies m ON m.id = i.movie_id
      GROUP BY m.id
      ORDER BY interessati DESC, ultimo DESC`,
    { now: nowKey() },
  );
}

/* -------------------------------------------------------------- utenti (admin) */

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  suspended_until: string | null;
  created_at: string;
  recensioni: number;
  richieste: number;
}

export async function listUsersForAdmin(opts: {
  q?: string;
  role?: string;
  status?: string;
}): Promise<AdminUserRow[]> {
  const q = (opts.q || "").trim();
  const role = (opts.role || "").trim();
  const status = (opts.status || "").trim();

  const where: string[] = [];
  if (q) where.push(`(u.name LIKE @like OR u.email LIKE @like)`);
  if (role) where.push(`u.role = @role`);
  if (status === "sospesi")
    where.push(`u.suspended_until IS NOT NULL AND u.suspended_until > datetime('now')`);
  if (status === "attivi")
    where.push(`(u.suspended_until IS NULL OR u.suspended_until <= datetime('now'))`);

  return dbAll<AdminUserRow>(
    `SELECT u.id, u.name, u.email, u.role, u.suspended_until, u.created_at,
            (SELECT COUNT(*) FROM reviews r WHERE r.user_id = u.id) AS recensioni,
            (SELECT COUNT(*) FROM movie_requests mr WHERE mr.user_id = u.id) AS richieste
       FROM users u
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY u.created_at DESC`,
    { like: `%${q}%`, role },
  );
}
