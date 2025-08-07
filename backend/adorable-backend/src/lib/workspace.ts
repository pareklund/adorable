import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function ensureWorkspaceIsCreated(projectId: string): Promise<void> {

    console.info("ensureWorkspaceIsCreated");

    const workspacesDir = '/workspaces';
    const projectDir = path.join(workspacesDir, projectId);
    const scaffoldingDir = path.join(workspacesDir, 'scaffolding');

    try {
        // Check if project directory exists
        await fs.access(projectDir);
    } catch (error) {
        // Directory doesn't exist, create it and copy scaffolding using rsync
        await fs.mkdir(projectDir, { recursive: true });

        // Use rsync to copy all files from scaffolding directory
        await execAsync(`rsync -av "${scaffoldingDir}/" "${projectDir}/"`, { maxBuffer: 10 * 1024 * 1024 });
    }
}

// Assumes project workspace exists (as per the function above)
export async function syncCurrentWorkspace(projectId: string): Promise<void> {

    console.info("syncCurrentWorkspace started");

    const workspacesDir = '/workspaces';
    const projectDir = path.join(workspacesDir, projectId);
    const currentDir = path.join(workspacesDir, 'current');

    // Use rsync to make /workspaces/current identical to the project directory
    await execAsync(`rsync -av --delete --filter='P node_modules/' --exclude='node_modules/' "${projectDir}/" "${currentDir}/"`, { maxBuffer: 10 * 1024 * 1024 });

    console.info("syncCurrentWorkspace ended");
}

