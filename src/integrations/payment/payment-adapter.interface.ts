export interface PaymentResult {
  success: boolean
  transactionId?: string
  reference?: string
  message: string
  metadata?: Record<string, any>
}

export interface IPaymentAdapter {
  initializePayment(amount: number, email: string, reference: string, metadata?: any): Promise<PaymentResult>
  verifyPayment(reference: string): Promise<PaymentResult>
}
