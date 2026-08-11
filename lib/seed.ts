import type { InStatement } from "@libsql/client";
import { dbAll, dbGet, dbRun, getDb } from "./db";
import { hashPassword } from "./password";

/**
 * Catalogo iniziale. Le locandine non sono immagini esterne: il sito disegna
 * una locandina grafica coerente col tema quando poster_url è vuoto.
 * Importando un film da TMDb dal pannello admin, la locandina reale sostituisce
 * automaticamente quella disegnata.
 */

type SeedMovie = {
  title: string;
  original_title?: string;
  year: number;
  genres: string;
  duration_min: number;
  director: string;
  cast_list: string;
  synopsis: string;
  age_rating: string;
  status: "in_programmazione" | "prossimamente" | "archivio" | "catalogo";
  featured?: boolean;
};

const MOVIES: SeedMovie[] = [
  {
    title: "Il Padrino",
    original_title: "The Godfather",
    year: 1972,
    genres: "Drammatico, Gangster",
    duration_min: 175,
    director: "Francis Ford Coppola",
    cast_list: "Marlon Brando, Al Pacino, James Caan",
    synopsis:
      "Il passaggio di consegne dentro una famiglia mafiosa newyorkese, raccontato come una tragedia sul potere che divora chi lo eredita.",
    age_rating: "VM14",
    status: "in_programmazione",
    featured: true,
  },
  {
    title: "Blade Runner 2049",
    year: 2017,
    genres: "Fantascienza, Noir",
    duration_min: 164,
    director: "Denis Villeneuve",
    cast_list: "Ryan Gosling, Harrison Ford, Ana de Armas",
    synopsis:
      "In una California soffocata dalla nebbia industriale, un agente scopre un segreto che rimette in discussione il confine tra uomo e replicante.",
    age_rating: "VM14",
    status: "in_programmazione",
    featured: true,
  },
  {
    title: "Parasite",
    original_title: "기생충",
    year: 2019,
    genres: "Thriller, Drammatico",
    duration_min: 132,
    director: "Bong Joon-ho",
    cast_list: "Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong",
    synopsis:
      "Una famiglia squattrinata si insinua, ruolo dopo ruolo, nella villa di una famiglia ricchissima. Poi la casa rivela quello che nasconde sotto.",
    age_rating: "VM14",
    status: "in_programmazione",
    featured: true,
  },
  {
    title: "Dune",
    year: 2021,
    genres: "Fantascienza, Avventura",
    duration_min: 155,
    director: "Denis Villeneuve",
    cast_list: "Timothée Chalamet, Rebecca Ferguson, Oscar Isaac",
    synopsis:
      "Un erede riluttante viene spedito sul pianeta più ostile e più prezioso dell'universo, dove il destino della sua casata si gioca sulla sabbia.",
    age_rating: "T",
    status: "in_programmazione",
  },
  {
    title: "Oppenheimer",
    year: 2023,
    genres: "Biografico, Drammatico",
    duration_min: 180,
    director: "Christopher Nolan",
    cast_list: "Cillian Murphy, Emily Blunt, Robert Downey Jr.",
    synopsis:
      "La corsa alla prima bomba atomica e il processo interiore dell'uomo che l'ha resa possibile, montato come un conto alla rovescia.",
    age_rating: "VM14",
    status: "in_programmazione",
    featured: true,
  },
  {
    title: "La vita è bella",
    year: 1997,
    genres: "Drammatico, Commedia",
    duration_min: 116,
    director: "Roberto Benigni",
    cast_list: "Roberto Benigni, Nicoletta Braschi, Giorgio Cantarini",
    synopsis:
      "Un padre trasforma l'orrore del campo di concentramento in un gioco, per proteggere lo sguardo del figlio fino all'ultimo istante.",
    age_rating: "T",
    status: "in_programmazione",
  },
  {
    title: "Interstellar",
    year: 2014,
    genres: "Fantascienza, Drammatico",
    duration_min: 169,
    director: "Christopher Nolan",
    cast_list: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
    synopsis:
      "Con la Terra ormai sterile, un pilota attraversa un varco nello spazio cercando un futuro per i figli che sta lasciando indietro.",
    age_rating: "T",
    status: "in_programmazione",
  },
  {
    title: "Il Signore degli Anelli: La Compagnia dell'Anello",
    original_title: "The Lord of the Rings: The Fellowship of the Ring",
    year: 2001,
    genres: "Fantasy, Avventura",
    duration_min: 178,
    director: "Peter Jackson",
    cast_list: "Elijah Wood, Ian McKellen, Viggo Mortensen",
    synopsis:
      "Nove compagni partono per distruggere un anello che nessuno di loro dovrebbe tenere troppo a lungo tra le mani.",
    age_rating: "T",
    status: "in_programmazione",
  },
  {
    title: "Dune: Parte Due",
    original_title: "Dune: Part Two",
    year: 2024,
    genres: "Fantascienza, Avventura",
    duration_min: 166,
    director: "Denis Villeneuve",
    cast_list: "Timothée Chalamet, Zendaya, Austin Butler",
    synopsis:
      "La vendetta diventa profezia: chi guida un popolo del deserto scopre quanto costa essere creduto un messia.",
    age_rating: "T",
    status: "prossimamente",
    featured: true,
  },
  {
    title: "Povere creature!",
    original_title: "Poor Things",
    year: 2023,
    genres: "Drammatico, Fantastico",
    duration_min: 141,
    director: "Yorgos Lanthimos",
    cast_list: "Emma Stone, Mark Ruffalo, Willem Dafoe",
    synopsis:
      "Riportata in vita da uno scienziato eccentrico, una donna attraversa l'Europa imparando il mondo senza chiedere permesso a nessuno.",
    age_rating: "VM18",
    status: "prossimamente",
  },
  {
    title: "C'è ancora domani",
    year: 2023,
    genres: "Drammatico, Commedia",
    duration_min: 118,
    director: "Paola Cortellesi",
    cast_list: "Paola Cortellesi, Valerio Mastandrea, Romana Maggiora Vergano",
    synopsis:
      "Roma nel dopoguerra, in bianco e nero: una madre di famiglia custodisce un segreto che vale più di una fuga.",
    age_rating: "T",
    status: "prossimamente",
  },
  {
    title: "Perfect Days",
    year: 2023,
    genres: "Drammatico",
    duration_min: 123,
    director: "Wim Wenders",
    cast_list: "Kōji Yakusho, Tokio Emoto, Arisa Nakano",
    synopsis:
      "Le giornate quasi identiche di un uomo che pulisce i bagni pubblici di Tokyo, e la grazia che riesce a trovarci dentro.",
    age_rating: "T",
    status: "prossimamente",
  },
  {
    title: "La zona d'interesse",
    original_title: "The Zone of Interest",
    year: 2023,
    genres: "Drammatico, Storico",
    duration_min: 105,
    director: "Jonathan Glazer",
    cast_list: "Christian Friedel, Sandra Hüller",
    synopsis:
      "Una famiglia coltiva il giardino perfetto accanto a un muro. Quello che accade oltre il muro non si vede mai: si sente soltanto.",
    age_rating: "VM14",
    status: "prossimamente",
  },
  {
    title: "Il ragazzo e l'airone",
    original_title: "君たちはどう生きるか",
    year: 2023,
    genres: "Animazione, Fantastico",
    duration_min: 124,
    director: "Hayao Miyazaki",
    cast_list: "Soma Santoki, Masaki Suda, Ko Shibasaki",
    synopsis:
      "Dopo un lutto, un ragazzo segue un airone parlante dentro una torre dove i vivi e i morti condividono le stesse stanze.",
    age_rating: "T",
    status: "prossimamente",
  },
  {
    title: "Nuovo Cinema Paradiso",
    year: 1988,
    genres: "Drammatico, Sentimentale",
    duration_min: 155,
    director: "Giuseppe Tornatore",
    cast_list: "Philippe Noiret, Salvatore Cascio, Jacques Perrin",
    synopsis:
      "Un regista torna al paese siciliano dove ha imparato a guardare i film, e con essi tutto il resto.",
    age_rating: "T",
    status: "archivio",
  },
  {
    title: "C'era una volta il West",
    year: 1968,
    genres: "Western",
    duration_min: 165,
    director: "Sergio Leone",
    cast_list: "Henry Fonda, Charles Bronson, Claudia Cardinale",
    synopsis:
      "Attorno a una stazione ferroviaria da costruire si incrociano una vedova, un pistolero senza nome e un assassino dagli occhi chiari.",
    age_rating: "VM14",
    status: "archivio",
  },
  {
    title: "Ladri di biciclette",
    year: 1948,
    genres: "Drammatico, Neorealismo",
    duration_min: 89,
    director: "Vittorio De Sica",
    cast_list: "Lamberto Maggiorani, Enzo Staiola, Lianella Carell",
    synopsis:
      "Un uomo e suo figlio attraversano Roma per ritrovare la bicicletta senza la quale non esiste lavoro.",
    age_rating: "T",
    status: "archivio",
  },
  {
    title: "2001: Odissea nello spazio",
    original_title: "2001: A Space Odyssey",
    year: 1968,
    genres: "Fantascienza",
    duration_min: 149,
    director: "Stanley Kubrick",
    cast_list: "Keir Dullea, Gary Lockwood, William Sylvester",
    synopsis:
      "Dall'osso lanciato in aria all'astronave silenziosa: un salto evolutivo raccontato più con la musica che con le parole.",
    age_rating: "T",
    status: "archivio",
  },
  {
    title: "Psyco",
    original_title: "Psycho",
    year: 1960,
    genres: "Thriller, Horror",
    duration_min: 109,
    director: "Alfred Hitchcock",
    cast_list: "Anthony Perkins, Janet Leigh, Vera Miles",
    synopsis:
      "Una fuga con i soldi altrui finisce in un motel isolato, dove la gentilezza del proprietario è la cosa più inquietante di tutte.",
    age_rating: "VM14",
    status: "archivio",
  },
  {
    title: "Il buono, il brutto, il cattivo",
    year: 1966,
    genres: "Western",
    duration_min: 161,
    director: "Sergio Leone",
    cast_list: "Clint Eastwood, Eli Wallach, Lee Van Cleef",
    synopsis:
      "Tre uomini si inseguono per un tesoro sepolto mentre attorno a loro la guerra civile brucia tutto il resto.",
    age_rating: "VM14",
    status: "catalogo",
  },
  {
    title: "La dolce vita",
    year: 1960,
    genres: "Drammatico",
    duration_min: 174,
    director: "Federico Fellini",
    cast_list: "Marcello Mastroianni, Anita Ekberg, Anouk Aimée",
    synopsis:
      "Sette giorni e sette notti nella Roma dei rotocalchi, seguendo un cronista che rimanda per sempre la vita che vorrebbe.",
    age_rating: "VM14",
    status: "catalogo",
  },
  {
    title: "Casablanca",
    year: 1942,
    genres: "Drammatico, Sentimentale",
    duration_min: 102,
    director: "Michael Curtiz",
    cast_list: "Humphrey Bogart, Ingrid Bergman, Paul Henreid",
    synopsis:
      "In una città di passaggio piena di fuggitivi, un uomo disilluso deve scegliere tra il proprio bar e una causa più grande.",
    age_rating: "T",
    status: "catalogo",
  },
  {
    title: "Pulp Fiction",
    year: 1994,
    genres: "Crime, Commedia nera",
    duration_min: 154,
    director: "Quentin Tarantino",
    cast_list: "John Travolta, Samuel L. Jackson, Uma Thurman",
    synopsis:
      "Storie di malavita losangelina montate fuori ordine, dove le conversazioni contano quanto le pallottole.",
    age_rating: "VM18",
    status: "catalogo",
  },
  {
    title: "La città incantata",
    original_title: "千と千尋の神隠し",
    year: 2001,
    genres: "Animazione, Fantastico",
    duration_min: 125,
    director: "Hayao Miyazaki",
    cast_list: "Rumi Hiiragi, Miyu Irino, Mari Natsuki",
    synopsis:
      "Una bambina finisce in una città di spiriti e deve lavorare in una casa termale per riprendersi i genitori e il proprio nome.",
    age_rating: "T",
    status: "catalogo",
  },
  {
    title: "Il Cavaliere Oscuro",
    original_title: "The Dark Knight",
    year: 2008,
    genres: "Azione, Thriller",
    duration_min: 152,
    director: "Christopher Nolan",
    cast_list: "Christian Bale, Heath Ledger, Aaron Eckhart",
    synopsis:
      "Un criminale senza piano e senza prezzo mette una città intera davanti alla domanda su cosa sia davvero l'ordine.",
    age_rating: "VM14",
    status: "catalogo",
  },
  {
    title: "Alien",
    year: 1979,
    genres: "Horror, Fantascienza",
    duration_min: 117,
    director: "Ridley Scott",
    cast_list: "Sigourney Weaver, Tom Skerritt, John Hurt",
    synopsis:
      "Un equipaggio di minatori spaziali risponde a un segnale di soccorso e si porta a bordo qualcosa che impara più in fretta di loro.",
    age_rating: "VM14",
    status: "catalogo",
  },
];

