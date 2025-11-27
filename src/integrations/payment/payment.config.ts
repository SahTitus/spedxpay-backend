import { ManualPaymentAdapter } from "./manual-adapter.js";
import { PaystackAdapter } from "./paystack-adapter.js";
import type { IPaymentAdapter } from "./payment-adapter.interface.js";

export type PaymentAdapterType = "manual" | "paystack" | "momo-sandbox";

export function getPaymentAdapter(type: PaymentAdapterType): IPaymentAdapter {
  switch (type) {
    case "manual":
      return new ManualPaymentAdapter();
    case "paystack":
      return new PaystackAdapter();
    case "momo-sandbox":
      // MTN MoMo adapter would be implemented here
      return new ManualPaymentAdapter();
    default:
      return new ManualPaymentAdapter();
  }
}
