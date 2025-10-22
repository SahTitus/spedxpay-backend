export interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

export interface SMSData {
  to: string
  message: string
}

export interface INotificationAdapter {
  sendEmail(data: EmailData): Promise<boolean>
  sendSMS(data: SMSData): Promise<boolean>
}
