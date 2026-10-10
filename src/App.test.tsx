// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
const fixture = { id: "task-id", conversationId: "conversation-id", prompt: "Write a proposal", response: "<script>never execute</script> Safe generated draft", status: "succeeded", mode: "create", sources: [], provider: "mocked-provider", model: "fixture", notice: "Mocked test output; not live", analysis: null };
const providers = { inference: { configured: true, enabled: true, provider: "fixture", model: "fixture" }, search: { configured: false, enabled: false }, usage: { used: 1, limit: 20, searchMonthUsed: 0, searchMonthLimit: 100 }, costPolicy: "No fallback", disabled: ["daytona"] };
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); }; HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  vi.stubGlobal("fetch", vi.fn(async (path: string, options?: RequestInit) => {
    if (path === "/api/session") return new Response(JSON.stringify({ authenticated: true }));
    if (path === "/api/providers") return new Response(JSON.stringify(providers));
    if (path === "/api/conversations") return new Response("[]");
    if (path === "/api/tasks" && options?.method === "POST") return new Response(JSON.stringify(fixture), { status: 201 });
    if (path === "/api/conversations/conversation-id") return new Response(JSON.stringify({ tasks: [fixture], artifacts: [{ id: "artifact-id", title: "Proposal", created_at: "2026-10-10" }] }));
    if (path === "/api/artifacts/artifact-id") return new Response(JSON.stringify({ id: "artifact-id", title: "Proposal", content: fixture.response, created_at: "2026-10-10" }));
    throw new Error("Unexpected API route");
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe("React workflows with deterministic mocked API", () => {
  it("submits once, renders escaped result and opens actual artifact actions", async () => {
    render(<App />); const user = userEvent.setup(); await waitFor(() => expect(screen.getByRole("button", { name: "Run task" }).hasAttribute("disabled")).toBe(true));
    await user.type(screen.getByRole("textbox", { name: "Task prompt" }), "Write a proposal");
    await waitFor(() => expect(screen.getByRole("button", { name: "Run task" }).hasAttribute("disabled")).toBe(false));
    await user.click(screen.getByRole("button", { name: "Run task" }));
    await screen.findByText(fixture.response); expect(document.querySelector("script")).toBeNull();
    expect(vi.mocked(fetch).mock.calls.filter(([path]) => path === "/api/tasks")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Proposal" })); expect((await screen.findByRole("button", { name: "Copy artifact" })).hasAttribute("disabled")).toBe(false);
    for (const format of ["MD", "JSON", "CSV", "HTML"]) expect(screen.getByRole("button", { name: "Download " + format })).toBeTruthy();
  });
  it("disables Research with clear setup state, not mock inference", async () => {
    render(<App />); await screen.findByText("Configured · not smoke-tested");
    fireEvent.click(within(screen.getByRole("navigation", { name: "Workspace modes" })).getByRole("button", { name: /Research/ }));
    fireEvent.change(screen.getByLabelText("Evidence workflow"), { target: { value: "provider" } });
    expect(screen.getByText(/Selected mode requires/)).toBeTruthy(); expect(screen.getByRole("button", { name: "Run task" }).hasAttribute("disabled")).toBe(true);
  });
  it("surfaces API failure and preserves input instead of fabricating a result", async () => {
    const fetcher = vi.mocked(fetch); const original = fetcher.getMockImplementation()!;
    fetcher.mockImplementation(async (path, options) => path === "/api/tasks" ? new Response(JSON.stringify({ error: "PROVIDER_TIMEOUT", message: "Provider timeout fixture" }), { status: 504 }) : original(path, options));
    render(<App />); await screen.findByText("Configured · not smoke-tested");
    fireEvent.change(screen.getByRole("textbox", { name: "Task prompt" }), { target: { value: "Hello" } }); fireEvent.click(screen.getByRole("button", { name: "Run task" }));
    await screen.findByText("Provider timeout fixture"); expect((screen.getByRole("textbox", { name: "Task prompt" }) as HTMLTextAreaElement).value).toBe("Hello"); expect(screen.queryByText("SUCCEEDED")).toBeNull();
  });
  it("clears private UI on session expiry and requires login again", async () => {
    render(<App />); await screen.findByText("Configured · not smoke-tested");
    fireEvent.change(screen.getByRole("textbox", { name: "Task prompt" }), { target: { value: "Hello" } }); fireEvent.click(screen.getByRole("button", { name: "Run task" }));
    await screen.findByText(fixture.response);
    const fetcher = vi.mocked(fetch); const original = fetcher.getMockImplementation()!;
    fetcher.mockImplementation(async (path, options) => path === "/api/providers" ? new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 401 }) : original(path, options));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" })); fireEvent.click(screen.getByRole("button", { name: "Refresh configuration" }));
    await screen.findByLabelText("Application owner token (not a provider API key)");
    expect(screen.queryByText(fixture.response)).toBeNull(); expect(screen.getByRole("button", { name: "Run task" }).hasAttribute("disabled")).toBe(true);
  });
  it("clears research project titles and draft source fields when the session is revoked", async () => {
    const fetcher = vi.mocked(fetch); const original = fetcher.getMockImplementation()!;
    fetcher.mockImplementation(async (path, options) => path === "/api/conversations" ? new Response(JSON.stringify([{ id: "private-project", title: "Private research title", mode: "research" }])) : path === "/api/conversations/private-project" ? new Response(JSON.stringify({ title: "Private research title", mode: "research", tasks: [], artifacts: [], sources: [] })) : original(path, options));
    render(<App />); await screen.findByRole("button", { name: "Private research title" }); fireEvent.click(screen.getByRole("button", { name: "Private research title" }));
    await screen.findByRole("button", { name: "Rename project" }); fireEvent.change(screen.getByLabelText("Source title", { exact: true }), { target: { value: "Private unsaved source" } });
    const current = fetcher.getMockImplementation()!; fetcher.mockImplementation(async (path, options) => path === "/api/providers" ? new Response('{"error":"UNAUTHORIZED"}', { status: 401 }) : current(path, options));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" })); fireEvent.click(screen.getByRole("button", { name: "Refresh configuration" })); await screen.findByLabelText("Application owner token (not a provider API key)");
    expect(screen.queryByText("Private research title")).toBeNull(); expect((screen.getByLabelText("Project title", { exact: true }) as HTMLInputElement).value).toBe(""); expect(screen.queryByLabelText("Source title", { exact: true })).toBeNull();
  });
  it("does not restore a delayed private project response after logout", async () => {
    const fetcher = vi.mocked(fetch); const original = fetcher.getMockImplementation()!;
    let releaseProject!: (response: Response) => void;
    fetcher.mockImplementation((path, options) => {
      if (path === "/api/conversations") return Promise.resolve(new Response(JSON.stringify([{ id: "private-project", title: "Private project", mode: "research" }])));
      if (path === "/api/conversations/private-project") return new Promise<Response>(resolve => { releaseProject = resolve; });
      return original(path, options);
    });
    render(<App />); await screen.findByRole("button", { name: "Private project" });
    fireEvent.click(screen.getByRole("button", { name: "Private project" }));
    await waitFor(() => expect(releaseProject).toBeTypeOf("function"));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    fireEvent.click(screen.getByRole("button", { name: "Open settings" }));
    await screen.findByLabelText("Application owner token (not a provider API key)");
    releaseProject(new Response(JSON.stringify({ title: "Private project", mode: "research", tasks: [fixture], artifacts: [], sources: [] })));
    await waitFor(() => expect(screen.queryByText("Private project")).toBeNull());
    expect(screen.queryByText(fixture.response)).toBeNull();
    expect(screen.getByRole("button", { name: "Run task" }).hasAttribute("disabled")).toBe(true);
  });
  it("shows real-metric errors as unavailable rather than fabricated zero counters", async () => {
    render(<App />); await screen.findByText('Configured · not smoke-tested');
    fireEvent.click(screen.getByRole('button', { name: 'Access & Security' }));
    await screen.findByText('ERROR: security metrics unavailable; no counters are assumed.');
    expect(screen.queryByText('Access counters — VERIFIED')).toBeNull();
  });
  it("generates and downloads a new credential explicitly, then clears it on logout", async () => {
    const data = { token: 'e'.repeat(64), fingerprint: 'f'.repeat(64), createdAt: '2026-10-10T00:00:00Z', environment: 'development', filename: 'vestrenhq-owner-credential.txt', fileContent: 'SECRET token fixture', status: 'pending', installation: 'Manual install only' };
    const snapshot = { authentication: { status: 'VERIFIED', sessionLabel: 'fixture', expiresAt: '2026-10-10', lastSuccess: '2026-10-10', lastFailure: null }, credential: { fingerprint: 'fixture', status: 'active', createdAt: null }, counters: { successful: 1, failed: 0 }, configuration: { deployment: { status: 'UNAVAILABLE', detail: 'Operator gate' } }, events: [], limitations: 'Fixture', windowStart: '2026-10-10', lastHealthCheck: '2026-10-10' };
    const fetcher = vi.mocked(fetch); const original = fetcher.getMockImplementation()!;
    fetcher.mockImplementation(async (path, options) => String(path).startsWith('/api/security') ? new Response(JSON.stringify(snapshot)) : path === '/api/credentials/generate' ? new Response(JSON.stringify(data)) : path === '/api/credentials/authorize-export' ? new Response('{"authorized":true}') : original(path, options));
    const confirmed = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    const NativeURL = URL; const create = vi.fn(() => 'blob:fixture'); const revoke = vi.fn(); vi.stubGlobal('URL', class extends NativeURL { static createObjectURL = create; static revokeObjectURL = revoke; });
    const clicked = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<App />); await screen.findByText('Configured · not smoke-tested'); fireEvent.click(screen.getByRole('button', { name: 'Access & Security' }));
    await screen.findByText('Access counters — VERIFIED'); fireEvent.click(screen.getByRole('button', { name: 'Generate replacement credential' }));
    const secret = await screen.findByLabelText('One-time secret — save securely'); expect((secret as HTMLInputElement).value === data.token).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Download new credential TXT' })); await waitFor(() => expect(clicked).toHaveBeenCalledTimes(1)); expect(create).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls.some(([path, options]) => path === '/api/credentials/authorize-export' && options?.method === 'POST')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Open settings' })); fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    await waitFor(() => expect(screen.queryByLabelText('One-time secret — save securely')).toBeNull()); expect(screen.queryByRole('button', { name: 'Access & Security' })).toBeNull(); confirmed.mockRestore(); clicked.mockRestore();
  });
  it("does not restore a delayed generated credential after logout", async () => {
    let finish!: (value: Response) => void; const fetcher = vi.mocked(fetch); const original = fetcher.getMockImplementation()!;
    fetcher.mockImplementation((path, options) => path === '/api/credentials/generate' ? new Promise(resolve => { finish = resolve; }) : original(path, options));
    const confirmed = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    render(<App />); await screen.findByText('Configured · not smoke-tested'); fireEvent.click(screen.getByRole('button', { name: 'Access & Security' }));
    fireEvent.click(screen.getByRole('button', { name: 'Generate replacement credential' })); await waitFor(() => expect(finish).toBeTypeOf('function'));
    fireEvent.click(screen.getByRole('button', { name: 'Open settings' })); fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    finish(new Response(JSON.stringify({ token: 'fixture-delayed-secret', fingerprint: 'fixture', createdAt: '2026-10-10', status: 'pending' })));
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Access & Security' })).toBeNull()); expect(screen.queryByLabelText('One-time secret — save securely')).toBeNull(); confirmed.mockRestore();
  });
  it("supports input format and accessible Settings without browser token storage", async () => {
    render(<App />); await screen.findByText("Configured · not smoke-tested");
    fireEvent.click(within(screen.getByRole("navigation", { name: "Workspace modes" })).getByRole("button", { name: /Analyze/ })); expect(screen.getByLabelText("Input format")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open settings" })); expect(screen.getByRole("dialog", { name: "Settings & providers" })).toBeTruthy(); expect(sessionStorage.getItem("mini-genspark-owner-token")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Close settings" }));
  });
});
