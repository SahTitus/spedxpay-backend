import Joi from "joi";
import { CRYPTO_CURRENCIES } from "../constants/currencies.js";

export const sellCryptoSchema = Joi.object({
  cryptocurrency: Joi.string()
    .valid(...Object.values(CRYPTO_CURRENCIES))
    .required()
    .messages({
      "any.only": "Invalid cryptocurrency",
      "any.required": "Cryptocurrency is required",
    }),
  amountCrypto: Joi.number().positive().optional().messages({
    "number.positive": "Amount must be positive",
  }),
  amountFiat: Joi.number().positive().optional().messages({
    "number.positive": "Amount must be positive",
  }),
  paymentMethod: Joi.string().valid("momo", "bank").required().messages({
    "any.only": "Payment method must be either 'momo' or 'bank'",
    "any.required": "Payment method is required",
  }),
  paymentMethodIndex: Joi.number().integer().min(0).required().messages({
    "number.base": "Payment method index must be a number",
    "number.integer": "Payment method index must be an integer",
    "number.min": "Payment method index must be 0 or greater",
    "any.required": "Payment method index is required",
  }),
  termsAccepted: Joi.boolean().valid(true).required().messages({
    "any.only": "You must accept the terms and conditions",
    "any.required": "Terms acceptance is required",
  }),
}).or("amountCrypto", "amountFiat");

export const buyCryptoSchema = Joi.object({
  cryptocurrency: Joi.string()
    .valid(...Object.values(CRYPTO_CURRENCIES))
    .required()
    .messages({
      "any.only": "Invalid cryptocurrency",
      "any.required": "Cryptocurrency is required",
    }),
  amountFiat: Joi.number().positive().required().messages({
    "number.positive": "Amount must be positive",
    "any.required": "Amount is required",
  }),
  walletAddress: Joi.string().required().messages({
    "any.required": "Wallet address is required",
  }),
  paymentMethod: Joi.string()
    .valid("momo", "bank", "paystack")
    .required()
    .messages({
      "any.only": "Payment method must be 'momo', 'bank', or 'paystack'",
      "any.required": "Payment method is required",
    }),
  paymentMethodIndex: Joi.number().integer().min(0).optional().messages({
    "number.base": "Payment method index must be a number",
    "number.integer": "Payment method index must be an integer",
    "number.min": "Payment method index must be 0 or greater",
  }),
  termsAccepted: Joi.boolean().valid(true).required().messages({
    "any.only": "You must accept the terms and conditions",
    "any.required": "Terms acceptance is required",
  }),
});

export const transactionActionSchema = Joi.object({
  proofOfPayment: Joi.string().uri().optional().messages({
    "string.uri": "Proof of payment must be a valid URL",
  }),
  proofOfSend: Joi.string().uri().optional().messages({
    "string.uri": "Proof of send must be a valid URL",
  }),
});

export const transactionIdParamSchema = Joi.object({
  transactionId: Joi.string().required().messages({
    "any.required": "Transaction ID is required",
  }),
});
