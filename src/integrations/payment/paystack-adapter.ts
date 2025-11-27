import type {
  IPaymentAdapter,
  PaymentResult,
} from './payment-adapter.interface.js';
import { appConfig } from "../../config/app.config.js";
import { logger } from "../../utils/logger.js";

export class PaystackAdapter implements IPaymentAdapter {
  private secretKey: string;
  private baseUrl = "https://api.paystack.co";

  constructor() {
    this.secretKey = appConfig.payment.paystack.secretKey;
  }

  async initializePayment(
    amount: number,
    email: string,
    reference: string,
    metadata?: any
  ): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to kobo
          email,
          reference,
          metadata,
        }),
      });

      const data = await response.json();

      if (!data.status) {
        throw new Error(data.message || "Paystack initialization failed");
      }

      logger.info(`Paystack payment initialized: ${reference}`);

      return {
        success: true,
        reference,
        message: "Payment initialized successfully",
        metadata: {
          authorizationUrl: data.data.authorization_url,
          accessCode: data.data.access_code,
        },
      };
    } catch (error) {
      logger.error("Paystack initialization error:", error);
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<PaymentResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      const data = await response.json();

      if (!data.status) {
        throw new Error(data.message || "Paystack verification failed");
      }

      const isSuccessful = data.data.status === "success";

      logger.info(
        `Paystack payment verified: ${reference} - ${isSuccessful ? "Success" : "Failed"}`
      );

      return {
        success: isSuccessful,
        transactionId: data.data.id,
        reference,
        message: isSuccessful
          ? "Payment verified successfully"
          : "Payment verification failed",
        metadata: data.data,
      };
    } catch (error) {
      logger.error("Paystack verification error:", error);
      throw error;
    }
  }
}
