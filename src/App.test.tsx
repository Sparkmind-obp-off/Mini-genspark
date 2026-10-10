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
  it("supports input format and accessible Settings without browser token storage", async () => {
    render(<App />); await screen.findByText("Configured · not smoke-tested");
    fireEvent.click(within(screen.getByRole("navigation", { name: "Workspace modes" })).getByRole("button", { name: /Analyze/ })); expect(screen.getByLabelText("Input format")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open settings" })); expect(screen.getByRole("dialog", { name: "Settings & providers" })).toBeTruthy(); expect(sessionStorage.getItem("mini-genspark-owner-token")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Close settings" }));
  });
});
