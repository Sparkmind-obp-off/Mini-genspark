import { useEffect, useState } from "react";

type Mode = "chat" | "research" | "create" | "analyze" | "build";
type ProviderHealth = {
  status?: string;
  modelProvider?: string;
  aiBindingConfigured?: boolean;
  databaseConfigured?: boolean;
  ownerTokenConfigured?: boolean;
  freePlanConfirmed?: boolean;
  model?: string;
  liveResearch?: boolean;
  codeExecution?: boolean;
};
type Message = { role: "user" | "assistant"; content: string; id: string };
type ApiResponse = {
  taskId?: string;
  response?: string;
  error?: string;
  message?: string;
  model?: string;
  quota?: { appRequestsUsed: number; appRequestsLimit: number };
  notice?: string;
};

const modeLabels: Record<Mode, { title: string; description: string; icon: string; placeholder: string }> = {
  chat: { title: "Chat", description: "Think through an idea", icon: "✳", placeholder: "Ask Vestren anything…" },
  research: { title: "Research", description: "Work with evidence", icon: "⌕", placeholder: "What do you need to research? Live web search is not connected yet." },
  create: { title: "Create", description: "Turn thoughts into a deliverable", icon: "▤", placeholder: "Draft a document, proposal, or plan…" },
  analyze: { title: "Analyze", description: "Reason through data and questions", icon: "▥", placeholder: "Paste the figures or data you want to analyze…" },
  build: { title: "Build", description: "Plan or write code", icon: "⌘", placeholder: "Describe the code, feature, or repo task…" }
};

const starters: Array<{ mode: Mode; title: string; description: string }> = [
  { mode: "research", title: "Research a topic", description: "Collect questions, claims and sources to verify." },
  { mode: "create", title: "Create a deliverable", description: "Turn rough ideas into a structured draft." },
  { mode: "analyze", title: "Analyze a decision", description: "Compare options, assumptions and trade-offs." },
  { mode: "build", title: "Build something", description: "Write an implementation plan or code draft." }
];

function makeId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "-" + String(Math.random());
}

function demoResponse(mode: Mode, prompt: string): string {
  const intro = "This is a local demo response, not an actual AI inference. Configure the owner token and Cloudflare Worker provider to run a real model.";
  if (mode === "research") {
    return intro + "\n\nResearch task: " + prompt + "\n\nSuggested research checklist:\n1. Find the primary source.\n2. Cross-check with two independent sources.\n3. Separate facts, allegations, interpretation, and unknowns.\n4. Record publication and event dates separately.\n\nLive web search and citations are not connected yet; no sources have been retrieved.";
  }
  if (mode === "create") {
    return intro + "\n\n# Draft outline\n\n## Objective\nClarify the outcome needed for: " + prompt + "\n\n## Proposed structure\n1. Context and audience\n2. Main argument or proposal\n3. Implementation steps\n4. Risks and assumptions\n5. Next action\n\nThis is an outline, not a model-generated deliverable.";
  }
  if (mode === "analyze") {
    return intro + "\n\n## Analysis checklist\n- Identify the decision and success metric.\n- Verify units and inputs.\n- Separate facts from assumptions.\n- Compare base, downside and upside scenarios.\n\nTask: " + prompt + "\n\nNo file has been uploaded or computed in this demo.";
  }
  if (mode === "build") {
    return intro + "\n\n## Build plan\n1. Define acceptance criteria for: " + prompt + "\n2. Identify the smallest file/module change.\n3. Implement behind a typed interface.\n4. Add success and failure tests.\n5. Run typecheck, tests and build.\n\nNo repository was accessed and no code was executed.";
  }
  return intro + "\n\nYou asked: " + prompt + "\n\nThis workspace is being built in phases. Configure the server-side provider to get a real model response here.";
}

