import { exec, ChildProcess } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}

export class CommandService {
    private activeProcesses: Map<string, ChildProcess> = new Map();

    /**
     * Executes a command in the specified directory.
     * Defaults to the project root (one level up from the sandbox).
     */
    async execute(command: string, cwd?: string): Promise<ExecutionResult> {
        const defaultCwd = path.resolve(__dirname, "../../..");
        const finalCwd = cwd || defaultCwd;

        console.log(`[COMMAND] Executing: "${command}" in ${finalCwd}`);

        try {
            const { stdout, stderr } = await execAsync(command, {
                cwd: finalCwd,
                env: { ...process.env, CI: "true" },
            });

            return {
                stdout,
                stderr,
                exitCode: 0,
            };
        } catch (error: any) {
            console.error(`[COMMAND] Failed: "${command}"`, error.stdout || error.message);
            return {
                stdout: error.stdout || "",
                stderr: error.stderr || error.message,
                exitCode: error.code || 1,
            };
        }
    }

    /**
     * Starts a command in the background.
     */
    async startBackground(id: string, command: string, cwd?: string): Promise<void> {
        const defaultCwd = path.resolve(__dirname, "../../..");
        const finalCwd = cwd || defaultCwd;

        if (this.activeProcesses.has(id)) {
            await this.stopBackground(id);
        }

        console.log(`[COMMAND] Starting background: "${command}" in ${finalCwd} (ID: ${id})`);

        const child = exec(command, {
            cwd: finalCwd,
            env: { ...process.env, CI: "true" },
        });

        child.stdout?.on("data", (data) => console.log(`[${id}] ${data}`));
        child.stderr?.on("data", (data) => console.error(`[${id}] ${data}`));

        this.activeProcesses.set(id, child);
    }

    /**
     * Stops a background command.
     */
    async stopBackground(id: string): Promise<void> {
        const child = this.activeProcesses.get(id);
        if (child) {
            console.log(`[COMMAND] Stopping background ID: ${id}`);
            child.kill();
            this.activeProcesses.delete(id);
        }
    }
}

export const commandService = new CommandService();