const HALLS = ["Sala Aurea", "Sala Rossa", "Sala Grande", "Arena"];
const FORMATS = ["2D", "2D", "2D", "3D", "IMAX"];
const TIMES = ["16:00", "18:30", "21:00", "22:30"];

function isoLocal(date: Date, time: string): string {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/**
 * Costruisce l'elenco di spettacoli come istruzioni pronte per batch(): un
 * database remoto (Turso) pagherebbe centinaia di andate e ritorni di rete se
 * inseriti uno a uno, mentre batch() li manda in un unico colpo.
 */
function buildShowtimeStatements(
  current: { id: number }[],
  upcoming: { id: number }[],
  past: { id: number }[],
): InStatement[] {
  const insertSql = `INSERT INTO showtimes (movie_id, starts_at, hall, format, price_cents, seats_total)
     VALUES (@movieId, @startsAt, @hall, @format, @price, @seats)`;
  const statements: InStatement[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Programmazione dei prossimi 21 giorni.
  for (let day = 0; day < 21; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const pool = day < 10 ? current : [...current, ...upcoming];
    if (!pool.length) continue;
    const showsToday = 4 + (day % 3);
    for (let s = 0; s < showsToday; s++) {
      const movie = pool[(day * 3 + s) % pool.length];
      // Una sala non può ospitare due film alla stessa ora: l'orario scorre
      // dentro la sala e si cambia sala solo quando gli orari sono esauriti.
      statements.push({
        sql: insertSql,
        args: {
          movieId: movie.id,
          startsAt: isoLocal(date, TIMES[s % TIMES.length]),
          hall: HALLS[Math.floor(s / TIMES.length) % HALLS.length],
          format: FORMATS[(day + s) % FORMATS.length],
          price: s % 4 === 0 ? 700 : 950,
          seats: 90 + ((day + s) % 4) * 30,
        },
      });
    }
  }

  // Archivio: 120 giorni di programmazioni passate, per la ricerca storica.
  for (let day = 1; day <= 120; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() - day);
    const pool = [...past, ...current];
    const showsThatDay = 2 + (day % 3);
    for (let s = 0; s < showsThatDay; s++) {
      const movie = pool[(day * 5 + s) % pool.length];
      statements.push({
        sql: insertSql,
        args: {
          movieId: movie.id,
          startsAt: isoLocal(date, TIMES[s % TIMES.length]),
          hall: HALLS[Math.floor(s / TIMES.length) % HALLS.length],
          format: FORMATS[(day * 2 + s) % FORMATS.length],
          price: s % 4 === 0 ? 700 : 950,
          seats: 90 + ((day + s) % 4) * 30,
        },
      });
    }
  }

  return statements;
}

async function seedPoll(): Promise<void> {
  const movies = await dbAll<{ id: number; title: string }>(
    `SELECT id, title FROM movies WHERE status IN ('catalogo','archivio') ORDER BY id LIMIT 4`,
  );
  if (!movies.length) return;

  const ends = new Date();
  ends.setDate(ends.getDate() + 14);

  const { lastInsertRowid: pollId } = await dbRun(
    `INSERT INTO polls (title, description, ends_at, status)
     VALUES (@title, @description, @ends, 'aperto')`,
    {
      title: "Rassegna del mese: quale classico proiettiamo?",
      description:
        "Il film più votato entra in programmazione la prima domenica del mese prossimo, in copia restaurata.",
      ends: ends.toISOString().slice(0, 16),
    },
  );

  const db = await getDb();
  await db.batch(
    movies.map((m) => ({
      sql: `INSERT INTO poll_options (poll_id, movie_id, label) VALUES (@pollId, @movieId, @label)`,
      args: { pollId, movieId: m.id, label: m.title },
    })),
    "write",
  );
}

async function seedRequests(): Promise<void> {
  const db = await getDb();
  await db.batch(
    [
      {
        sql: `INSERT INTO movie_requests (user_id, title, year, note, status)
              VALUES (NULL, @title, @year, @note, @status)`,
        args: {
          title: "Il grande Lebowski",
          year: 1998,
          note: "Sarebbe perfetto per una serata di mezzanotte.",
          status: "in_attesa",
        },
      },
      {
        sql: `INSERT INTO movie_requests (user_id, title, year, note, status)
              VALUES (NULL, @title, @year, @note, @status)`,
        args: {
          title: "Ritorno al futuro",
          year: 1985,
          note: "Una rassegna anni '80 avrebbe molto pubblico.",
          status: "approvata",
        },
      },
    ],
    "write",
  );
}

export async function seedIfEmpty(): Promise<void> {
  const count = await dbGet<{ n: number }>(`SELECT COUNT(*) AS n FROM movies`);
  if (count!.n > 0) return;

  const db = await getDb();

  await db.batch(
    MOVIES.map((m) => ({
      sql: `INSERT INTO movies
              (title, original_title, year, genres, duration_min, director, cast_list,
               synopsis, age_rating, status, featured)
            VALUES (@title, @original_title, @year, @genres, @duration_min, @director,
              @cast_list, @synopsis, @age_rating, @status, @featured)`,
      args: {
        title: m.title,
        original_title: m.original_title ?? null,
        year: m.year,
        genres: m.genres,
        duration_min: m.duration_min,
        director: m.director,
        cast_list: m.cast_list,
        synopsis: m.synopsis,
        age_rating: m.age_rating,
        status: m.status,
        featured: m.featured ? 1 : 0,
      },
    })),
    "write",
  );

  const [current, upcoming, past] = await Promise.all([
    dbAll<{ id: number }>(`SELECT id FROM movies WHERE status = 'in_programmazione' ORDER BY id`),
    dbAll<{ id: number }>(`SELECT id FROM movies WHERE status = 'prossimamente' ORDER BY id`),
    dbAll<{ id: number }>(
      `SELECT id FROM movies WHERE status IN ('archivio','catalogo') ORDER BY id`,
    ),
  ]);

  await db.batch(buildShowtimeStatements(current, upcoming, past), "write");
  await seedPoll();
  await seedRequests();
}

export async function ensureAdmin(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL || "admin@cinemaaureo.it").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "aureo2026";
  const existing = await dbGet(`SELECT id FROM users WHERE email = @email`, { email });
  if (existing) return;
  // "OR IGNORE": online il sito gira su più istanze indipendenti che possono
  // partire insieme e provare a creare l'admin nello stesso istante. Senza
  // questo, la seconda istanza fallirebbe sul vincolo UNIQUE dell'email e la
  // pagina mostrerebbe un errore del server.
  await dbRun(
    `INSERT OR IGNORE INTO users (name, email, password_hash, role)
     VALUES (@name, @email, @hash, 'admin')`,
    { name: "Direzione", email, hash: hashPassword(password) },
  );
}
