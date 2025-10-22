import type { IPaymentAdapter, PaymentResult } from "./payment-adapter.interface"
import { logger } from "@/utils/logger"

export class ManualPaymentAdapter implements IPaymentAdapter {
  async initializePayment(amount: number, email: string, reference: string, metadata?: any): Promise<PaymentResult> {
    logger.info(`Manual payment initialized: ${reference} for ${email}`)

    return {
      success: true,
      reference,
      message: "Manual payment initialized. Please make payment and click 'I Have Paid'.",
      metadata: {
        amount,
        email,
        ...metadata,
      },
    }
  }

  async verifyPayment(reference: string): Promise<PaymentResult> {
    logger.info(`Manual payment verification requested: ${reference}`)

    return {
      success: false,
      reference,
      message: "Manual payment requires admin verification.",
    }
  }
}
