// ─── GitLab Repository Action Results ───────────────────────────────────────

export type GitLabActionType =
    | "create_branch"
    | "apply_patch"
    | "create_mr"
    | "comment"
    | "rerun_pipeline"
    | "fetch_status";

export type GitLabActionStatus =
    | "pending"
    | "running"
    | "completed"
    | "failed"
    | "fallback";

export interface GitLabRepositoryAction {
    id: string;
    taskId: string;
    proposalId: string;
    actionType: GitLabActionType;
    status: GitLabActionStatus;
    mode: "live" | "fallback";
    gitlabRef?: string;
    summary: string;
    metadata: string; // JSON string
    startedAt: number;
    updatedAt: number;
    completedAt?: number;
}

// ─── MR Record ──────────────────────────────────────────────────────────────

export type GitLabMRStatus =
    | "opened"
    | "merged"
    | "closed"
    | "locked";

export interface GitLabMergeRequestRecord {
    id: string;
    taskId: string;
    proposalId: string;
    mergeRequestIid?: number;
    title: string;
    status: GitLabMRStatus;
    webUrl?: string;
    sourceBranch: string;
    targetBranch: string;
    approvedAt?: number;
    mergedAt?: number;
    createdAt: number;
    updatedAt: number;
}

// ─── Pipeline Record ────────────────────────────────────────────────────────

export type GitLabPipelineStatus =
    | "created"
    | "waiting_for_resource"
    | "preparing"
    | "pending"
    | "running"
    | "success"
    | "failed"
    | "canceled"
    | "skipped"
    | "manual"
    | "scheduled";

export interface GitLabPipelineRecord {
    id: string;
    taskId: string;
    proposalId: string;
    pipelineId?: number;
    status: GitLabPipelineStatus;
    webUrl?: string;
    ref?: string;
    createdAt: number;
    updatedAt: number;
}

// ─── Webhook Event Model ────────────────────────────────────────────────────

export type GitLabWebhookEventKind =
    | "merge_request"
    | "pipeline";

export type GitLabWebhookEventAction =
    | "open"
    | "update"
    | "approved"
    | "unapproved"
    | "merge"
    | "close"
    | "reopen"
    // pipeline actions
    | "started"
    | "succeeded"
    | "failed"
    | "canceled";

export interface GitLabWebhookEvent {
    id: string;
    kind: GitLabWebhookEventKind;
    action: GitLabWebhookEventAction;
    taskId?: string;          // resolved from gitlabRef if possible
    mergeRequestIid?: number;
    pipelineId?: number;
    ref?: string;
    webUrl?: string;
    sourceProjectId?: number;
    rawPayload?: string;      // JSON string of original webhook body
    receivedAt: number;
}
