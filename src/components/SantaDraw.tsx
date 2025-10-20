import { useState } from 'react';
import { drawNames, computePersonsWithoutGift } from '../utils/drawNames';

export default function SantaDraw() {
  const [namesInput, setNamesInput] = useState('Alice, Bob, Charlie, Diana');
  const [assignments, setAssignments] = useState<Record<string,string> | null>(null);
  const [withoutGift, setWithoutGift] = useState<string[]>([]);
  const [error, setError] = useState('');

  function handleDraw() {
    const names = namesInput.split(/[\n,]/).map(n => n.trim()).filter(Boolean);
    if (names.length < 2) {
      setError('Enter at least two names.');
      setAssignments(null);
      setWithoutGift([]);
      return;
    }
    const result = drawNames(names);
    const missing = computePersonsWithoutGift(names, result);
    setAssignments(result);
    setWithoutGift(missing);
    setError('');
  }

  function handleReset() {
    setAssignments(null);
    setWithoutGift([]);
    setError('');
  }

  return (
    <div style={{ marginTop: '2rem', padding: '1rem', background: '#fffaf4', border: '1px solid #eee', borderRadius: 12, maxWidth: 520 }}>
      <h2 style={{ marginTop: 0 }}>Secret Santa Draw</h2>
      <textarea
        value={namesInput}
        onChange={e => setNamesInput(e.target.value)}
        rows={3}
        placeholder="Enter names separated by commas or new lines"
        style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #ccc', fontFamily: 'inherit' }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleDraw} style={btnStyle}>Draw</button>
        <button onClick={handleReset} style={btnSecondaryStyle}>Reset</button>
      </div>
      {error && <div style={{ color: '#b00020', marginTop: 8 }}>{error}</div>}
      {assignments && (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: '0 0 8px' }}>Assignments</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {Object.entries(assignments).map(([giver, receiver]) => (
              <li key={giver} style={{ background: '#fff', padding: '6px 10px', marginBottom: 6, borderRadius: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>🎁 <strong>{giver}</strong> → <strong>{receiver}</strong></li>
            ))}
          </ul>
          {withoutGift.length > 0 && (
            <div style={{ marginTop: 8, color: '#b00020' }}>Without gift: {withoutGift.join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = { background: '#e63946', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 };
const btnSecondaryStyle: React.CSSProperties = { ...btnStyle, background: '#457b9d' };