export default function App() {
  const [mode, setMode] = useState<Mode>("chat");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [health, setHealth] = useState<ProviderHealth | null>(null);
  const [ownerToken, setOwnerToken] = useState(() => {
    try { return sessionStorage.getItem("vestren-owner-token") ?? sessionStorage.getItem("mini-genspark-owner-token") ?? ""; } catch { return ""; }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; title: string; mode: Mode }>>([]);

  useEffect(() => {
    fetch("/api/health")
      .then(async (response) => {
        if (!response.ok) throw new Error("API not available");
        return await response.json() as ProviderHealth;
      })
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const configured = Boolean(health?.aiBindingConfigured && health?.databaseConfigured && health?.ownerTokenConfigured && health?.freePlanConfirmed);
  const modeInfo = modeLabels[mode];
  const statusLabel = configured ? "Provider configured" : health ? "Setup required" : "Local demo";

  function saveToken() {
    try {
      sessionStorage.setItem("vestren-owner-token", ownerToken.trim());
      sessionStorage.removeItem("mini-genspark-owner-token");
      setNotice(ownerToken.trim() ? "Owner token saved to this browser tab's session storage." : "Owner token cleared.");
    } catch {
      setNotice("Could not save token in this browser session.");
    }
    setSettingsOpen(false);
  }

  async function submitTask() {
    const text = prompt.trim();
    if (!text || busy) return;
    const userMessage: Message = { role: "user", content: text, id: makeId() };
    const nextMessages = [...messages, userMessage].slice(-8);
    setMessages(nextMessages);
    setPrompt("");
    setBusy(true);
    setNotice(null);

    if (!configured || !ownerToken.trim()) {
      setMessages((current) => [...current, { role: "assistant", content: demoResponse(mode, text), id: makeId() }]);
      setHistory((current) => [{ id: makeId(), title: text.slice(0, 42), mode }, ...current].slice(0, 12));
      setBusy(false);
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json", "x-vestren-owner-token": ownerToken.trim() },
        body: JSON.stringify({ mode, messages: nextMessages.map(({ role, content: messageContent }) => ({ role, content: messageContent })) })
      });
      const result = await response.json() as ApiResponse;
      if (!response.ok || !result.response) {
        const errorMessage = result.message ?? result.error ?? ("Request failed with status " + response.status);
        setMessages((current) => [...current, { role: "assistant", content: "Request did not complete.\n\n" + errorMessage + "\n\nNo paid fallback was attempted.", id: makeId() }]);
        setNotice("Request failed: " + (result.error ?? response.status));
      } else {
        const responseText = result.notice ? result.response + "\n\n---\n" + result.notice : result.response;
        setMessages((current) => [...current, { role: "assistant", content: responseText, id: result.taskId ?? makeId() }]);
        setNotice("Completed with " + (result.model ?? "configured model") + (result.quota ? " · " + result.quota.appRequestsUsed + "/" + result.quota.appRequestsLimit + " daily app requests" : ""));
      }
      setHistory((current) => [{ id: makeId(), title: text.slice(0, 42), mode }, ...current].slice(0, 12));
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "The API could not be reached. Check the local Worker, bindings, and network. The request was not redirected to a paid provider.", id: makeId() }]);
      setNotice("API unavailable");
    } finally {
      setBusy(false);
    }
  }

  function newTask() {
    setMessages([]);
    setPrompt("");
    setNotice(null);
    setMode("chat");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={newTask} aria-label="Vestren home">
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span className="brand-text"><span>Vestren</span><small>PERSONAL AI WORKSPACE</small></span>
        </button>
        <button className="new-task" onClick={newTask}><span>＋</span> New task <kbd>⌘ K</kbd></button>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Workspace modes">
          {(Object.keys(modeLabels) as Mode[]).map((item) => (
            <button key={item} className={"nav-item " + (mode === item ? "active" : "")} onClick={() => setMode(item)}>
              <span className="nav-icon">{modeLabels[item].icon}</span><span>{modeLabels[item].title}</span>
              {item === "research" && <span className="nav-status planned" title="Live search not connected">•</span>}
            </button>
          ))}
        </nav>
        <div className="nav-label recent-label">RECENT TASKS</div>
        <div className="history-list">
          {history.length === 0 ? <p className="empty-history">Your work will appear here.</p> : history.map((item) => (
            <button key={item.id} className="history-item" onClick={() => { setMode(item.mode); setNotice("History item selected; full durable history is not implemented yet."); }}>
              <span>↳</span>{item.title}
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="usage-card">
            <div className="usage-heading"><span className="pulse-dot" /> OWNER PREVIEW</div>
            <p>{configured ? "Cloudflare AI configured" : "Local demo mode"}</p>
            <small>{configured ? "Owner-only API · capped requests" : "No external AI request is sent"}</small>
          </div>
          <button className="settings-button" onClick={() => setSettingsOpen(true)}><span>⚙</span> Settings & provider</button>
          <div className="sidebar-foot"><span>VESTREN · V0.1</span><span className="foot-dot" /> FREE-FIRST</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>{modeInfo.title}</strong></div>
          <div className="topbar-right">
            <span className={"status-pill " + (configured ? "connected" : "")}><span />{statusLabel}</span>
            <button className="avatar" onClick={() => setSettingsOpen(true)} title="Settings">M</button>
          </div>
        </header>

        <div className={"work-canvas " + (messages.length ? "conversation-mode" : "")}>
          {messages.length === 0 ? (
            <section className="welcome">
              <div className="eyebrow"><span className="sparkle">✳</span> YOUR WORK, ONE WORKSPACE</div>
              <h1>What are we <span>working on</span><br />today?</h1>
              <p className="welcome-copy">Research ideas. Create deliverables. Work through data.<br className="desktop-break" /> One workspace, with sources and limits you can trust.</p>
              <div className="composer-wrap">
                <div className="composer-top"><span className="composer-dot" /> <span>{modeInfo.description}</span><span className="composer-mode">{modeInfo.title}</span></div>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submitTask(); } }} placeholder={modeInfo.placeholder} rows={3} maxLength={4000} aria-label="Task prompt" />
                <div className="composer-bottom">
                  <span className="composer-hint">Be specific. Review important outputs.</span>
                  <button className="send-button" onClick={() => void submitTask()} disabled={!prompt.trim() || busy} aria-label="Run task">{busy ? <span className="spinner" /> : "↑"}</button>
                </div>
              </div>
              {!configured && <div className="demo-note"><span>ⓘ</span><span><strong>Local demo mode.</strong> Responses are illustrative templates, not AI results. Configure Cloudflare Workers AI in Settings to run a real model.</span></div>}
              <div className="starter-head"><span>START WITH A WORKFLOW</span><span className="starter-line" /></div>
              <div className="starter-grid">
                {starters.map((item, index) => (
                  <button className="starter-card" key={item.mode} onClick={() => {
                    setMode(item.mode);
                    const startersByIndex = [
                      "Research this topic with primary sources, dates, and a claim/evidence table: ",
                      "Create a polished, reusable deliverable for: ",
                      "Analyze this question, assumptions, options, and decision criteria: ",
                      "Create an implementation plan, acceptance criteria, and tests for: "
                    ];
                    setPrompt(startersByIndex[index]);
                  }}>
                    <span className={"starter-icon color-" + index}>{modeLabels[item.mode].icon}</span>
                    <span className="starter-text"><strong>{item.title}</strong><small>{item.description}</small></span>
                    <span className="starter-arrow">↗</span>
                  </button>
                ))}
              </div>
              <div className="principles"><span>✳</span> No fake sources <i /> No silent paid fallback <i /> You stay in control</div>
            </section>
          ) : (
            <section className="conversation">
              <div className="conversation-title"><div className="eyebrow"><span className="sparkle">✳</span> {modeInfo.title.toUpperCase()}</div><h2>{messages.find((message) => message.role === "user")?.content.slice(0, 90)}</h2><p>Outputs are saved in this page session only in V0.1.</p></div>
              <div className="message-stack">
                {messages.map((message) => (
                  <article className={"message message-" + message.role} key={message.id}>
                    <div className="message-avatar">{message.role === "user" ? "Y" : <span className="mini-mark">✳</span>}</div>
                    <div className="message-body"><div className="message-meta">{message.role === "user" ? "You" : "Vestren"}</div><pre>{message.content}</pre></div>
                  </article>
                ))}
                {busy && <div className="working-state"><span className="spinner" /> Working within configured limits…</div>}
              </div>
              <div className="followup-composer">
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submitTask(); } }} placeholder="Continue this task…" rows={2} maxLength={4000} aria-label="Follow-up prompt" />
                <div className="followup-actions"><span>Enter to send · Shift+Enter for a new line</span><button className="send-button" onClick={() => void submitTask()} disabled={!prompt.trim() || busy}>{busy ? <span className="spinner" /> : "↑"}</button></div>
              </div>
            </section>
          )}
          {notice && <div className="bottom-notice" role="status">{notice}</div>}
        </div>
      </main>

      {settingsOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
          <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="modal-header"><div><div className="eyebrow">OWNER CONFIGURATION</div><h2 id="settings-title">Settings & provider</h2></div><button className="icon-button" onClick={() => setSettingsOpen(false)} aria-label="Close settings">×</button></div>
            <p className="modal-copy">Vestren uses a server-side Cloudflare Workers AI binding. The owner token is sent in a request header and kept only in this browser tab's session storage.</p>
            <div className="settings-row"><span>Runtime provider</span><strong>Cloudflare Workers AI</strong><small>{health?.aiBindingConfigured ? "Binding detected" : "Not detected by the API"}</small></div>
            <div className="settings-row"><span>Free-tier guard</span><strong>{health?.freePlanConfirmed ? "Owner confirmed Workers Free" : "Disabled until confirmed"}</strong><small>Do not enable if this Cloudflare account can bill usage beyond its free allocation.</small></div>
            <div className="settings-row"><span>Model</span><strong>{health?.model ?? "@cf/meta/llama-3.1-8b-instruct-fp8-fast"}</strong><small>Model availability and billing eligibility must be checked on your Cloudflare account.</small></div>
            <label className="field-label" htmlFor="owner-token">Owner access token</label>
            <input id="owner-token" className="token-input" type="password" autoComplete="off" value={ownerToken} onChange={(event) => setOwnerToken(event.target.value)} placeholder="Paste the OWNER_ACCESS_TOKEN set as a server secret" />
            <div className="settings-warning"><strong>Private preview only.</strong> Do not deploy publicly without real user authentication, quota enforcement, and access controls. Never paste a Cloudflare API token here—this field is only for the application-specific owner token.</div>
            <div className="settings-actions"><button className="secondary-button" onClick={() => { setOwnerToken(""); sessionStorage.removeItem("vestren-owner-token"); sessionStorage.removeItem("mini-genspark-owner-token"); setNotice("Owner token cleared."); }}>Clear token</button><button className="primary-button" onClick={saveToken}>Save for this tab</button></div>
            <div className="settings-footer">{health ? "API status: " + (health.status ?? "reachable") + " · Live research: " + (health.liveResearch ? "enabled" : "not connected") + " · Code execution: " + (health.codeExecution ? "enabled" : "disabled") : "API status: unavailable or not started."}</div>
          </section>
        </div>
      )}
    </div>
  );
}
