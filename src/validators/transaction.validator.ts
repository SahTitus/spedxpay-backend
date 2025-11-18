import Joi from "joi"
import { TRANSACTION_TYPE, TRANSACTION_STATUS } from "@/constants/statuses"
import { GIFT_CARD_TYPES } from "@/constants/currencies"

export const getTransactionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
  type: Joi.string().valid("crypto", "giftcard", "googlevoice", "all").default("all").messages({
    "any.only": "Type must be one of: crypto, giftcard, googlevoice, all",
  }),
  transactionType: Joi.string()
    .valid(...Object.values(TRANSACTION_TYPE))
    .optional()
    .messages({
      "any.only": "Invalid transaction type",
    }),
  status: Joi.string()
    .valid(...Object.values(TRANSACTION_STATUS))
    .optional()
    .messages({
      "any.only": "Invalid status",
    }),
  cardType: Joi.string()
    .valid(...Object.values(GIFT_CARD_TYPES))
    .optional()
    .messages({
      "any.only": "Invalid gift card type",
    }),
  search: Joi.string().trim().optional().allow("").messages({
    "string.base": "Search must be a string",
  }),
  sort: Joi.string()
    .valid("createdAt:asc", "createdAt:desc", "amountFiat:asc", "amountFiat:desc")
    .default("createdAt:desc")
    .messages({
      "any.only": "Sort must be one of: createdAt:asc, createdAt:desc, amountFiat:asc, amountFiat:desc",
    }),
})

export const transactionIdParamSchema = Joi.object({
  transactionId: Joi.string().required().messages({
    "any.required": "Transaction ID is required",
  }),
})
