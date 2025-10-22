import Joi from "joi"

export const createGoogleVoiceOrderSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(10).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "number.max": "Quantity cannot exceed 10",
    "any.required": "Quantity is required",
  }),
  paymentMethod: Joi.string().valid("momo", "bank", "paystack").required().messages({
    "any.only": "Payment method must be 'momo', 'bank', or 'paystack'",
    "any.required": "Payment method is required",
  }),
})

export const reportIssueSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    "string.min": "Reason must be at least 10 characters",
    "string.max": "Reason must not exceed 500 characters",
    "any.required": "Reason is required",
  }),
})

export const googleVoiceActionSchema = Joi.object({
  proofOfPayment: Joi.string().uri().optional().messages({
    "string.uri": "Proof of payment must be a valid URL",
  }),
})

export const orderIdParamSchema = Joi.object({
  orderId: Joi.string().required().messages({
    "any.required": "Order ID is required",
  }),
})
