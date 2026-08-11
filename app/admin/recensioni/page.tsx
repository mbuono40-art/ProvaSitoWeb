import Link from "next/link";
import { toggleReviewAction } from "@/app/actions/admin";
import { deleteReviewAction } from "@/app/actions/reviews";
import { Stars } from "@/components/Stars";
import { formatFullDate } from "@/lib/format";
import { allReviews } from "@/lib/queries";

export default async function AdminRecensioniPage() {
  const recensioni = await allReviews();
  const nascoste = recensioni.filter((r) => r.hidden).length;

  return (
    <div className="colonna">
      <div className="riga riga-tra">
        <h2>Recensioni ({recensioni.length})</h2>
        {nascoste > 0 && (
          <span className="badge badge-rosso">{nascoste} nascoste</span>
        )}
      </div>

      <p className="tenue piccolo">
        Una recensione nascosta resta nel database ma sparisce dal sito e non conta
        più nella media dei voti.
      </p>

      {recensioni.length ? (
        recensioni.map((r) => (
          <div
            key={r.id}
            className="pannello"
            style={r.hidden ? { opacity: 0.55 } : undefined}
          >
            <div className="recensione-testata">
              <span className="avatar">{r.author.charAt(0).toUpperCase()}</span>
              <span className="recensione-autore">{r.author}</span>
              <span className="tenue piccolo">su</span>
              <Link href={`/film/${r.movie_id}`} className="oro">
                {r.movie_title}
              </Link>
              <Stars value={r.rating} size="0.85rem" />
              <span className="badge">{r.rating}/10</span>
              <span className="recensione-data">
                {formatFullDate(r.created_at.replace(" ", "T"))}
              </span>
            </div>
            {r.body && <p className="recensione-corpo">{r.body}</p>}

            <div className="riga" style={{ marginTop: 12 }}>
              <form action={toggleReviewAction}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="btn btn-piccolo">
                  {r.hidden ? "Rendi visibile" : "Nascondi dal sito"}
                </button>
              </form>
              <form action={deleteReviewAction}>
                <input type="hidden" name="review_id" value={r.id} />
                <input type="hidden" name="movie_id" value={r.movie_id} />
                <button type="submit" className="btn btn-piccolo btn-rosso">
                  Elimina
                </button>
              </form>
              {r.author_email && (
                <Link
                  href={`/admin/utenti?q=${encodeURIComponent(r.author_email)}`}
                  className="btn btn-piccolo btn-fantasma"
                >
                  Gestisci l'utente →
                </Link>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="vuoto">Non è ancora stata scritta nessuna recensione.</div>
      )}
    </div>
  );
}
