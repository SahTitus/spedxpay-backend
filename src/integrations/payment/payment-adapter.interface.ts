export interface PaymentResult {
  success: boolean
  transactionId?: string
  reference?: string
  message: string
  metadata?: Record<string, unknown>
}

export interface IPaymentAdapter {
  initializePayment(amount: number, email: string, reference: string, metadata?: any): Promise<PaymentResult>
  verifyPayment(reference: string): Promise<PaymentResult>
}
