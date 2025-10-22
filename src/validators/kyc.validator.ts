import Joi from "joi"

export const submitKycSchema = Joi.object({
  level: Joi.string().valid("basic", "advanced", "business").optional().messages({
    "any.only": "KYC level must be either 'basic', 'advanced', or 'business'",
  }),
  idDocument: Joi.string().uri().required().messages({
    "string.uri": "ID document must be a valid URL",
    "any.required": "ID document is required",
  }),
  selfieDocument: Joi.string().uri().required().messages({
    "string.uri": "Selfie document must be a valid URL",
    "any.required": "Selfie document is required",
  }),
  proofOfAddress: Joi.string().uri().optional().messages({
    "string.uri": "Proof of address must be a valid URL",
  }),
  metadata: Joi.object({
    ipAddress: Joi.string().ip().optional(),
    userAgent: Joi.string().optional(),
  }).optional(),
})

export const reviewKycSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required().messages({
    "any.only": "Status must be either 'approved' or 'rejected'",
    "any.required": "Status is required",
  }),
  rejectionReason: Joi.string()
    .when("status", {
      is: "rejected",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.required": "Rejection reason is required when rejecting KYC",
    }),
})

export const submissionIdSchema = Joi.object({
  submissionId: Joi.string().uuid().required().messages({
    "string.guid": "Invalid submission ID format",
    "any.required": "Submission ID is required",
  }),
})
