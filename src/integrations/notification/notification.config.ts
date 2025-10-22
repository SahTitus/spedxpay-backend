import { EmailAdapter } from "./email-adapter"
import type { INotificationAdapter } from "./notification-adapter.interface"

export type NotificationChannel = "email" | "sms"

export const notificationConfig = {
  defaultChannels: ["email"] as NotificationChannel[],
}

export const notificationAdapter: INotificationAdapter = new EmailAdapter()

export function getEmailAdapter(): EmailAdapter {
  return new EmailAdapter()
}
