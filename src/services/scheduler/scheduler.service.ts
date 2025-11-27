import cron from "node-cron";
import type { ScheduledTask } from "node-cron";
import { logger } from "../../utils/logger.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class SchedulerService {
  private jobs: Map<string, ScheduledTask> = new Map();

  /**
   * Initialize all scheduled jobs
   */
  public initialize(): void {
    logger.info("Initializing scheduler service...");

    // Update crypto rates every 1 minutes
    this.scheduleRatesUpdate();

    // Cleanup Google Voice orders every 5 minutes
    this.scheduleGoogleVoiceCleanup();

    // Cleanup old notifications daily at 2 AM
    this.scheduleNotificationCleanup();

    logger.info("All scheduled jobs initialized successfully");
  }

  /**
   * Update cryptocurrency rates every 1 minutes
   */
  private scheduleRatesUpdate(): void {
    const job = cron.schedule("*/1 * * * *", async () => {
      try {
        logger.info("[CRON] Starting rates update job...");
        const { stdout, stderr } = await execAsync(
          "npm run script:update-rates"
        );

        if (stderr) {
          logger.error("[CRON] Rates update stderr:", stderr);
        }

        logger.info("[CRON] Rates update completed:", stdout);
      } catch (error) {
        logger.error("[CRON] Rates update failed:", error);
      }
    });

    this.jobs.set("rates-update", job);
    logger.info("✓ Scheduled: Rates update (every 1 minutes)");
  }

  /**
   * Cleanup Google Voice orders every 5 minutes
   * Auto-completes orders after 5-minute dispute window
   */
  private scheduleGoogleVoiceCleanup(): void {
    const job = cron.schedule("*/5 * * * *", async () => {
      try {
        logger.info("[CRON] Starting Google Voice cleanup job...");
        const { stdout, stderr } = await execAsync(
          "npm run script:cleanup-google-voice"
        );

        if (stderr && !stderr.includes("Warning")) {
          logger.error("[CRON] Google Voice cleanup stderr:", stderr);
        }

        logger.info("[CRON] Google Voice cleanup completed:", stdout);
      } catch (error) {
        logger.error("[CRON] Google Voice cleanup failed:", error);
      }
    });

    this.jobs.set("google-voice-cleanup", job);
    logger.info("✓ Scheduled: Google Voice cleanup (every 5 minutes)");
  }

  /**
   * Cleanup old notifications daily at 2 AM
   * Removes notifications older than 30 days
   */
  private scheduleNotificationCleanup(): void {
    const job = cron.schedule("0 2 * * *", async () => {
      try {
        logger.info("[CRON] Starting notification cleanup job...");

        const { stdout, stderr } = await execAsync(
          "npm run script:cleanup-notifications"
        );

        if (stderr) {
          logger.error("[CRON] Notification cleanup stderr:", stderr);
        }

        logger.info("[CRON] Notification cleanup completed:", stdout);
      } catch (error) {
        logger.error("[CRON] Notification cleanup failed:", error);
      }
    });

    this.jobs.set("notification-cleanup", job);
    logger.info("✓ Scheduled: Notification cleanup (daily at 2 AM)");
  }

  /**
   * Stop all scheduled jobs
   */
  public stopAll(): void {
    logger.info("Stopping all scheduled jobs...");

    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`✓ Stopped: ${name}`);
    });

    this.jobs.clear();
    logger.info("All scheduled jobs stopped");
  }

  /**
   * Get status of all jobs
   */
  public getStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};

    this.jobs.forEach((job, name) => {
      status[name] = job.getStatus() === "scheduled";
    });

    return status;
  }
}

// Export singleton instance
export const schedulerService = new SchedulerService();
