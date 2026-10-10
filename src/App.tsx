import { useEffect, useRef, useState } from "react";
import { MODES, type Mode, type Source } from "./domain";
type Task = { id: string; conversationId: string; prompt: string; response: string; status: string; error: string | null; mode: Mode; sources: Source[]; provider: string; model: string; notice: string; analysis: unknown };
type Conversation = { id: string; title: string; mode: Mode };
type Artifact = { id: string; title: string; content?: string; created_at: string; updated_at?: string; revision?: number };
type Providers = { inference: { provider: string; model: string; configured: boolean; enabled: boolean }; search: { configured: boolean; enabled: boolean }; usage: { used: number; limit: number; searchMonthUsed: number; searchMonthLimit: number }; costPolicy: string; disabled: string[] };
const labels: Record<Mode, { title: string; description: string; icon: string; placeholder: string }> = {
  chat: { title: "Chat", description: "Think through an idea", icon: "C", placeholder: "Ask a question or work through an idea…" },
  research: { title: "Research", description: "Work with retrieved evidence", icon: "R", placeholder: "Research a topic using search excerpts and source citations…" },
  create: { title: "Create", description: "Create an editable Markdown deliverable", icon: "D", placeholder: "Describe a document, proposal or plan…" },
  analyze: { title: "Analyze", description: "Analyze pasted text, CSV or JSON", icon: "A", placeholder: "Paste your text or structured data (no file upload)…" },
  build: { title: "Build", description: "Generate code as text; no execution", icon: "B", placeholder: "Describe the code or implementation plan…" }
};
class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const data = await response.json();
  if (!response.ok) throw new ApiError(response.status, data.message ?? data.error ?? "API request failed");
  return data as T;
}
export default function App() {
  const [mode, setMode] = useState<Mode>("chat"); const [prompt, setPrompt] = useState("");
  const [inputType, setInputType] = useState<"text" | "csv" | "json">("text");
  const [authenticated, setAuthenticated] = useState(false); const [providers, setProviders] = useState<Providers | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]); const [conversationId, setConversationId] = useState<string>();
  const [tasks, setTasks] = useState<Task[]>([]); const [artifacts, setArtifacts] = useState<Artifact[]>([]); const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [projectTitle, setProjectTitle] = useState(""); const [activeTitle, setActiveTitle] = useState("");
  const [projectSources, setProjectSources] = useState<(Source & { recordId?: string })[]>([]);
  const [sourceTitle, setSourceTitle] = useState(""); const [sourceUrl, setSourceUrl] = useState(""); const [sourceEvidence, setSourceEvidence] = useState("");
  const [workflow, setWorkflow] = useState<"manual-brief" | "provider">("manual-brief");
  const [artifactDraft, setArtifactDraft] = useState(""); const [artifactTitle, setArtifactTitle] = useState(""); const [savingArtifact, setSavingArtifact] = useState(false);
  const [busy, setBusy] = useState(false); const [notice, setNotice] = useState<string | null>(null); const [settingsOpen, setSettingsOpen] = useState(false);
  const [ownerToken, setOwnerToken] = useState(""); const [loginBusy, setLoginBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null); const submitLock = useRef(false); const authEpoch = useRef(0); const retry = useRef<{ body: string; key: string } | undefined>(undefined);
  const usable = mode === "research" && workflow === "manual-brief" ? Boolean(authenticated && conversationId && projectSources.length) : Boolean(authenticated && providers?.inference.configured && providers.inference.enabled && (mode !== "research" || (providers.search.configured && providers.search.enabled)));
  const running = tasks.some(t => t.status === "running"); const locked = busy || running || savingArtifact;
  function clearPrivateView() {
    authEpoch.current += 1; submitLock.current = false; mutationLock.current = false;
    setAuthenticated(false); setProviders(null); setHistory([]); setTasks([]); setArtifacts([]); setSelectedArtifact(null); setProjectSources([]); setConversationId(undefined); setPrompt(""); setOwnerToken(""); setActiveTitle(""); setProjectTitle(""); setSourceTitle(""); setSourceUrl(""); setSourceEvidence(""); setArtifactDraft(""); setArtifactTitle(""); setBusy(false); setSavingArtifact(false); retry.current = undefined;
  }
  function reportError(error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      clearPrivateView();
      setNotice("Session expired or unauthorized. Sign in again; private data cleared from this view.");
    } else setNotice(error instanceof Error ? error.message : "Request failed. No retry or fallback.");
  }
  async function refresh() {
    const epoch = authEpoch.current;
    const [p, h] = await Promise.all([api<Providers>("/api/providers"), api<Conversation[]>("/api/conversations")]);
    if (epoch !== authEpoch.current) return;
    setProviders(p); setHistory(h);
  }
  async function loadConversation(id: string) {
    const epoch = authEpoch.current;
    const data = await api<{ title?: string; mode?: Mode; sources?: (Source & { recordId?: string })[]; tasks: Task[]; artifacts: Artifact[] }>("/api/conversations/" + id);
    if (epoch !== authEpoch.current) return;
    setConversationId(id); setTasks(data.tasks); setArtifacts(data.artifacts); setSelectedArtifact(null);
    setActiveTitle(data.title ?? data.tasks[0]?.prompt.slice(0, 90) ?? ""); setProjectTitle(data.title ?? ""); setProjectSources(data.sources ?? []);
    if (data.mode ?? data.tasks[0]?.mode) setMode(data.mode ?? data.tasks[0].mode);
  }
  useEffect(() => {
    // Remove legacy browser credential persistence without reading its value.
    try { sessionStorage.removeItem("vestren-owner-token"); sessionStorage.removeItem("mini-genspark-owner-token"); } catch { /* Storage may be disabled; no credential persistence is used. */ }
    const epoch = authEpoch.current;
    api("/api/session").then(() => { if (epoch !== authEpoch.current) return; setAuthenticated(true); return refresh(); }).catch(() => { if (epoch === authEpoch.current) setNotice("Owner login required. Configure runtime secrets through the setup guide; never enter provider keys in this browser."); });
  }, []);
  useEffect(() => { if (settingsOpen) dialog.current?.showModal(); else dialog.current?.close(); }, [settingsOpen]);
  useEffect(() => {
    if (!running || !conversationId) return;
    const interval = setInterval(() => { void loadConversation(conversationId).catch(reportError); }, 2500);
    return () => clearInterval(interval);
  }, [running, conversationId]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k" && !locked) { e.preventDefault(); newTask(); } };
    window.addEventListener("keydown", listener); return () => window.removeEventListener("keydown", listener);
  });
  function allowDiscard() { return !selectedArtifact || artifactDraft === (selectedArtifact.content ?? "") && artifactTitle === selectedArtifact.title || window.confirm("Discard unsaved artifact edits?"); }
  function newTask(nextMode: Mode = "research") { if (!allowDiscard()) return; createRequest.current = null; setWorkflow("manual-brief"); setSourceTitle(""); setSourceUrl(""); setSourceEvidence(""); setActiveTitle(""); setProjectTitle(""); setProjectSources([]); setArtifactDraft(""); setArtifactTitle(""); setMode(nextMode); setConversationId(undefined); setTasks([]); setArtifacts([]); setSelectedArtifact(null); setPrompt(""); setInputType("text"); retry.current = undefined; }
  async function login(e: React.FormEvent) {
    e.preventDefault(); if (loginBusy) return; const epoch = authEpoch.current; setLoginBusy(true);
    try { await api("/api/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: ownerToken }) }); if (epoch !== authEpoch.current) return; setOwnerToken(""); setAuthenticated(true); await refresh(); if (epoch === authEpoch.current) setNotice("Owner session active (8 hours). Token not retained in browser storage."); }
    catch (error) { if (epoch === authEpoch.current) reportError(error); }
    finally { if (epoch === authEpoch.current) { setOwnerToken(""); setLoginBusy(false); } }
  }
  async function logout() {
    // Invalidate in-flight private reads/writes before awaiting the network logout.
    clearPrivateView(); setSettingsOpen(false); setNotice("Signing out…");
    const epoch = authEpoch.current;
    try { await api("/api/session", { method: "DELETE" }); if (epoch === authEpoch.current) setNotice("Logged out. Server session revocation confirmed."); }
    catch { if (epoch === authEpoch.current) setNotice("Private data was cleared from this view, but server revocation could not be confirmed. Retry logout; the session expires automatically after 8 hours."); }
  }
  async function submitTask(e?: React.FormEvent) {
    e?.preventDefault(); if (!prompt.trim() || submitLock.current || locked || !usable || !allowDiscard()) return;
    submitLock.current = true; setBusy(true); setNotice(null);
    const epoch = authEpoch.current;
    const body = JSON.stringify({ mode, prompt: prompt.trim(), inputType: mode === "analyze" ? inputType : "text", ...(mode === "research" ? { workflow } : {}), ...(conversationId ? { conversationId } : {}) });
    const key = retry.current?.body === body ? retry.current.key : crypto.randomUUID(); retry.current = { body, key };
    try {
      const task = await api<Task>("/api/tasks", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": key }, body });
      if (epoch !== authEpoch.current) return;
      await loadConversation(task.conversationId); if (epoch !== authEpoch.current) return; setPrompt(""); retry.current = undefined;
      setNotice(task.status === "succeeded" ? "Succeeded with " + task.provider + " / " + task.model + ". Output persisted." : "Task status: " + task.status + (task.error ? " / " + task.error : ""));
    } catch (error) { if (epoch === authEpoch.current) reportError(error); }
    finally { if (epoch === authEpoch.current) { try { await refresh(); } catch (error) { if (epoch === authEpoch.current && error instanceof ApiError && error.status === 401) reportError(error); } if (epoch === authEpoch.current) { setBusy(false); submitLock.current = false; } } }
  }
  async function deleteConversation() {
    if (!conversationId || locked || !window.confirm("Delete this conversation, tasks and artifacts? Usage counters will not reset.")) return;
    const epoch = authEpoch.current;
    try { await api("/api/conversations/" + conversationId, { method: "DELETE" }); if (epoch !== authEpoch.current) return; newTask(); await refresh(); if (epoch === authEpoch.current) setNotice("Conversation deleted; usage counters retained."); }
    catch (error) { if (epoch === authEpoch.current) reportError(error); }
  }
  async function viewArtifact(id: string) { if (!allowDiscard()) return; const epoch = authEpoch.current; try { const artifact = await api<Artifact>("/api/artifacts/" + id); if (epoch !== authEpoch.current) return; setSelectedArtifact(artifact); setArtifactDraft(artifact.content ?? ""); setArtifactTitle(artifact.title); } catch (error) { if (epoch === authEpoch.current) reportError(error); } }
  async function copyArtifact() { try { await navigator.clipboard.writeText(artifactDraft); setNotice("Artifact copied."); } catch { setNotice("Clipboard permission unavailable. Select and copy the preview text manually."); } }
  async function downloadArtifact(format: string) {
    if (!selectedArtifact) return; const epoch = authEpoch.current; const artifactId = selectedArtifact.id;
    try {
      const response = await fetch(`/api/artifacts/${artifactId}?format=${format}`, { credentials: "same-origin" });
      if (!response.ok) throw new ApiError(response.status, "Download failed. Check session and format.");
      const blob = await response.blob(); if (epoch !== authEpoch.current) return;
      const objectUrl = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = objectUrl; link.download = `vestren-${artifactId}.${format}`; link.click(); setTimeout(() => URL.revokeObjectURL(objectUrl), 1000); setNotice("Artifact downloaded: " + format);
    } catch (error) { if (epoch === authEpoch.current) reportError(error); }
  }
  const mutationLock = useRef(false); const createRequest = useRef<{ title: string; id: string } | null>(null);
  function beginMutation() { if (mutationLock.current || locked) return false; mutationLock.current = true; setBusy(true); return true; }
  function finishMutation(epoch?: number) { if (epoch !== undefined && epoch !== authEpoch.current) return; mutationLock.current = false; setBusy(false); }
  async function createProject(e: React.FormEvent) {
    e.preventDefault(); if (!authenticated || !projectTitle.trim() || !beginMutation()) return;
    const epoch = authEpoch.current; const name = projectTitle.trim(); const id = createRequest.current?.title === name ? createRequest.current.id : crypto.randomUUID(); createRequest.current = { title: name, id };
    try { const p = await api<{ id: string }>("/api/projects", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": id }, body: JSON.stringify({ title: name }) }); if (epoch !== authEpoch.current) return; await loadConversation(p.id); if (epoch !== authEpoch.current) return; await refresh(); if (epoch !== authEpoch.current) return; createRequest.current = null; setNotice("Project saved. Add permitted excerpts; URLs are not fetched in manual mode."); }
    catch (error) { if (epoch === authEpoch.current) reportError(error); } finally { finishMutation(epoch); }
  }
  async function renameProject(e: React.FormEvent) {
    e.preventDefault(); if (!conversationId || !projectTitle.trim() || !beginMutation()) return;
    const epoch = authEpoch.current;
    try { await api("/api/projects/" + conversationId, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: projectTitle.trim() }) }); if (epoch !== authEpoch.current) return; setActiveTitle(projectTitle.trim()); await refresh(); if (epoch === authEpoch.current) setNotice("Project renamed."); }
    catch (error) { if (epoch === authEpoch.current) reportError(error); } finally { finishMutation(epoch); }
  }
  async function addSource(e: React.FormEvent) {
    e.preventDefault(); if (!conversationId || !allowDiscard() || !beginMutation()) return;
    const epoch = authEpoch.current;
    try { await api("/api/projects/" + conversationId + "/sources", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: sourceTitle, url: sourceUrl, evidence: sourceEvidence }) }); if (epoch !== authEpoch.current) return; await loadConversation(conversationId); if (epoch !== authEpoch.current) return; setSourceTitle(""); setSourceUrl(""); setSourceEvidence(""); setNotice("Excerpt saved as owner-provided, not retrieved or independently verified."); }
    catch (error) { if (epoch === authEpoch.current) reportError(error); } finally { finishMutation(epoch); }
  }
  async function removeSource(id: string) {
    if (!conversationId || !allowDiscard() || !beginMutation()) return;
    const epoch = authEpoch.current;
    try { await api(`/api/projects/${conversationId}/sources/${id}`, { method: "DELETE" }); if (epoch !== authEpoch.current) return; await loadConversation(conversationId); if (epoch === authEpoch.current) setNotice("Source removed from future briefs. Existing run snapshots remain until project deletion or retention cleanup."); }
    catch (error) { if (epoch === authEpoch.current) reportError(error); } finally { finishMutation(epoch); }
  }
  async function saveArtifact() {
    if (!selectedArtifact || savingArtifact || !selectedArtifact.revision) return; const epoch = authEpoch.current; setSavingArtifact(true);
    try { const a = await api<Artifact>("/api/artifacts/" + selectedArtifact.id, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: artifactTitle, content: artifactDraft, revision: selectedArtifact.revision }) }); if (epoch !== authEpoch.current) return; setSelectedArtifact(a); setArtifactDraft(a.content ?? ""); setArtifactTitle(a.title); setArtifacts(current => current.map(item => item.id === a.id ? a : item)); setNotice("Artifact saved, revision " + a.revision + ". Human edits are not automatically fact-checked."); }
    catch (error) { if (epoch === authEpoch.current) reportError(error); } finally { if (epoch === authEpoch.current) setSavingArtifact(false); }
  }
  const composer = <form className={tasks.length ? "followup-composer" : "composer-wrap"} onSubmit={e => void submitTask(e)}>
    <div className="composer-top"><span className="composer-dot" /><span>{labels[mode].description}</span><span className="composer-mode">{labels[mode].title}</span></div>
    {mode === "analyze" && <label className="field-label">Input format <select aria-label="Input format" value={inputType} disabled={locked} onChange={e => setInputType(e.target.value as typeof inputType)}><option value="text">Text</option><option value="csv">CSV (header + rows)</option><option value="json">JSON</option></select></label>}
    <textarea id="task-prompt" aria-label="Task prompt" rows={3} maxLength={4000} value={prompt} disabled={locked} placeholder={labels[mode].placeholder} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submitTask(); } }} />
    <div className="composer-bottom"><span className="composer-hint">{prompt.length}/4000 · Enter to send · Shift+Enter for newline</span><button className="send-button" type="submit" disabled={!usable || !prompt.trim() || locked} aria-label="Run task">{locked ? <span className="spinner" /> : "↑"}</button></div>
    {!usable && <p className="setup-explanation">{!authenticated ? "Owner login required in Settings." : mode === "research" && workflow === "manual-brief" ? "Create/open a research project and add at least one permitted excerpt. URLs alone are not fetched." : "Selected mode requires a configured provider and verified free-only policy. See Settings."}</p>}
  </form>;
  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" disabled={locked} onClick={() => newTask()} aria-label="Vestren home"><span className="brand-mark"><span /><span /><span /><span /></span><span className="brand-text"><span>Vestren</span><small>PERSONAL AI WORKSPACE</small></span></button>
      <button className="new-task" disabled={locked} onClick={() => newTask()}>+ New task <kbd>Ctrl K</kbd></button>
      <div className="nav-label">WORKSPACE</div>
      <nav className="nav-list" aria-label="Workspace modes">{MODES.map(item => <button key={item} className={"nav-item " + (mode === item ? "active" : "")} aria-current={mode === item ? "page" : undefined} disabled={locked} onClick={() => newTask(item)}><span className="nav-icon">{labels[item].icon}</span>{labels[item].title}</button>)}</nav>
      <div className="nav-label recent-label">SAVED PROJECTS</div>
      <section className="history-list" aria-label="Saved projects">{history.length ? history.map(item => <button className="history-item" key={item.id} disabled={locked} onClick={() => { if (!allowDiscard()) return; setPrompt(""); void loadConversation(item.id).catch(reportError); }}>{item.title}</button>) : <p className="empty-history">{authenticated ? "No saved conversations yet." : "Login to reopen your work."}</p>}</section>
      <div className="sidebar-bottom"><div className="usage-card"><div className="usage-heading">OWNER-ONLY WORKSPACE</div><p>{providers ? `${providers.usage.used}/${providers.usage.limit} app requests today` : "Provider setup required"}</p><small>No silent fallback. No code execution.</small></div><button className="settings-button" onClick={() => setSettingsOpen(true)}>Settings & providers</button><div className="sidebar-foot">VESTRENHQ · PRIVATE WORKBENCH</div></div>
    </aside>
    <main className="main-area" id="workspace">
      <header className="topbar"><div className="breadcrumb">Workspace / <strong>{labels[mode].title}</strong></div><div className="topbar-right"><span className={"status-pill " + (usable ? "connected" : "")}>{usable ? mode === "research" && workflow === "manual-brief" ? "Manual evidence · no live retrieval" : "Configured · not smoke-tested" : "Setup required"}</span><button className="avatar" aria-label="Open settings" onClick={() => setSettingsOpen(true)}>M</button></div></header>
      <div className={"work-canvas " + (tasks.length ? "conversation-mode" : "")}>
        {mode === "research" && <section className="project-panel" aria-label="Research project"><h2>{activeTitle || "Research → brief → editable deliverable"}</h2><p className="result-limitations">Private owner workspace. Manual mode organizes your excerpts without fetching URLs or calling AI. Live mode requires separately verified providers.</p><label className="field-label">Evidence workflow <select aria-label="Evidence workflow" value={workflow} disabled={locked} onChange={e => setWorkflow(e.target.value as typeof workflow)}><option value="manual-brief">Provided excerpts — no live retrieval / AI</option><option value="provider">Live Tavily + inference — setup required</option></select></label><form onSubmit={e => void (conversationId ? renameProject(e) : createProject(e))}><label className="field-label" htmlFor="project-title">Project title</label><input id="project-title" className="token-input" value={projectTitle} maxLength={120} disabled={locked} onChange={e => setProjectTitle(e.target.value)} /><button className="secondary-button" disabled={!authenticated || !projectTitle.trim() || locked}>{conversationId ? "Rename project" : "Create research project"}</button></form>{conversationId && <><button className="secondary-button" disabled={locked} onClick={() => void deleteConversation()}>Delete project</button><section className="source-panel" aria-label="Project source ledger"><h3>Owner-provided evidence ({projectSources.length}/5)</h3>{projectSources.map(s => <article key={s.recordId ?? s.id}><strong>[{s.id}] {s.title}</strong>{s.url && <p><a href={s.url} target="_blank" rel="noopener noreferrer">{s.url}</a></p>}<small>provided-not-retrieved · supplied {s.providedAt} · retrieval timestamp: none</small><p>{s.evidence}</p>{s.recordId && <button className="secondary-button" disabled={locked} onClick={() => void removeSource(s.recordId!)}>Remove source {s.id}</button>}</article>)}</section><form onSubmit={e => void addSource(e)}><label className="field-label" htmlFor="source-title">Source title</label><input id="source-title" className="token-input" value={sourceTitle} maxLength={240} disabled={locked} onChange={e => setSourceTitle(e.target.value)} /><label className="field-label" htmlFor="source-url">Source URL (optional; not fetched)</label><input id="source-url" className="token-input" value={sourceUrl} maxLength={2048} disabled={locked} onChange={e => setSourceUrl(e.target.value)} /><label className="field-label" htmlFor="source-evidence">Permitted source excerpt / document text</label><textarea id="source-evidence" value={sourceEvidence} maxLength={2000} rows={4} disabled={locked} onChange={e => setSourceEvidence(e.target.value)} /><button className="secondary-button" disabled={locked || projectSources.length >= 5 || !sourceTitle.trim() || !sourceEvidence.trim()}>Add supplied evidence</button></form></>}</section>}
        {!tasks.length ? <section className="welcome"><div className="eyebrow">YOUR WORK, ONE WORKSPACE</div><h1>A question. A <span>traceable brief.</span><br />A clear next step.</h1><button className="primary-button" disabled={locked} onClick={() => newTask("research")}>Start research project</button><p className="welcome-copy">Research with evidence. Create deliverables. Work through data.<br />Original tools, transparent limits, and your saved work.</p>{composer}<div className="starter-head">START WITH A WORKFLOW</div><div className="starter-grid">{MODES.filter(m => m !== "chat").map((item, i) => <button className="starter-card" disabled={locked} key={item} onClick={() => newTask(item)}><span className={"starter-icon color-" + i}>{labels[item].icon}</span><span className="starter-text"><strong>{labels[item].title}</strong><small>{labels[item].description}</small></span></button>)}</div><p className="principles">No invented sources · No paid fallback · No demo presented as live AI</p></section> : <section className="conversation"><header className="conversation-title"><div className="eyebrow">{labels[mode].title.toUpperCase()}</div><h2>{activeTitle || tasks[0]?.prompt.slice(0, 90)}</h2><p>Persisted in D1 · Lazy 30-day retention · Single-owner access</p><button className="secondary-button" disabled={locked} onClick={() => void deleteConversation()}>Delete conversation</button></header><section className="message-stack" aria-label="Task results">{tasks.map(task => <article className="task-result" key={task.id}><p className="message-meta">You</p><pre>{task.prompt}</pre><p className="task-status">{task.status.toUpperCase()} · {task.provider} · {task.model}</p>{task.error ? <p role="alert">{task.error}. No paid fallback.</p> : <pre>{task.response || "Execution in progress. No result yet."}</pre>}{task.analysis != null && <details><summary>Deterministic input statistics</summary><pre>{JSON.stringify(task.analysis, null, 2)}</pre></details>}<p className="result-limitations">{task.notice}</p>{task.sources?.length > 0 && <section className="source-panel" aria-label="Source evidence"><h3>Evidence and provenance</h3>{task.sources.map(source => <article key={source.id}>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">[{source.id}] {source.title}</a> : <strong>[{source.id}] {source.title} (pasted document, no URL)</strong>}<small>{source.provider} · {source.status ?? "retrieved"} · {source.retrievedAt ?? "not retrieved"}</small><p>{source.evidence}</p></article>)}</section>}</article>)}</section>{composer}</section>}
        {locked && <p role="status" className="working-state">{running ? "Server task running. Refreshing durable status…" : "Request pending. Search/inference have bounded timeouts; cancellation is not supported."}</p>}
        {artifacts.length > 0 && <section className="artifact-panel" aria-label="Artifacts"><h2>Artifacts</h2>{artifacts.map(a => <button className="secondary-button" key={a.id} onClick={() => void viewArtifact(a.id)}>{a.title}</button>)}{selectedArtifact && <article><h3>{selectedArtifact.title}</h3><p>{selectedArtifact.created_at} · Markdown source; HTML export escapes all content. CSV exports a title/content record, not a spreadsheet.</p><p>Revision {selectedArtifact.revision ?? "unknown"}. Original run/evidence snapshots remain unchanged. Edits are not fact-checked. Save before export.</p><label className="field-label" htmlFor="artifact-title">Artifact title</label><input id="artifact-title" className="token-input" value={artifactTitle} maxLength={120} disabled={locked} onChange={e => setArtifactTitle(e.target.value)} /><label className="field-label" htmlFor="artifact-editor">Markdown brief editor</label><textarea id="artifact-editor" aria-label="Markdown brief editor" value={artifactDraft} maxLength={40000} rows={14} disabled={locked} onChange={e => setArtifactDraft(e.target.value)} /><button className="primary-button" disabled={locked || !selectedArtifact.revision || !artifactDraft.trim() || !artifactTitle.trim() || new TextEncoder().encode(artifactDraft).length > 64000} onClick={() => void saveArtifact()}>Save artifact edits</button><button className="secondary-button" onClick={() => void copyArtifact()}>Copy artifact</button>{["md", "json", "csv", "html"].map(f => <button className="secondary-button" key={f} disabled={savingArtifact || artifactDraft !== (selectedArtifact.content ?? "") || artifactTitle !== selectedArtifact.title} onClick={() => void downloadArtifact(f)}>Download {f.toUpperCase()}</button>)}</article>}</section>}
        {notice && <p className="bottom-notice" role="status">{notice}</p>}<nav className="policy-links" aria-label="Product and trust pages"><a href="/privacy">Privacy</a><a href="/terms">Terms & limitations</a><a href="/pricing">Usage / pricing</a><a href="/support">Support</a><a href="/status">Release status</a></nav>
      </div>
    </main>
    <dialog ref={dialog} className="settings-modal" onClose={() => { setSettingsOpen(false); setOwnerToken(""); }} aria-labelledby="settings-title"><header className="modal-header"><h2 id="settings-title">Settings & providers</h2><button className="icon-button" aria-label="Close settings" onClick={() => setSettingsOpen(false)}>×</button></header><p className="modal-copy">Single-owner access. Provider keys are configured only in server secrets. Login uses a separate application token, exchanged for an HttpOnly cookie; never stored in browser storage.</p>{!authenticated ? <form onSubmit={e => void login(e)}><label className="field-label" htmlFor="owner-token">Application owner token (not a provider API key)</label><input id="owner-token" className="token-input" type="password" autoComplete="off" maxLength={256} value={ownerToken} onChange={e => setOwnerToken(e.target.value)} required /><button className="primary-button" disabled={loginBusy || !ownerToken} type="submit">{loginBusy ? "Signing in…" : "Sign in"}</button></form> : <><section className="settings-row"><strong>{providers?.inference.provider} / {providers?.inference.model}</strong><span>Inference: {providers?.inference.configured ? "configured" : "missing"} · Policy: {providers?.inference.enabled ? "owner enabled" : "disabled"}</span><span>Tavily: {providers?.search.configured ? "configured" : "missing"} · Policy: {providers?.search.enabled ? "owner enabled" : "disabled"}</span><span>Usage: {providers?.usage.used}/{providers?.usage.limit} requests/day; search {providers?.usage.searchMonthUsed}/{providers?.usage.searchMonthLimit} per month</span><small>Configuration is NOT a live availability or account-balance check. Research uses excerpts only.</small></section><p className="settings-warning">{providers?.costPolicy}</p><p className="modal-copy">Unavailable: {providers?.disabled.join(", ")}. Analyze accepts pasted input only; Build generates text only.</p><button className="secondary-button" onClick={() => void refresh().then(() => setNotice("Configuration refreshed; no provider calls sent.")).catch(reportError)}>Refresh configuration</button><button className="primary-button" onClick={() => void logout()}>Log out</button></>}<p className="settings-footer">See docs/11_PROVIDER_CREDENTIALS_AND_SETUP.md. No public production deployment has been performed.</p>{settingsOpen && notice && <p role="status">{notice}</p>}</dialog>
  </div>;
}
