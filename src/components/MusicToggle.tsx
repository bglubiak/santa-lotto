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

    // First click: start playback.
    if (!playing) {
      audio.play().then(() => {
        setPlaying(true);
        if (muted) audio.muted = true;
      }).catch(() => {
        // Playback blocked; user can click again. Keep it silent.
      });
      return;
    }

    // Subsequent clicks: toggle mute.
    const nextMuted = !muted;
    audio.muted = nextMuted;
    setMuted(nextMuted);
  }

  const label = !playing ? 'Play music' : (muted ? 'Unmute music' : 'Mute music');

  return (
    <div className="music-toggle">
      <audio ref={audioRef} src={jingle} loop preload="auto" />
      <button type="button" aria-label={label} title={label} onClick={handleClick}>
        {(!playing || !muted) ? <FaVolumeUp /> : <FaVolumeMute />}
      </button>
    </div>
  );
}

export default MusicToggle;
