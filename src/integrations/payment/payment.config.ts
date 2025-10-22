import { ManualPaymentAdapter } from "./manual-adapter"
import { PaystackAdapter } from "./paystack-adapter"
import type { IPaymentAdapter } from "./payment-adapter.interface"

export type PaymentAdapterType = "manual" | "paystack" | "momo-sandbox"

export function getPaymentAdapter(type: PaymentAdapterType): IPaymentAdapter {
  switch (type) {
    case "manual":
      return new ManualPaymentAdapter()
    case "paystack":
      return new PaystackAdapter()
    case "momo-sandbox":
      // MTN MoMo adapter would be implemented here
      return new ManualPaymentAdapter()
    default:
      return new ManualPaymentAdapter()
  }
}
