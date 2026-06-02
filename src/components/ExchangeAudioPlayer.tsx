/**
 * ExchangeAudioPlayer
 *
 * Drop `exchange-explainer.mp3` into /public — nothing else needed.
 *
 * Renders two pieces:
 *   1. <ExchangeAudioPlayer.Pill />  — trigger button, place in hero
 *   2. <ExchangeAudioPlayer.Bar />   — fixed bottom bar (place once, near root)
 *
 * Or just render <ExchangeAudioPlayer /> which emits both (pill + portal bar).
 */

import { useRef, useState, useEffect, useCallback } from 'react';

const AUDIO_SRC = `${import.meta.env.BASE_URL}exchange-explainer.mp3`;

const fmt = (t: number) =>
  Math.floor(t / 60) + ':' + Math.floor(t % 60).toString().padStart(2, '0');

// ── Shared state via module-level singleton ──────────────────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();

const state = {
  isOpen: false,
  playing: false,
  currentTime: 0,
  duration: 0,
};

function notify() {
  listeners.forEach((fn) => fn());
}

// Single shared Audio instance
const sharedAudio = typeof window !== 'undefined' ? new Audio(AUDIO_SRC) : null;
if (sharedAudio) {
  sharedAudio.preload = 'metadata';
  sharedAudio.addEventListener('timeupdate', () => {
    state.currentTime = sharedAudio.currentTime;
    state.duration = sharedAudio.duration || 0;
    notify();
  });
  sharedAudio.addEventListener('ended', () => {
    state.playing = false;
    state.currentTime = 0;
    sharedAudio.currentTime = 0;
    notify();
  });
}

