import { useState } from 'react';
import { drawNames } from '../utils/drawNames';

type Participant = {
  id: string;
  name: string;
  email: string;
  wishlist: string; // comma separated items
};

export default function SantaDraw() {
  const [participants, setParticipants] = useState<Participant[]>(() => [
    { id: crypto.randomUUID(), name: 'Bartek', email: 'bartek@gmail.com', wishlist: 'Dron, drukarka 3d, samochód' },
    { id: crypto.randomUUID(), name: 'Dorota', email: 'dorota@gmail.com', wishlist: 'Kosmetyki, Ubrania, Wakacje' },
    { id: crypto.randomUUID(), name: 'Agata', email: 'agata@gmail.com', wishlist: 'Sweter, Farby, Bilety na wystawę' },
  ]);
  const [results, setResults] = useState<DrawResult[] | null>(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSummary, setSendSummary] = useState<string>('');

  function updateParticipant(id: string, patch: Partial<Participant>) {
    setParticipants(p => p.map(row => row.id === id ? { ...row, ...patch } : row));
  }

  function addParticipant() {
    setParticipants(p => [...p, { id: crypto.randomUUID(), name: '', email: '', wishlist: '' }]);
  }

  function removeParticipant(id: string) {
    setParticipants(p => p.filter(row => row.id !== id));
  }

  function validate(): string[] {
    const errs: string[] = [];
    if (participants.length < 2) errs.push('Need at least 2 participants.');
    const names = participants.map(p => p.name.trim()).filter(Boolean);
    if (names.length !== participants.length) errs.push('Every participant needs a name.');
    const emails = participants.map(p => p.email.trim()).filter(Boolean);
    if (emails.length !== participants.length) errs.push('Every participant needs an email.');
    const nameSet = new Set(names);
    if (nameSet.size !== names.length) errs.push('Names must be unique.');
    const emailSet = new Set(emails);
    if (emailSet.size !== emails.length) errs.push('Emails must be unique.');
    // Wishlist length validation (max 3 items)
    for (const p of participants) {
      const count = p.wishlist.split(',').map(w => w.trim()).filter(Boolean).length;
      if (count > 3) errs.push(`${p.name || 'Participant'} wishlist exceeds 3 items (limit 3).`);
    }
    return errs;
  }

  async function launchConfetti() {
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({ particleCount: 160, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => confetti({ particleCount: 100, spread: 100, origin: { y: 0.4 } }), 300);
    } catch {
      // ignore if library fails
    }
  }

  function handleDraw() {
    const errs = validate();
    if (errs.length) {
      setError(errs.join(' '));
      setResults(null);
      return;
    }
    const names = participants.map(p => p.name.trim());
    try {
      const assignments = drawNames(names);
      const mapped: DrawResult[] = participants.map(giver => {
        const receiverName = assignments[giver.name.trim()];
        const receiver = participants.find(p => p.name.trim() === receiverName)!;
        const wishlistItems = receiver.wishlist.split(',').map(w => w.trim()).filter(Boolean);
        const subject = 'Your Secret Santa Assignment!';
        const body = formatEmailBody(giver.name, receiver.name, wishlistItems);
        const mailtoHref = buildMailTo(giver.email, subject, body);
        return { giver, receiver, wishlistItems, subject, body, mailtoHref };
      });
      setResults(mapped);
      setError('');
      launchConfetti();
    } catch (e) {
      setError('Draw failed, please try again.');
      setResults(null);
    }
  }

  function handlePrint() {
    window.print();
  }

  async function sendEmails() {
    if (!results) return;
    setSending(true);
    setSendSummary('');
    const payload = {
      emails: results.map(r => ({
        to: r.giver.email,
        subject: r.subject,
        body: buildPlainBody(r.giver.name, r.receiver.name, r.wishlistItems)
      }))
    };
    try {
      const res = await fetch('http://localhost:4000/api/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setSendSummary(`Failed: ${data.error || 'Unknown error'}`);
      } else {
        const failedCount = data.failedCount || 0;
        if (failedCount === 0) {
          setSendSummary(`All ${data.total} emails sent successfully.`);
        } else {
          setSendSummary(`Sent ${data.total - failedCount}/${data.total}. Failures: ${data.results.filter((r: any) => !r.success).map((r: any) => r.to).join(', ')}`);
        }
      }
    } catch (e: any) {
      setSendSummary(`Network error: ${e?.message || 'Unknown'}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="santa-draw-container" style={{ marginTop: '2rem', padding: '1rem', background: '#fffaf4', border: '1px solid #eee', borderRadius: 12, width: '98%', maxWidth: 1200, minWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
      <h2 style={{ marginTop: 0, fontFamily: '"Mountains of Christmas", cursive', fontWeight: 700, fontSize: '2.2rem', color: '#b31217', letterSpacing: '1px', textShadow: '0 2px 8px #fff70088, 0 0 2px #fff' }}>Enter participants</h2>
      <p style={{ marginTop: 0, fontSize: 14 }}>Enter participants (max 3 wishlist items), then click Draw. Each result includes a ready email.</p>

      <div className="no-print">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 700 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Wishlist (comma separated)</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {participants.map(p => (
              <tr key={p.id}>
                <td style={tdStyle}><input value={p.name} onChange={e => updateParticipant(p.id, { name: e.target.value })} placeholder="Name" style={inputStyle} /></td>
                <td style={tdStyle}><input value={p.email} onChange={e => updateParticipant(p.id, { email: e.target.value })} placeholder="Email" style={inputStyle} /></td>
                <td style={tdStyle}><input value={p.wishlist} onChange={e => updateParticipant(p.id, { wishlist: e.target.value })} placeholder="Item1, Item2 (max 3)" style={inputStyle} /></td>
                <td style={tdStyle}>
                  <button onClick={() => removeParticipant(p.id)} style={tinyBtnStyle} title="Remove">✖</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={addParticipant} style={btnSecondaryStyle}>Add Person</button>
          <button onClick={handleDraw} style={btnStyle}>Draw</button>
          <button onClick={() => { setResults(null); setError(''); }} style={btnSecondaryStyle}>Clear Results</button>
        </div>
      </div>

      {error && <div style={{ color: '#b00020', marginTop: 8 }}>{error}</div>}

      {results && (
        <div id="results-section" style={{ marginTop: 20 }}>
          <h3 style={{ margin: '0 0 8px' }}>Assignments</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {results.map(r => (
              <li key={r.giver.id} style={resultRowStyle} className="result-item">
                🎁 <strong>{r.giver.name}</strong> → <strong>{r.receiver.name}</strong>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  Wishlist: {r.wishlistItems.length ? r.wishlistItems.join(', ') : '(empty)'}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }} className="no-print">
                  <button onClick={() => navigator.clipboard.writeText(r.body)} style={tinyBtnStyle}>Copy Email Text</button>
                  <a href={r.mailtoHref} style={{ ...tinyBtnStyle, textDecoration: 'none', display: 'inline-block' }}>Open Email</a>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }} className="no-print">
            <button onClick={handlePrint} style={btnSecondaryStyle}>Print / Save PDF</button>
            <button onClick={sendEmails} style={{ ...btnStyle, opacity: sending ? 0.6 : 1 }} disabled={sending}>{sending ? 'Sending...' : 'Send Emails'}</button>
            {sendSummary && <span style={{ fontSize: 12, color: sendSummary.startsWith('All') ? '#2e7d32' : (sendSummary.startsWith('Sent') ? '#c77d00' : '#b00020') }}>{sendSummary}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

type DrawResult = {
  giver: Participant;
  receiver: Participant;
  wishlistItems: string[];
  subject: string;
  body: string;
  mailtoHref: string;
};

function formatEmailBody(giver: string, receiver: string, wishlist: string[]): string {
  return `Hi ${giver},%0D%0A%0D%0AYou are the Secret Santa for ${receiver}! 🎄%0D%0AWishlist suggestions:%0D%0A${wishlist.map((w,i) => `${i+1}. ${w}`).join('%0D%0A') || 'No wishlist provided.'}%0D%0A%0D%0APlease keep it secret!%0D%0AMerry Christmas!`; // Keep encoded line breaks for mailto safety
}

function buildMailTo(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`; // body already partially encoded
}

function buildPlainBody(giver: string, receiver: string, wishlist: string[]): string {
  return `Hi ${giver},\n\nYou are the Secret Santa for ${receiver}! 🎄\nWishlist suggestions:\n${wishlist.map((w,i) => `${i+1}. ${w}`).join('\n') || 'No wishlist provided.'}\n\nPlease keep it secret!\nMerry Christmas!`;
}

const btnStyle: React.CSSProperties = { background: '#e63946', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 };
const btnSecondaryStyle: React.CSSProperties = { ...btnStyle, background: '#457b9d' };
const tinyBtnStyle: React.CSSProperties = { ...btnStyle, background: '#457b9d', padding: '4px 8px', fontSize: 12, fontWeight: 500 };
const thStyle: React.CSSProperties = { padding: '4px 4px', borderBottom: '1px solid #ddd', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '4px 4px' };
const inputStyle: React.CSSProperties = { width: '95%', padding: '4px 6px', borderRadius: 6, border: '1px solid #ccc', fontSize: 13 };
const resultRowStyle: React.CSSProperties = { background: '#fff', padding: '8px 10px', marginBottom: 8, borderRadius: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' };
