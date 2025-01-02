import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { Update } from "telegraf/types";
import { Message } from "@telegraf/types";
import {
    IAgentRuntime,
    elizaLogger,
    ServiceType,
    ITranscriptionService
} from "@elizaos/core";
import { MessageManager } from "./messageManager.ts";
import { getOrCreateRecommenderInBe } from "./getOrCreateRecommenderInBe.ts";

export class TelegramClient {
    private bot: Telegraf<Context>;
    private runtime: IAgentRuntime;
    private messageManager: MessageManager;
    private backend;
    private backendToken;
    private tgTrader;

    constructor(runtime: IAgentRuntime, botToken: string) {
        elizaLogger.log("📱 Constructing new TelegramClient...");
        this.runtime = runtime;
        this.bot = new Telegraf(botToken);
        this.messageManager = new MessageManager(this.bot, this.runtime);
        this.backend = runtime.getSetting("BACKEND_URL");
        this.backendToken = runtime.getSetting("BACKEND_TOKEN");
        this.tgTrader = runtime.getSetting("TG_TRADER"); // boolean To Be added to the settings
        elizaLogger.log("✅ TelegramClient constructor completed");
    }

    public async start(): Promise<void> {
        elizaLogger.log("🚀 Starting Telegram bot...");
        try {
            await this.initializeBot();
            this.setupMessageHandlers();
            this.setupShutdownHandlers();
        } catch (error) {
            elizaLogger.error("❌ Failed to launch Telegram bot:", error);
            throw error;
        }
    }

    private async initializeBot(): Promise<void> {
        this.bot.launch({ dropPendingUpdates: true });
        elizaLogger.log(
            "✨ Telegram bot successfully launched and is running!"
        );

        const botInfo = await this.bot.telegram.getMe();
        this.bot.botInfo = botInfo;
        elizaLogger.success(`Bot username: @${botInfo.username}`);

        this.messageManager.bot = this.bot;
    }

    private async isGroupAuthorized(ctx: Context): Promise<boolean> {
        const config = this.runtime.character.clientConfig?.telegram;
        if (ctx.from?.id === ctx.botInfo?.id) {
            return false;
        }

        if (!config?.shouldOnlyJoinInAllowedGroups) {
            return true;
        }

        const allowedGroups = config.allowedGroupIds || [];
        const currentGroupId = ctx.chat.id.toString();

        if (!allowedGroups.includes(currentGroupId)) {
            elizaLogger.info(`Unauthorized group detected: ${currentGroupId}`);
            try {
                await ctx.reply("Not authorized. Leaving.");
                await ctx.leaveChat();
            } catch (error) {
                elizaLogger.error(
                    `Error leaving unauthorized group ${currentGroupId}:`,
                    error
                );
            }
            return false;
        }

        return true;
    }

    private setupMessageHandlers(): void {
        elizaLogger.log("Setting up message handler...");

        this.bot.on(message('voice'), async (ctx) => {
            elizaLogger.debug("Voice message received:", {
                messageId: ctx.message.message_id,
                from: ctx.from?.username,
                voice: ctx.message.voice
            });

            try {
                const fileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
                const response = await fetch(fileLink);
                const audioBuffer = await response.arrayBuffer();

                const transcriptionService = this.runtime.getService(ServiceType.TRANSCRIPTION) as ITranscriptionService;
                if (!transcriptionService) {
                    elizaLogger.error("Transcription service not available");
                    return;
                }

                const transcription = await transcriptionService.transcribe(audioBuffer);
                if (transcription) {
                    const newCtx = {
                        ...ctx,
                        message: {
                            ...ctx.message,
                            text: transcription,
                            voice: undefined
                        }
                    };

                    await this.messageManager.handleMessage(newCtx as unknown as Context<Update>);
                }
            } catch (error) {
                elizaLogger.error("Error processing voice message:", error);
            }
        });

        this.bot.on(message('text'), async (ctx) => {
            try {
                if (!await this.isGroupAuthorized(ctx)) {
                    return;
                }
                await this.messageManager.handleMessage(ctx);
            } catch (error) {
                elizaLogger.error("Error handling text message:", error);
            }
        });

        this.bot.on(message("new_chat_members"), async (ctx) => {
            try {
                const newMembers = ctx.message.new_chat_members;
                const isBotAdded = newMembers.some(
                    (member) => member.id === ctx.botInfo.id
                );

                if (isBotAdded && !(await this.isGroupAuthorized(ctx))) {
                    return;
                }
            } catch (error) {
                elizaLogger.error("Error handling new chat members:", error);
            }
        });

        this.bot.on("photo", (ctx) => {
            elizaLogger.log(
                "📸 Received photo message with caption:",
                ctx.message.caption
            );
        });

        this.bot.on("document", (ctx) => {
            elizaLogger.log(
                "📎 Received document message:",
                ctx.message.document.file_name
            );
        });

        this.bot.catch((err, ctx) => {
            elizaLogger.error(`❌ Telegram Error for ${ctx.updateType}:`, err);
            ctx.reply("Hang tight! brb");
        });
    }

    private setupShutdownHandlers(): void {
        const shutdownHandler = async (signal: string) => {
            elizaLogger.log(
                `⚠️ Received ${signal}. Shutting down Telegram bot gracefully...`
            );
            try {
                await this.stop();
                elizaLogger.log("🛑 Telegram bot stopped gracefully");
            } catch (error) {
                elizaLogger.error(
                    "❌ Error during Telegram bot shutdown:",
                    error
                );
                throw error;
            }
        };

        process.once("SIGINT", () => shutdownHandler("SIGINT"));
        process.once("SIGTERM", () => shutdownHandler("SIGTERM"));
        process.once("SIGHUP", () => shutdownHandler("SIGHUP"));
    }

    public async stop(): Promise<void> {
        elizaLogger.log("Stopping Telegram bot...");
        await this.bot.stop();
        elizaLogger.log("Telegram bot stopped");
    }
}