// ── Hook ─────────────────────────────────────────────────────────────────────
function usePlayerState() {
  const [, forceRender] = useState(0);
  useEffect(() => {
    const cb = () => forceRender((n) => n + 1);
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);
  return state;
}

// ── Actions ──────────────────────────────────────────────────────────────────
function openPlayer() {
  if (!sharedAudio) return;
  state.isOpen = true;
  sharedAudio.play().then(() => {
    state.playing = true;
    notify();
  }).catch(() => {
    notify();
  });
}

function closePlayer() {
  if (!sharedAudio) return;
  state.isOpen = false;
  sharedAudio.pause();
  state.playing = false;
  notify();
}

function togglePlayback() {
  if (!sharedAudio) return;
  if (state.playing) {
    sharedAudio.pause();
    state.playing = false;
  } else {
    sharedAudio.play().catch(() => {});
    state.playing = true;
  }
  notify();
}

function toggleFromPill() {
  if (!state.isOpen) {
    openPlayer();
  } else {
    togglePlayback();
  }
}

function seekTo(fraction: number) {
  if (!sharedAudio || !sharedAudio.duration) return;
  sharedAudio.currentTime = fraction * sharedAudio.duration;
}

// ── Pill trigger ─────────────────────────────────────────────────────────────
export function ExchangeListenPill() {
  const { isOpen, playing } = usePlayerState();

  const label = isOpen && playing
    ? 'Playing…'
    : isOpen
    ? 'Resume'
    : 'Listen — 3-min explainer';

  const showPause = isOpen && playing;

  return (
    <>
      <style>{`
        @keyframes cyan-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,247,0.3); }
          50%       { box-shadow: 0 0 0 8px rgba(0,255,247,0); }
        }
        .exchange-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: 1px solid rgba(0,255,247,0.35);
          color: #00fff7;
          font-family: 'Rajdhani', 'Orbitron', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          padding: 10px 22px;
          border-radius: 100px;
          cursor: pointer;
          transition: border-color .2s, background .2s, box-shadow .2s;
          animation: cyan-pulse 2.4s ease-in-out infinite;
        }
        .exchange-pill:hover {
          border-color: #00fff7;
          background: rgba(0,255,247,0.07);
          animation: none;
          box-shadow: 0 0 0 8px rgba(0,255,247,0.08);
        }
        .exchange-pill.playing {
          border-color: #00fff7;
          background: rgba(0,255,247,0.1);
          animation: none;
        }
        .exchange-pill svg {
          width: 14px;
          height: 14px;
          fill: currentColor;
          flex-shrink: 0;
        }
      `}</style>
      <button
        id="exchangeListenPill"
        className={`exchange-pill${isOpen ? ' playing' : ''}`}
        onClick={toggleFromPill}
        aria-label={label}
      >
        <svg viewBox="0 0 24 24">
          {showPause
            ? <><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></>
            : <polygon points="5,3 19,12 5,21"/>
          }
        </svg>
        <span>{label}</span>
      </button>
    </>
  );
}

// ── Fixed bottom player bar ───────────────────────────────────────────────────
export function ExchangePlayerBar() {
  const { isOpen, playing, currentTime, duration } = usePlayerState();
  const progressRef = useRef<HTMLDivElement>(null);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
  }, []);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const timeLabel = duration > 0
    ? `${fmt(currentTime)} / ${fmt(duration)}`
    : '0:00 / 0:00';

  return (
    <>
      <style>{`
        .exchange-player-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 300;
          background: #080808;
          border-top: 1px solid rgba(0,255,247,0.12);
          padding: 12px 40px;
          display: flex;
          align-items: center;
          gap: 18px;
          transform: translateY(100%);
          transition: transform .35s cubic-bezier(.4,0,.2,1);
        }
        .exchange-player-bar.open { transform: translateY(0); }

        .exchange-player-play {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: #00fff7;
          border: none;
          color: #000;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background .2s, transform .15s;
        }
        .exchange-player-play:hover { background: #5ffffc; transform: scale(1.05); }
        .exchange-player-play svg { width: 13px; height: 13px; fill: #000; }

        .exchange-player-info { min-width: 0; flex-shrink: 0; }
        .exchange-player-label {
          display: block;
          font-family: 'Rajdhani', monospace;
          font-size: 9px; font-weight: 700; letter-spacing: .16em;
          text-transform: uppercase; color: #00fff7; margin-bottom: 2px;
        }
        .exchange-player-title {
          display: block;
          font-family: 'Rajdhani', monospace;
          font-size: 11px; font-weight: 600; color: #d0d0d0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 240px;
        }

        .exchange-player-progress {
          flex: 1; height: 3px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          cursor: pointer; position: relative; min-width: 80px;
          transition: height .15s, margin-top .15s;
        }
        .exchange-player-progress:hover { height: 5px; margin-top: -1px; }
        .exchange-player-fill {
          height: 100%; background: #00fff7;
          border-radius: 2px; pointer-events: none;
          transition: width .1s linear;
        }

        .exchange-player-time {
          font-size: 11px; color: #a0a0a0;
          font-family: 'Rajdhani', monospace;
          letter-spacing: .04em; flex-shrink: 0; white-space: nowrap;
        }
        .exchange-player-close {
          background: none; border: none; color: #a0a0a0;
          font-size: 16px; cursor: pointer; padding: 4px 6px; line-height: 1;
          transition: color .2s; flex-shrink: 0;
        }
        .exchange-player-close:hover { color: #fff; }

        @media(max-width:600px) {
          .exchange-player-bar { padding: 10px 16px; gap: 12px; }
          .exchange-player-info { display: none; }
        }
      `}</style>

      <div
        id="exchangePlayerBar"
        className={`exchange-player-bar${isOpen ? ' open' : ''}`}
        role="region"
        aria-label="Exchange audio player"
      >
        {/* Play/Pause */}
        <button
          className="exchange-player-play"
          onClick={togglePlayback}
          title={playing ? 'Pause' : 'Play'}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          <svg viewBox="0 0 24 24">
            {playing
              ? <><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></>
              : <polygon points="5,3 19,12 5,21"/>
            }
          </svg>
        </button>

        {/* Track info */}
        <div className="exchange-player-info">
          <span className="exchange-player-label">Exchange Explainer</span>
          <span className="exchange-player-title">What is the Hermetic Labs Exchange?</span>
        </div>

        {/* Progress bar */}
        <div
          className="exchange-player-progress"
          ref={progressRef}
          onClick={handleSeek}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <div
            className="exchange-player-fill"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Time */}
        <span className="exchange-player-time">{timeLabel}</span>

        {/* Close */}
        <button
          className="exchange-player-close"
          onClick={closePlayer}
          title="Close player"
          aria-label="Close player"
        >
          &#x2715;
        </button>
      </div>
    </>
  );
}
