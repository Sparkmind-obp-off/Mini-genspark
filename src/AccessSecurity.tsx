import { useEffect, useRef, useState } from 'react';
import type { GeneratedCredential, SecuritySnapshot } from './security';
type Props = {
  request: <T>(path: string, options?: RequestInit) => Promise<T>;
  onError: (error: unknown) => void;
  onRevoked: () => void;
};
export default function AccessSecurity({ request, onError, onRevoked }: Props) {
  const [snapshot, setSnapshot] = useState<SecuritySnapshot | null>(null);
  const [window, setWindow] = useState('24h'); const [busy, setBusy] = useState(false);
  const [candidate, setCandidate] = useState<GeneratedCredential | null>(null);
  const [notice, setNotice] = useState(''); const alive = useRef(true); const lock = useRef(false); const sequence = useRef(0);
  useEffect(() => { alive.current = true; return () => { alive.current = false; sequence.current++; }; }, []);
  async function refresh() {
    const seq = ++sequence.current;
    try { const data = await request<SecuritySnapshot>('/api/security?window=' + window); if (alive.current && seq === sequence.current) setSnapshot(data); }
    catch (error) { if (alive.current && seq === sequence.current) { setSnapshot(null); setNotice('ERROR: security metrics unavailable; no counters are assumed.'); onError(error); } }
  }
  useEffect(() => { void refresh(); }, [window]);
  async function mutate(path: string, extra = {}) {
    return request<unknown>(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ confirm: true, ...extra }) });
  }
  async function generate() {
    if (lock.current || !globalThis.confirm('Generate a replacement application token? It is shown once and remains PENDING until you manually install it. Current credential is unchanged.')) return;
    lock.current = true; setBusy(true);
    try { const data = await mutate('/api/credentials/generate') as GeneratedCredential; if (alive.current) { setCandidate(data); setNotice('PENDING: save the secret securely, then follow the manual installation steps. It cannot be retrieved later.'); await refresh(); } }
    catch (error) { if (alive.current) onError(error); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }
  async function exportCandidate(copy: boolean) {
    if (!candidate || lock.current) return; lock.current = true; setBusy(true); const captured = candidate;
    try {
      await mutate('/api/credentials/authorize-export'); if (!alive.current) return;
      if (copy) { await navigator.clipboard.writeText(captured.token); if (alive.current) setNotice('Secret copied explicitly. Clear your clipboard after securely saving it.'); }
      else { const url = URL.createObjectURL(new Blob([captured.fileContent], { type: 'text/plain;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = captured.filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice('Secret file downloaded. Store it in a password manager or encrypted storage; never upload to Git/chat.'); }
    } catch (error) { if (alive.current) onError(error); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }
  async function verifyReplacement() {
    if (!candidate || lock.current) return; lock.current = true; setBusy(true);
    try {
      await request('/api/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: candidate.token }) });
      if (alive.current) { setCandidate(null); setNotice('VERIFIED: replacement login succeeded; old credential and old sessions are invalidated. Plaintext cleared.'); await refresh(); }
    } catch { if (alive.current) setNotice('PENDING: replacement login not verified. Install the secret in your own runtime first. Current browser session is not deliberately revoked by this check; if installation occurred, sign in with the replacement or recover through Cloudflare.'); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }
  async function revoke(allSessions: boolean) {
    if (lock.current || !globalThis.confirm(allSessions ? 'Revoke every owner session, including this one?' : 'Revoke the ACTIVE owner credential and all sessions? Recovery requires installing a NEW token via your Cloudflare account. Save a replacement first.')) return;
    lock.current = true; setBusy(true);
    try { if (allSessions) await request('/api/sessions', { method: 'DELETE' }); else await mutate('/api/credentials/revoke'); if (alive.current) { setCandidate(null); onRevoked(); } }
    catch (error) { if (alive.current) onError(error); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }
  async function cancel() {
    if (!candidate || lock.current) return; lock.current = true; setBusy(true);
    try { await mutate('/api/credentials/cancel', { fingerprint: candidate.fingerprint }); if (alive.current) { setCandidate(null); setNotice('Candidate cancelled. Never install a cancelled token; current credential unchanged.'); } }
    catch (error) { if (alive.current) onError(error); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }
  return <section className="security-panel" aria-label="Access & Security">
    <h2>Access & Security</h2><p>Owner-authorized application data only. Cloudflare BYOK; no Genspark Hosted Access Rules dependency.</p>
    <label className="field-label">Access window <select aria-label="Access window" value={window} onChange={e => setWindow(e.target.value)} disabled={busy}><option value="1h">1 hour</option><option value="24h">24 hours</option><option value="7d">7 days</option><option value="30d">30 days</option></select></label>
    <button className="secondary-button" disabled={busy} onClick={() => void refresh()}>Refresh security data</button>
    {!snapshot ? <p role="status">UNAVAILABLE: waiting for authenticated runtime metrics.</p> : <>
      <h3>Authentication</h3><p>{snapshot.authentication.status} · Session {snapshot.authentication.sessionLabel} · expires {snapshot.authentication.expiresAt}</p>
      <p>Last successful login: {snapshot.authentication.lastSuccess ?? 'UNAVAILABLE — no retained event'}. Last failed login: {snapshot.authentication.lastFailure ?? 'UNAVAILABLE — no retained event'}.</p>
      <p>Credential: {snapshot.credential.status} · fingerprint {snapshot.credential.fingerprint} · created {snapshot.credential.createdAt ?? 'UNAVAILABLE — externally created'}</p>
      <h3>Access counters — VERIFIED</h3><dl className="security-counts">{Object.entries(snapshot.counters).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
      <p>Window begins {snapshot.windowStart}. {snapshot.limitations}</p>
      <h3>Deployment readiness</h3>{Object.entries(snapshot.configuration).map(([key, value]) => <p key={key}><strong>{key}: {value.status}</strong> — {value.detail}</p>)}<p>Last authenticated health/schema check: {snapshot.lastHealthCheck}</p>
      <h3>Audit events — latest retained sample</h3><ol className="audit-events">{snapshot.events.map((event, index) => <li key={event.request_id + ':' + index}><time>{event.created_at}</time> · {event.category} · {event.outcome} · {event.action} · session {event.session_label ?? 'UNAVAILABLE'} · request {event.request_id} · {event.reason ?? 'no rejection'}</li>)}</ol>
    </>}
    <section aria-label="Authentication & Credentials"><h3>Authentication & Credentials</h3>
      <p>Tokens are password-equivalent secrets. Only a newly generated token is shown once. Closing this panel, logout or reload clears it; the server cannot retrieve it. Existing tokens cannot be downloaded.</p>
      <button className="primary-button" disabled={busy || Boolean(candidate)} onClick={() => void generate()}>Generate replacement credential</button>
      {candidate && <article><p>Created {candidate.createdAt} · {candidate.environment} · fingerprint {candidate.fingerprint.slice(0, 12)} · PENDING installation</p><label className="field-label" htmlFor="new-owner-credential">One-time secret — save securely</label><input id="new-owner-credential" className="token-input" type="password" value={candidate.token} readOnly autoComplete="off" />
        <button className="secondary-button" disabled={busy} onClick={() => void exportCandidate(false)}>Download new credential TXT</button><button className="secondary-button" disabled={busy} onClick={() => void exportCandidate(true)}>Copy new credential</button>
        <p>{candidate.installation}</p><p>Development: update ignored .dev.vars and restart Worker. Remote: install through your own Cloudflare terminal/dashboard. Single-secret replacement has no grace period; old sessions stop working once the secret changes. Save the replacement BEFORE installation.</p>
        <button className="primary-button" disabled={busy} onClick={() => void verifyReplacement()}>Verify replacement login</button><button className="secondary-button" disabled={busy} onClick={() => void cancel()}>Cancel pending credential</button>
      </article>}
      <button className="secondary-button" disabled={busy} onClick={() => void revoke(true)}>Revoke all sessions</button><button className="secondary-button" disabled={busy} onClick={() => void revoke(false)}>Revoke active credential</button>
      <p>Recovery: use your own Cloudflare account to install a NEW application token, then sign in. Never request an old token from server storage; Cloudflare API credentials never enter this interface.</p>
    </section>{notice && <p role="status">{notice}</p>}
  </section>;
}
