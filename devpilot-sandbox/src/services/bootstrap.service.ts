import { BootstrapMetadata } from "./bootstrap.types";
import { commandService } from "./command.service";
import { workspaceService } from "./workspace.service";

export class BootstrapService {
    async prepareWorkspace(repoPath: string): Promise<BootstrapMetadata> {
        const analysis = await workspaceService.setupWorkspace(repoPath);
        const { commandPlan, toolingPreparation } = await commandService.prepareEnvironment(analysis.appRoot);

        const verificationChecks = [...toolingPreparation.verificationChecks];
        const warnings = [...analysis.warnings, ...toolingPreparation.warnings];
        const success = toolingPreparation.packageManagerBinaryReady;

        return {
            repoRoot: analysis.repoRoot,
            appRoot: analysis.appRoot,
            installRoot: analysis.installRoot,
            framework: analysis.framework.framework,
            packageManager: analysis.packageManager,
            detectedLockfile: analysis.detectedLockfile,
            detectedLockfilePath: analysis.detectedLockfilePath,
            installCommandUsed: commandPlan.installCommandUsed,
            buildCommandUsed: commandPlan.buildCommandUsed,
            devCommandUsed: commandPlan.devCommandUsed,
            previewCommandUsed: commandPlan.previewCommandUsed,
            candidateRootsConsidered: analysis.candidateRootsConsidered,
            reasoning: analysis.reasoning,
            verificationChecks,
            warnings,
            success,
        };
    }
}

export const bootstrapService = new BootstrapService();
