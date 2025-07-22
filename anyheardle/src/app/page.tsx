"use client";
import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [artist, setArtist] = useState("");
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      setGuesses([...guesses, guess]);
      setGuess("");
    }
  };

  return (
    <div className={styles.heardleBg}>
      <header className={styles.header}>
        <span className={styles.iconInfo}>ⓘ</span>
        <h1 className={styles.title}>Heardle Unlimited</h1>
        <span className={styles.iconStats}>📶</span>
        <span className={styles.iconHelp}>?</span>
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
