import path from "path";
import fs from "fs";

export class WorkspaceService {
    private currentRepoPath: string | null = null;
    private currentAppPath: string | null = null;

    /**
     * Resolves and verifies the workspace directory.
     */
    async setupWorkspace(repoPath: string): Promise<{ repoPath: string; appPath: string }> {
        const absoluteRepoPath = path.resolve(repoPath);
        this.currentRepoPath = absoluteRepoPath;

        console.log(`[WORKSPACE] Analyzing repository at: ${absoluteRepoPath}`);

        // 1. Check if it's the root
        if (this.hasPackageJson(absoluteRepoPath)) {
            console.log(`[WORKSPACE] Found package.json in repo root.`);
            this.currentAppPath = absoluteRepoPath;
        } else {
            // 2. Intelligent detection of app directory
            const candidates = ["apps/web", "app", "frontend", "client", "web", "website", "packages/app"];
            let found = false;

            for (const candidate of candidates) {
                const fullPath = path.join(absoluteRepoPath, candidate);
                if (this.hasPackageJson(fullPath)) {
                    console.log(`[WORKSPACE] Detected app directory: ${candidate}`);
                    this.currentAppPath = fullPath;
                    found = true;
                    break;
                }
            }

            // 3. One-level deep search (if not found in candidates)
            if (!found) {
                try {
                    const items = fs.readdirSync(absoluteRepoPath);
                    for (const item of items) {
                        const fullPath = path.join(absoluteRepoPath, item);
                        if (fs.statSync(fullPath).isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                            if (this.hasPackageJson(fullPath)) {
                                console.log(`[WORKSPACE] Found app in subdirectory: ${item}`);
                                this.currentAppPath = fullPath;
                                found = true;
                                break;
                            }
                        }
                    }
                } catch (e) { }
            }

            if (!found) {
                console.warn(`[WORKSPACE] WARNING: No package.json found. Defaulting to repo root: ${absoluteRepoPath}`);
                this.currentAppPath = absoluteRepoPath;
            }
        }

        return {
            repoPath: this.currentRepoPath,
            appPath: this.currentAppPath!,
        };
    }

    private hasPackageJson(dir: string): boolean {
        const pkgPath = path.join(dir, "package.json");
        return fs.existsSync(pkgPath);
    }

    getWorkspaceInfo() {
        return {
            repoPath: this.currentRepoPath,
            appPath: this.currentAppPath,
            packageJsonExists: this.currentAppPath ? this.hasPackageJson(this.currentAppPath) : false,
        };
    }
}

export const workspaceService = new WorkspaceService();
