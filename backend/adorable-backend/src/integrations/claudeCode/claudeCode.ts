import { query, type SDKMessage } from "@anthropic-ai/claude-code";

export interface CodeGenerationResult {
    success: boolean;
    messages: SDKMessage[];
    error?: string;
}

export async function generateCodeWithClaude(prompt: string, projectId: string): Promise<CodeGenerationResult> {
    try {
        const messages: SDKMessage[] = [];

        // Execute the query and collect all messages
        for await (const message of query({
            prompt: prompt,
            options: {
                cwd: "/workspaces/" + projectId,
                maxTurns: 100, // Allow multiple turns for complex builds
                // Grant all necessary permissions for code generation
                allowedTools: [
                    "Read",
                    "Write",
                    "Edit",
                    "MultiEdit",
                    "Bash",
                    "LS",
                    "Glob",
                    "Grep",
                    "WebSearch",
                    "WebFetch"
                ]
            }
        })) {
            messages.push(message);

            // Log each message for debugging
            console.log(`[${message.type}]`, message);
        }

        return {
            success: true,
            messages: messages
        };

    } catch (error: any) {
        console.error("Error generating code:", error);
        return {
            success: false,
            messages: [],
            error: error.message
        };
    }
}