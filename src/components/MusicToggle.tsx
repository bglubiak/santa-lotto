import React, { useRef, useState } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import jingle from '../audio/jingle-bells.mp3';

export function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  function handleClick() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!playing) {
      audio.play().then(() => {
        setPlaying(true);
        if (muted) audio.muted = true;
      }).catch(() => {
        // blocked
      });
      return;
    }
    const nextMuted = !muted;
    audio.muted = nextMuted;
    setMuted(nextMuted);
  }

  const label = !playing ? 'Play music' : (muted ? 'Unmute music' : 'Mute music');

  return (
    <div className="music-toggle">
      <audio ref={audioRef} src={jingle} loop preload="auto" />
      {/* Hint appears only before first play */}
      {!playing && (
        <button type="button" className="music-hint" onClick={handleClick} aria-label="Turn on the music">
          Turn on the music! →
        </button>
      )}
      {/* Volume control icon (clickable) always visible; before play it starts music, after play it toggles mute */}
      <button type="button" onClick={handleClick} aria-label={label} className="music-toggle-btn">
        {(!playing || !muted) ? <FaVolumeUp /> : <FaVolumeMute />}
      </button>
    </div>
  );
}

export default MusicToggle;
