import { config } from '../config/env';

// ─── Shared Types ───────────────────────────────────────────────────────────

export interface GitLabAdapterResult<T = Record<string, unknown>> {
  success: boolean;
  mode: 'live' | 'fallback';
  data?: T;
  error?: string;
  logs: string[];
}

interface BranchResult { branchName: string; ref?: string }
interface CommitResult { commitSha: string; branchName: string }
interface MergeRequestResult { mergeRequestIid: number; webUrl: string; title: string; sourceBranch: string; targetBranch: string }
interface CommentResult { noteId: number }
interface PipelineResult { pipelineId: number; webUrl: string; status: string }
interface MRStatusResult { status: string; mergeRequestIid: number; webUrl: string; mergedAt?: string; approvedBy?: string[] }
interface PipelineStatusResult { pipelineId: number; status: string; ref: string; webUrl: string; finishedAt?: string }

// ─── Helpers ────────────────────────────────────────────────────────────────

function isLiveCapable(): boolean {
  return !!(config.liveRepositoryMode && config.gitlabToken && config.gitlabProjectId);
}

function apiBase(): string {
  return `${config.gitlabUrl}/api/v4`;
}

function projectPath(): string {
  return `${apiBase()}/projects/${encodeURIComponent(config.gitlabProjectId)}`;
}

