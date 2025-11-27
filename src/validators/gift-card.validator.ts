import Joi from "joi";
import { GIFT_CARD_TYPES } from "../constants/currencies.js";

export const sellGiftCardSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(GIFT_CARD_TYPES))
    .required()
    .messages({
      "any.only": "Invalid gift card type",
      "any.required": "Gift card type is required",
    }),
  faceValue: Joi.number().positive().required().messages({
    "number.positive": "Face value must be positive",
    "any.required": "Face value is required",
  }),
  cardForm: Joi.string().valid("electronic", "physical").required().messages({
    "any.only": "Card form must be either 'electronic' or 'physical'",
    "any.required": "Card form is required",
  }),
  cardDetails: Joi.object({
    pin: Joi.string().when("$cardForm", {
      is: "electronic",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    serial: Joi.string().when("$cardForm", {
      is: "electronic",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }).optional(),
  photos: Joi.object({
    front: Joi.string().uri().when("$cardForm", {
      is: "physical",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    back: Joi.string().uri().when("$cardForm", {
      is: "physical",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }).optional(),
  receiptPhoto: Joi.string().uri().optional().messages({
    "string.uri": "Receipt photo must be a valid URL",
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
});

export const buyGiftCardSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(GIFT_CARD_TYPES))
    .required()
    .messages({
      "any.only": "Invalid gift card type",
      "any.required": "Gift card type is required",
    }),
  faceValue: Joi.number().positive().required().messages({
    "number.positive": "Face value must be positive",
    "any.required": "Face value is required",
  }),
  paymentMethod: Joi.string()
    .valid("momo", "bank", "paystack")
    .required()
    .messages({
      "any.only": "Payment method must be 'momo', 'bank', or 'paystack'",
      "any.required": "Payment method is required",
    }),
});

export const giftCardActionSchema = Joi.object({
  proofOfPayment: Joi.string().uri().optional().messages({
    "string.uri": "Proof of payment must be a valid URL",
  }),
  // proofOfSend: Joi.string().uri().optional().messages({
  //   "string.uri": "Proof of send must be a valid URL",
  // }),
});

export const giftCardIdParamSchema = Joi.object({
  giftCardId: Joi.string().required().messages({
    "any.required": "Gift card ID is required",
  }),
});
