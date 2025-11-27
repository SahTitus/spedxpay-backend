import { Resend } from "resend";
import { appConfig } from "../../config/app.config.js";
import { logger } from "../../utils/logger.js";
import type {
  INotificationAdapter,
  EmailData,
  SMSData,
} from "./notification-adapter.interface";

export class EmailAdapter implements INotificationAdapter {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(appConfig.email.resendApiKey);
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      const result = await this.resend.emails.send({
        from:
          data.from ||
          `${appConfig.email.fromName} <${appConfig.email.fromEmail}>`,
        to: data.to,
        subject: data.subject,
        html: data.html,
      });

      logger.info(`Email sent to ${data.to}: ${data.subject}`);
      return true;
    } catch (error) {
      logger.error("Email send error:", error);
      return false;
    }
  }

  async sendSMS(data: SMSData): Promise<boolean> {
    logger.warn("SMS not supported by EmailAdapter");
    return false;
  }
}
