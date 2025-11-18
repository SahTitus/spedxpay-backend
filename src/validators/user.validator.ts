import Joi from "joi"

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 100 characters",
  }),
  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .optional()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),
})

export const addPaymentMethodSchema = Joi.object({
  type: Joi.string().valid("momo", "bank").required().messages({
    "any.only": "Payment method type must be either 'momo' or 'bank'",
    "any.required": "Payment method type is required",
  }),
  details: Joi.object({
    momoNumber: Joi.string().when("$type", {
      is: "momo",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    momoProvider: Joi.string().when("$type", {
      is: "momo",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    bankName: Joi.string().when("$type", {
      is: "bank",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    accountNumber: Joi.string().when("$type", {
      is: "bank",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    accountName: Joi.string().when("$type", {
      is: "bank",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }).required(),
  isPrimary: Joi.boolean().optional(),
})

export const paymentMethodIndexSchema = Joi.object({
  methodIndex: Joi.number().integer().min(0).required().messages({
    "number.base": "Method index must be a number",
    "number.integer": "Method index must be an integer",
    "number.min": "Method index must be 0 or greater",
    "any.required": "Method index is required",
  }),
})

export const removePaymentMethodSchema = Joi.object({
  paymentMethodId: Joi.string().required().messages({
    "string.base": "Payment method ID must be a string",
    "any.required": "Payment method ID is required",
  }),
})