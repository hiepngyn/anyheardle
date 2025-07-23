"use client";
import { useState, useRef } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [artist, setArtist] = useState("");
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [artistQuery, setArtistQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [artistResults, setArtistResults] = useState<{id: string, name: string}[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleArtistInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setArtistQuery(value);
    setShowDropdown(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim() === "") {
      setArtistResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/artist?name=${encodeURIComponent(value)}&quantity=5`);
        if (res.ok) {
          const data = await res.json();
          setArtistResults(data.artists || []);
        } else {
          setArtistResults([]);
        }
      } catch {
        setArtistResults([]);
      }
    }, 250); // debounce
  };

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
              onChange={handleArtistInput}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              autoComplete="off"
            />
            {showDropdown && artistResults.length > 0 && (
              <ul className={styles.artistDropdown}>
                {artistResults.map((a, i) => (
                  <li
                    key={a.id}
                    className={styles.artistDropdownItem}
                    onMouseDown={() => {
                      setArtist(a.name);
                      setArtistQuery(a.name);
                      setShowDropdown(false);
                    }}
                  >
                    {a.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <span className={styles.iconStats}>📶</span>
          <span className={styles.iconHelp}>?</span>
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
