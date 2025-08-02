"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";

interface Song {
  id: string;
  name: string;
  preview_url: string;
  album: string;
  artists: string;
}

interface YouTubePreview {
  videoId: string;
  title: string;
  duration: string;
  url: string;
}

interface Guess {
  text: string;
  isCorrect: boolean;
}

export default function Home() {
  const [artist, setArtist] = useState("");
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [artistQuery, setArtistQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [artistResults, setArtistResults] = useState<{id: string, name: string}[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [youtubePreview, setYoutubePreview] = useState<YouTubePreview | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [showSongDropdown, setShowSongDropdown] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement | null>(null);

  const snippetLengths = [2, 5, 10, 20, 30, 60];

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
    }, 250);
  };

  const handleArtistSelect = async (artistId: string, artistName: string) => {
    setArtist(artistName);
    setArtistQuery(artistName);
    setSelectedArtistId(artistId);
    setShowDropdown(false);
    setGuesses([]);
    setCurrentSong(null);
    setYoutubePreview(null);
    setIsPlaying(false);
    setGameStarted(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const res = await fetch(`/api/artist-songs?id=${artistId}&name=${encodeURIComponent(artistName)}`);
      if (res.ok) {
        const data = await res.json();
        setAllSongs(data.songs || []);
        if (data.songs && data.songs.length > 0) {
          const randomSong = data.songs[Math.floor(Math.random() * data.songs.length)];
          setCurrentSong(randomSong);
          
          if (!randomSong.preview_url) {
            try {
              const previewRes = await fetch(`/api/song-preview?song=${encodeURIComponent(randomSong.name)}&artist=${encodeURIComponent(artistName)}`);
              if (previewRes.ok) {
                const previewData = await previewRes.json();
                setYoutubePreview(previewData);
              }
            } catch (error) {
              console.error('Failed to get YouTube preview:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    }
  };

  const handlePlayPause = async () => {
    if (!currentSong) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (youtubeIframeRef.current) {
        youtubeIframeRef.current.contentWindow?.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          '*'
        );
      }
      setIsPlaying(false);
    } else {
      const currentGuessIndex = guesses.length;
      const snippetLength = snippetLengths[currentGuessIndex] || 30;
      
      if (currentSong.preview_url) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
          }, snippetLength * 1000);
        } else {
          audioRef.current = new Audio(currentSong.preview_url);
          audioRef.current.play();
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
          }, snippetLength * 1000);
        }
        setIsPlaying(true);
      } else if (youtubePreview) {
        if (youtubeIframeRef.current) {
          youtubeIframeRef.current.contentWindow?.postMessage(
            `{"event":"command","func":"seekTo","args":[0, true]}`,
            '*'
          );
          youtubeIframeRef.current.contentWindow?.postMessage(
            '{"event":"command","func":"playVideo","args":""}',
            '*'
          );
          setTimeout(() => {
            if (youtubeIframeRef.current) {
              youtubeIframeRef.current.contentWindow?.postMessage(
                '{"event":"command","func":"pauseVideo","args":""}',
                '*'
              );
              setIsPlaying(false);
            }
          }, snippetLength * 1000);
          setIsPlaying(true);
        }
      }
      setGameStarted(true);
    }
  };

  const handleGuessInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGuess(value);
    setShowSongDropdown(value.trim() !== "");
  };

  const filteredSongs = guess.trim() 
    ? allSongs.filter(song => 
        song.name.toLowerCase().includes(guess.toLowerCase())
      ).slice(0, 10)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim() && currentSong) {
      const isCorrect = guess.trim().toLowerCase() === currentSong.name.toLowerCase();
      const newGuess: Guess = {
        text: guess.trim(),
        isCorrect: isCorrect
      };
      
      setGuesses([...guesses, newGuess]);
      setGuess("");
      setShowSongDropdown(false);
    }
  };

  const handleSkip = () => {
    if (currentSong) {
      const newGuess: Guess = {
        text: "",
        isCorrect: false
      };
      
      setGuesses([...guesses, newGuess]);
      setGuess("");
      setShowSongDropdown(false);
    }
  };

  const handlePlayAgain = async () => {
    if (!selectedArtistId || !artist) return;
    
    setGuesses([]);
    setCurrentSong(null);
    setYoutubePreview(null);
    setIsPlaying(false);
    setGameStarted(false);
    setGuess("");
    setShowSongDropdown(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const res = await fetch(`/api/artist-songs?id=${selectedArtistId}&name=${encodeURIComponent(artist)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.songs && data.songs.length > 0) {
          const randomSong = data.songs[Math.floor(Math.random() * data.songs.length)];
          setCurrentSong(randomSong);
          
          if (!randomSong.preview_url) {
            try {
              const previewRes = await fetch(`/api/song-preview?song=${encodeURIComponent(randomSong.name)}&artist=${encodeURIComponent(artist)}`);
              if (previewRes.ok) {
                const previewData = await previewRes.json();
                setYoutubePreview(previewData);
              }
            } catch (error) {
              console.error('Failed to get YouTube preview:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    }
  };

  const getGuessBoxClass = (index: number) => {
    if (index >= guesses.length) return styles.guessBox;
    
    const guess = guesses[index];
    return `${styles.guessBox} ${guess.isCorrect ? styles.correctGuess : styles.wrongGuess}`;
  };

  const getCurrentSnippetLength = () => {
    const currentGuessIndex = guesses.length;
    return snippetLengths[currentGuessIndex] || 30;
  };

  const hasWon = guesses.some(guess => guess.isCorrect);
  const hasLost = guesses.length >= 6 && !hasWon;

  return (
    <div className={styles.heardleBg}>
      {youtubePreview && (
        <iframe
          ref={youtubeIframeRef}
          src={`https://www.youtube.com/embed/${youtubePreview.videoId}?enablejsapi=1&autoplay=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&start=0&end=30`}
          style={{ display: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
      
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
                {artistResults.map((a) => (
                  <li
                    key={a.id}
                    className={styles.artistDropdownItem}
                    onMouseDown={() => handleArtistSelect(a.id, a.name)}
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
            <div key={i} className={getGuessBoxClass(i)}>
              {guesses[i]?.text || ""}
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
            <button 
              className={styles.playButton} 
              aria-label="Play"
              onClick={handlePlayPause}
              disabled={!currentSong}
            >
              {isPlaying ? "⏸️" : "▶️"}
            </button>
            <span className={styles.time}>{getCurrentSnippetLength()}s</span>
          </div>
        </section>
        <form className={styles.inputForm} onSubmit={handleSubmit} autoComplete="off">
          <div className={styles.inputWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.songInput}
              type="text"
              value={guess}
              onChange={handleGuessInput}
              placeholder="Know it? Search for the title"
              required
            />
            {guess && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={() => {
                  setGuess("");
                  setShowSongDropdown(false);
                }}
                aria-label="Clear"
              >
                ×
              </button>
            )}
            {showSongDropdown && filteredSongs.length > 0 && (
              <ul className={styles.songDropdown}>
                {filteredSongs.map((song) => (
                  <li
                    key={song.id}
                    className={styles.songDropdownItem}
                    onMouseDown={() => {
                      setGuess(song.name);
                      setShowSongDropdown(false);
                    }}
                  >
                    {song.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.buttonRow}>
            {hasWon ? (
              <button type="button" className={styles.playAgainButton} onClick={handlePlayAgain}>
                PLAY AGAIN
              </button>
            ) : (
              <button 
                type="button" 
                className={styles.skipButton} 
                onClick={handleSkip}
                disabled={!currentSong || hasLost}
              >
                SKIP (+1s)
              </button>
            )}
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={!currentSong || hasWon || hasLost}
            >
              SUBMIT
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
