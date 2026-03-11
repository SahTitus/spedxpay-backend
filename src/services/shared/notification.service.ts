import { NotificationRepository } from "../../repositories/notification.repository.js";
import { TemplateService } from "../../services/shared/template.service.js";
import { notificationAdapter } from "../../integrations/notification/notification.config.js";
import { logger } from "../../utils/logger.js";
import mongoose from "mongoose";

export interface SendNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  channels?: string[];
  metadata?: Record<string, unknown>
  templateType?: string;
  templateData?: Record<string, unknown>;
  userEmail?: string;
  userName?: string;
}

export class NotificationService {
  private notificationRepo: NotificationRepository;
  private templateService: TemplateService;

  constructor() {
    this.notificationRepo = new NotificationRepository();
    this.templateService = new TemplateService();
  }

  async send(params: SendNotificationParams): Promise<void> {
    try {
      const {
        userId,
        type,
        title,
        message,
        channels = ["email"],
        metadata,
        templateType,
        templateData,
        userEmail,
        userName,
      } = params;

      // Create notification record (retained for 30 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await this.notificationRepo.create({
        userId: new mongoose.Types.ObjectId(userId),
        type,
        title,
        message,
        channels,
        metadata,
        expiresAt,
      });

      if (channels.includes("email") && userEmail) {
         await this.sendEmail(
          userEmail,
          userName,
          templateType,
          templateData,
          title,
          message
        );
      }

      if (channels.includes("sms") && metadata?.phone && typeof metadata.phone === "string") {
        await this.sendSMS(
          metadata.phone,
          userName,
          templateType,
          templateData,
          message
        );
      }
    } catch (error) {
      logger.error("Failed to send notification:", error);
      throw error;
    }
  }

  private async sendEmail(
    to: string,
    userName: string | undefined,
    templateType: string | undefined,
    templateData: Record<string, unknown> | undefined,
    fallbackTitle: string,
    fallbackMessage: string
  ): Promise<void> {
    try {
      let subject = fallbackTitle;
      let html = `<p>${fallbackMessage}</p>`;

      // Use template if provided
      if (templateType && templateData) {
        const template = this.templateService.getEmailTemplate(templateType, {
          ...templateData,
          userName,
        });
        if (template) {
          subject = template.subject;
          html = template.html;
        }
      }

       await notificationAdapter.sendEmail({
        to,
        subject,
        html,
      });

      logger.info(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
    }
  }

  private async sendSMS(
    to: string,
    userName: string | undefined,
    templateType: string | undefined,
    templateData: Record<string, unknown> | undefined,
    fallbackMessage: string
  ): Promise<void> {
    try {
      let message = fallbackMessage;

      // Use template if provided
      if (templateType && templateData) {
        const template = this.templateService.getSMSTemplate(templateType, {
          ...templateData,
          userName,
        });
        if (template) {
          message = template;
        }
      }

      await notificationAdapter.sendSMS({
        to,
        message,
      });

      logger.info(`SMS sent to ${to}`);
    } catch (error) {
      logger.error(`Failed to send SMS to ${to}:`, error);
    }
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    return this.notificationRepo.findByUserId(userId, unreadOnly);
  }

  async markAsRead(notificationId: string) {
    return this.notificationRepo.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepo.markAllAsRead(userId);
  }

  async cleanupExpired(): Promise<number> {
    return this.notificationRepo.deleteExpired();
  }
}