async function gitlabFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${projectPath()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'PRIVATE-TOKEN': config.gitlabToken,
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitLab API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ─── Adapter ────────────────────────────────────────────────────────────────

export const gitlabRepositoryAdapter = {

  /** Returns whether the adapter can make real GitLab API calls. */
  isLiveCapable,

  // ── 1. Create Branch ──────────────────────────────────────────────────

  async createBranch(
    branchName: string,
    ref: string = config.gitlabDefaultBranch
  ): Promise<GitLabAdapterResult<BranchResult>> {
    const logs: string[] = [];

    if (isLiveCapable()) {
      try {
        logs.push(`[GITLAB] Creating branch "${branchName}" from "${ref}"...`);
        const data = await gitlabFetch<{ name: string; commit?: { id: string } }>(
          '/repository/branches',
          { method: 'POST', body: JSON.stringify({ branch: branchName, ref }) }
        );
        logs.push(`[GITLAB] Branch "${data.name}" created successfully.`);
        return { success: true, mode: 'live', data: { branchName: data.name, ref: data.commit?.id }, logs };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logs.push(`[GITLAB] Branch creation failed: ${msg}. Switching to fallback.`);
      }
    }

    // Fallback
    logs.push(`[FALLBACK] Simulated branch creation: ${branchName}`);
    return { success: true, mode: 'fallback', data: { branchName, ref: 'mock-sha-' + Date.now() }, logs };
  },

  // ── 2. Apply Patch (commit file changes) ──────────────────────────────

  async applyPatch(
    branchName: string,
    files: Array<{ filePath: string; content: string; action?: 'create' | 'update' | 'delete' }>,
    commitMessage: string
  ): Promise<GitLabAdapterResult<CommitResult>> {
    const logs: string[] = [];

    if (isLiveCapable()) {
      try {
        logs.push(`[GITLAB] Committing ${files.length} file(s) to "${branchName}"...`);
        const actions = files.map(f => ({
          action: f.action || 'update',
          file_path: f.filePath,
          content: f.content,
        }));
        const data = await gitlabFetch<{ id: string }>(
          '/repository/commits',
          { method: 'POST', body: JSON.stringify({ branch: branchName, commit_message: commitMessage, actions }) }
        );
        logs.push(`[GITLAB] Commit ${data.id.slice(0, 8)} pushed.`);
        return { success: true, mode: 'live', data: { commitSha: data.id, branchName }, logs };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logs.push(`[GITLAB] Commit failed: ${msg}. Switching to fallback.`);
      }
    }

    logs.push(`[FALLBACK] Simulated commit of ${files.length} file(s) to "${branchName}".`);
    return { success: true, mode: 'fallback', data: { commitSha: 'mock-sha-' + Date.now(), branchName }, logs };
  },

  // ── 3. Create Merge Request ───────────────────────────────────────────

  async createMergeRequest(
    sourceBranch: string,
    title: string,
    description: string = '',
    targetBranch: string = config.gitlabDefaultBranch
  ): Promise<GitLabAdapterResult<MergeRequestResult>> {
    const logs: string[] = [];

    if (isLiveCapable()) {
      try {
        logs.push(`[GITLAB] Creating MR: "${title}" (${sourceBranch} → ${targetBranch})...`);
        const data = await gitlabFetch<{ iid: number; web_url: string; title: string; source_branch: string; target_branch: string }>(
          '/merge_requests',
          { method: 'POST', body: JSON.stringify({ source_branch: sourceBranch, target_branch: targetBranch, title, description }) }
        );
        logs.push(`[GITLAB] MR !${data.iid} created: ${data.web_url}`);
        return { success: true, mode: 'live', data: { mergeRequestIid: data.iid, webUrl: data.web_url, title: data.title, sourceBranch: data.source_branch, targetBranch: data.target_branch }, logs };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logs.push(`[GITLAB] MR creation failed: ${msg}. Switching to fallback.`);
      }
    }

    const mockIid = Math.floor(Math.random() * 900) + 100;
    logs.push(`[FALLBACK] Simulated MR !${mockIid}: "${title}"`);
    return { success: true, mode: 'fallback', data: { mergeRequestIid: mockIid, webUrl: `${config.gitlabUrl}/demo/project/-/merge_requests/${mockIid}`, title, sourceBranch, targetBranch }, logs };
  },

  // ── 4. Post MR Comment ────────────────────────────────────────────────

  async postMRComment(
    mergeRequestIid: number,
    body: string
  ): Promise<GitLabAdapterResult<CommentResult>> {
    const logs: string[] = [];

    if (isLiveCapable()) {
      try {
        logs.push(`[GITLAB] Posting comment on MR !${mergeRequestIid}...`);
        const data = await gitlabFetch<{ id: number }>(
          `/merge_requests/${mergeRequestIid}/notes`,
          { method: 'POST', body: JSON.stringify({ body }) }
        );
        logs.push(`[GITLAB] Comment posted (note ${data.id}).`);
        return { success: true, mode: 'live', data: { noteId: data.id }, logs };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logs.push(`[GITLAB] Comment failed: ${msg}. Switching to fallback.`);
      }
    }

    logs.push(`[FALLBACK] Simulated comment on MR !${mergeRequestIid}.`);
    return { success: true, mode: 'fallback', data: { noteId: 0 }, logs };
  },

  // ── 5. Rerun Pipeline ─────────────────────────────────────────────────

  async rerunPipeline(
    ref: string
  ): Promise<GitLabAdapterResult<PipelineResult>> {
    const logs: string[] = [];

    if (isLiveCapable()) {
      try {
        logs.push(`[GITLAB] Triggering pipeline on ref "${ref}"...`);
        const data = await gitlabFetch<{ id: number; web_url: string; status: string }>(
          '/pipeline',
          { method: 'POST', body: JSON.stringify({ ref }) }
        );
        logs.push(`[GITLAB] Pipeline #${data.id} triggered (${data.status}).`);
        return { success: true, mode: 'live', data: { pipelineId: data.id, webUrl: data.web_url, status: data.status }, logs };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logs.push(`[GITLAB] Pipeline trigger failed: ${msg}. Switching to fallback.`);
      }
    }

    const mockPipelineId = Math.floor(Math.random() * 90000) + 10000;
    logs.push(`[FALLBACK] Simulated pipeline #${mockPipelineId} on ref "${ref}".`);
    return { success: true, mode: 'fallback', data: { pipelineId: mockPipelineId, webUrl: `${config.gitlabUrl}/demo/project/-/pipelines/${mockPipelineId}`, status: 'created' }, logs };
  },

  // ── 6. Fetch MR Status ────────────────────────────────────────────────

  async fetchMRStatus(
    mergeRequestIid: number
  ): Promise<GitLabAdapterResult<MRStatusResult>> {
    const logs: string[] = [];

    if (isLiveCapable()) {
      try {
        logs.push(`[GITLAB] Fetching status for MR !${mergeRequestIid}...`);
        const data = await gitlabFetch<{ iid: number; state: string; web_url: string; merged_at?: string; approved_by?: { user: { username: string } }[] }>(
          `/merge_requests/${mergeRequestIid}`
        );
        logs.push(`[GITLAB] MR !${data.iid} state: ${data.state}`);
        return { success: true, mode: 'live', data: { status: data.state, mergeRequestIid: data.iid, webUrl: data.web_url, mergedAt: data.merged_at ?? undefined, approvedBy: data.approved_by?.map(a => a.user.username) }, logs };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logs.push(`[GITLAB] MR status fetch failed: ${msg}. Switching to fallback.`);
      }
    }

    logs.push(`[FALLBACK] Returning mock MR status for !${mergeRequestIid}.`);
    return { success: true, mode: 'fallback', data: { status: 'opened', mergeRequestIid, webUrl: `${config.gitlabUrl}/demo/project/-/merge_requests/${mergeRequestIid}` }, logs };
  },

  // ── 7. Fetch Pipeline Status ──────────────────────────────────────────

  async fetchPipelineStatus(
    pipelineId: number
  ): Promise<GitLabAdapterResult<PipelineStatusResult>> {
    const logs: string[] = [];

    if (isLiveCapable()) {
      try {
        logs.push(`[GITLAB] Fetching pipeline #${pipelineId}...`);
        const data = await gitlabFetch<{ id: number; status: string; ref: string; web_url: string; finished_at?: string }>(
          `/pipelines/${pipelineId}`
        );
        logs.push(`[GITLAB] Pipeline #${data.id} status: ${data.status}`);
        return { success: true, mode: 'live', data: { pipelineId: data.id, status: data.status, ref: data.ref, webUrl: data.web_url, finishedAt: data.finished_at ?? undefined }, logs };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logs.push(`[GITLAB] Pipeline fetch failed: ${msg}. Switching to fallback.`);
      }
    }

    logs.push(`[FALLBACK] Returning mock pipeline status for #${pipelineId}.`);
    return { success: true, mode: 'fallback', data: { pipelineId, status: 'success', ref: config.gitlabDefaultBranch, webUrl: `${config.gitlabUrl}/demo/project/-/pipelines/${pipelineId}` }, logs };
  },
};
