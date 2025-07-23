"use client";
import { useState } from "react";
import styles from "./page.module.css";

const PLACEHOLDER_ARTISTS = [
  "The Beatles",
  "The Weeknd",
  "The Rolling Stones",
  "The Chainsmokers",
  "The Strokes",
  "The Who",
  "The Doors",
  "The Script",
  "The Killers",
  "The 1975"
];

export default function Home() {
  const [artist, setArtist] = useState("");
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [artistQuery, setArtistQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredArtists = artistQuery
    ? PLACEHOLDER_ARTISTS.filter(a => a.toLowerCase().includes(artistQuery.toLowerCase())).slice(0, 5)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      setGuesses([...guesses, guess]);
      setGuess("");
    }
  };

  return (
    <div className={styles.heardleBg}>
      <header className={styles.headerOriginal}>
        <span className={styles.iconInfo}>ⓘ</span>
        <h1 className={styles.titleCentered}>Heardle Unlimited</h1>
        <div className={styles.headerRightGroup}>
          <div className={styles.artistSearchWrapper}>
            <input
              className={styles.artistSearchInput}
              type="text"
              placeholder="Search artist..."
              value={artistQuery}
              onChange={e => {
                setArtistQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              autoComplete="off"
            />
            {showDropdown && filteredArtists.length > 0 && (
              <ul className={styles.artistDropdown}>
                {filteredArtists.map((a, i) => (
                  <li
                    key={i}
                    className={styles.artistDropdownItem}
                    onMouseDown={() => {
                      setArtist(a);
                      setArtistQuery(a);
                      setShowDropdown(false);
                    }}
                  >
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <span className={styles.iconStats}>📶</span>
        </div>
      </header>
      <main className={styles.mainHeardle}>
        <section className={styles.guessSection}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.guessBox}>
              {guesses[i] || ""}
            </div>
          ))}
        </section>
        <section className={styles.audioSection}>
          <div className={styles.progressBarWrapper}>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: "10%" }} />
            </div>
          </div>
          <div className={styles.audioControls}>
            <span className={styles.time}>0:00</span>
            <button className={styles.playButton} aria-label="Play">
              ▶️
            </button>
            <span className={styles.time}>0:16</span>
          </div>
        </section>
        <form className={styles.inputForm} onSubmit={handleSubmit} autoComplete="off">
          <div className={styles.inputWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.songInput}
              type="text"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              placeholder="Know it? Search for the title"
              required
            />
            {guess && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={() => setGuess("")}
                aria-label="Clear"
              >
                ×
              </button>
            )}
          </div>
          <div className={styles.buttonRow}>
            <button type="button" className={styles.skipButton}>
              SKIP (+1s)
            </button>
            <button type="submit" className={styles.submitButton}>
              SUBMIT
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
