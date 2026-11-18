import { useRef, useState } from "react";
import { glossary } from "../data/glossary.js";

/** A "Glossary" button that opens a searchable list of terms. */
export default function Glossary() {
  const dialogRef = useRef(null);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const terms = glossary.filter(
    (g) => !q || g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q)
  );

  return (
    <>
      <button className="ghost" onClick={() => dialogRef.current?.showModal()}>
        Glossary
      </button>
      <dialog
        ref={dialogRef}
        className="glossary"
        aria-labelledby="glossary-title"
        onClick={(event) => {
          // Clicking the backdrop (outside the content) closes the dialog.
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <div className="glossary-inner">
          <div className="section-head">
            <h2 id="glossary-title">Glossary</h2>
            <button onClick={() => dialogRef.current?.close()}>Close</button>
          </div>
          <input
            type="search"
            placeholder="Search terms"
            aria-label="Search glossary"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <dl>
            {terms.map((g) => (
              <div key={g.term} className="glossary-entry">
                <dt>{g.term}</dt>
                <dd>{g.definition}</dd>
              </div>
            ))}
          </dl>
          {terms.length === 0 && <p className="muted">No matching terms.</p>}
        </div>
      </dialog>
    </>
  );
}
