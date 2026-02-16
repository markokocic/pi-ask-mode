/**
 * Ask Mode Extension
 *
 * Read-only mode for safe code analysis.
 * When enabled, only read-only tools are available.
 *
 * Features:
 * - /ask - toggle ask mode
 * - /ask <question> - ask a question (auto-enables ask mode if needed)
 * - Bash restricted to allowlisted read-only commands
 */

import type { AgentMessage } from "@mariozechner/pi-agent-core";
import type { AssistantMessage, TextContent } from "@mariozechner/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { isSafeCommand } from "./utils.js";

// Tools
const ASK_MODE_TOOLS = ["read", "bash", "grep", "find", "ls", "questionnaire"];
const NORMAL_MODE_TOOLS = ["read", "bash", "edit", "write"];

// Type guard for assistant messages
function isAssistantMessage(m: AgentMessage): m is AssistantMessage {
	return m.role === "assistant" && Array.isArray(m.content);
}

// Extract text content from an assistant message
function getTextContent(message: AssistantMessage): string {
	return message.content
		.filter((block): block is TextContent => block.type === "text")
		.map((block) => block.text)
		.join("\n");
}

export default function askModeExtension(pi: ExtensionAPI): void {
	let askModeEnabled = false;
	let originalTools: string[] = [];

	function updateStatus(ctx: ExtensionContext): void {
		// Footer status
		if (askModeEnabled) {
			ctx.ui.setStatus("ask-mode", ctx.ui.theme.fg("warning", "❓ ask"));
		} else {
			ctx.ui.setStatus("ask-mode", undefined);
		}

		// Clear widget
		ctx.ui.setWidget("ask-mode", undefined);
	}

	function activateAskMode(ctx: ExtensionContext): void {
		// Save original tools before switching to ask mode
		originalTools = pi.getActiveTools();
		askModeEnabled = true;
		pi.setActiveTools(ASK_MODE_TOOLS);
		ctx.ui.notify(`Ask mode enabled. Tools: ${ASK_MODE_TOOLS.join(", ")}`);
		updateStatus(ctx);
	}

	function deactivateAskMode(ctx: ExtensionContext): void {
		askModeEnabled = false;
		// Restore original tools (or default to NORMAL_MODE_TOOLS if not set)
		pi.setActiveTools(originalTools.length > 0 ? originalTools : NORMAL_MODE_TOOLS);
		ctx.ui.notify("Ask mode disabled. Full access restored. All tools available.");
		updateStatus(ctx);
	}

	function toggleAskMode(ctx: ExtensionContext): void {
		if (askModeEnabled) {
			deactivateAskMode(ctx);
		} else {
			activateAskMode(ctx);
		}
	}

	pi.registerCommand("ask", {
		description: "Toggle ask mode (read-only) or ask a question with /ask <question>",
		handler: async (args, ctx) => {
			// If no arguments, just toggle ask mode (original behavior)
			if (!args || args.trim() === "") {
				toggleAskMode(ctx);
				return;
			}

			// User provided a question - answer it
			const question = args.trim();
			const wasAskModeActive = askModeEnabled;

			if (wasAskModeActive) {
				// Ask mode already active - just answer and stay in ask mode
				ctx.ui.notify("Answering in ask mode...", "info");
				pi.sendUserMessage(question, { deliverAs: "steer" });
				await ctx.waitForIdle();
			} else {
				// Ask mode not active - temporarily enable, answer, then disable
				ctx.ui.notify("Activating ask mode to answer...", "info");

				// Enable ask mode
				activateAskMode(ctx);

				// Send the question and wait for answer
				pi.sendUserMessage(question, { deliverAs: "steer" });
				await ctx.waitForIdle();

				// Disable ask mode (restore original tools)
				deactivateAskMode(ctx);
				ctx.ui.notify("Ask mode disabled. Full access restored.", "info");
			}
		},
	});

	// Block destructive bash commands in ask mode
	pi.on("tool_call", async (event) => {
		if (!askModeEnabled || event.toolName !== "bash") return;

		const command = event.input.command as string;
		if (!isSafeCommand(command)) {
			return {
				block: true,
				reason: `Ask mode: command blocked (not allowlisted). Use /ask to disable ask mode first.\nCommand: ${command}`,
			};
		}
	});

	// Filter out stale ask mode context when not in ask mode
	pi.on("context", async (event) => {
		if (askModeEnabled) return;

		return {
			messages: event.messages.filter((m) => {
				const msg = m as AgentMessage & { customType?: string };
				if (msg.customType === "ask-mode-context") return false;
				if (msg.role !== "user") return true;

				const content = msg.content;
				if (typeof content === "string") {
					return !content.includes("[ASK MODE ACTIVE]");
				}
				if (Array.isArray(content)) {
					return !content.some(
						(c) => c.type === "text" && (c as TextContent).text?.includes("[ASK MODE ACTIVE]"),
					);
				}
				return true;
			}),
		};
	});

	// Inject ask mode context before agent starts
	pi.on("before_agent_start", async () => {
		if (!askModeEnabled) return;

		return {
			message: {
				customType: "ask-mode-context",
				content: `[ASK MODE ACTIVE]
You are in ask mode - a read-only Q&A mode for safe code analysis.

Restrictions:
- You can only use: read, bash, grep, find, ls, questionnaire
- You CANNOT use: edit, write (file modifications are disabled)
- Bash is restricted to an allowlist of read-only commands

Answer the user's question. Do NOT attempt to make any changes.`,
				display: false,
			},
		};
	});
}
