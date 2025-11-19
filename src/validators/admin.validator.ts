import Joi from "joi";


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
});

export const confirmPaymentSchema = Joi.object({
  blockchainTxHash: Joi.string().optional(),
  adminNotes: Joi.string().max(500).optional(),
});

export const completeTransactionSchema = Joi.object({
  adminNotes: Joi.string().max(500).optional(),
});

export const rejectTransactionSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    "string.min": "Reason must be at least 10 characters",
    "string.max": "Reason must not exceed 500 characters",
    "any.required": "Reason is required",
  }),
});

export const reviewGiftCardSchema = Joi.object({
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
      "any.required": "Rejection reason is required when rejecting gift card",
    }),
});

export const deliverGoogleVoiceSchema = Joi.object({
  accounts: Joi.array()
    .items(
      Joi.object({
        accountEmail: Joi.string().email().required().messages({
          "string.email": "Please provide a valid email address",
          "any.required": "Account email is required",
        }),
        phoneNumber: Joi.string().required().messages({
          "any.required": "Phone number is required",
        }),
        recoveryEmail: Joi.string().email().required().messages({
          "string.email": "Please provide a valid recovery email address",
          "any.required": "Recovery email is required",
        }),
        password: Joi.string().required().messages({
          "any.required": "Password is required",
        }),
      })
    )
    .min(1)
    .max(10)
    .required()
    .messages({
      "array.min": "At least one account is required",
      "array.max": "Cannot deliver more than 10 accounts at once",
      "any.required": "Accounts array is required",
    }),
});

export const resolveDisputeSchema = Joi.object({
  resolution: Joi.string().min(10).max(500).required().messages({
    "string.min": "Resolution must be at least 10 characters",
    "string.max": "Resolution must not exceed 500 characters",
    "any.required": "Resolution is required",
  }),
});

export const updatePlatformConfigSchema = Joi.object({
  wallets: Joi.object({
    btc: Joi.string().optional(),
    eth: Joi.string().optional(),
    usdt: Joi.string().optional(),
    ltc: Joi.string().optional(),
    xrp: Joi.string().optional(),
  }).optional(),
  payment: Joi.object({
    momoNumber: Joi.string().optional(),
    momoProvider: Joi.string().optional(),
    bankName: Joi.string().optional(),
    bankAccountNumber: Joi.string().optional(),
    bankAccountName: Joi.string().optional(),
  }).optional(),
});

export const createGiftCardTypeSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 50 characters",
    "any.required": "Name is required",
  }),
  code: Joi.string()
    .min(2)
    .max(20)
    .pattern(/^[a-z0-9-]+$/)
    .required()
    .messages({
      "string.min": "Code must be at least 2 characters",
      "string.max": "Code must not exceed 20 characters",
      "string.pattern.base":
        "Code must contain only lowercase letters, numbers, and hyphens",
      "any.required": "Code is required",
    }),
  description: Joi.string().max(200).optional().messages({
    "string.max": "Description must not exceed 200 characters",
  }),
  icon: Joi.string().uri().optional().messages({
    "string.uri": "Icon must be a valid URL",
  }),
});

export const updateGiftCardTypeSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 50 characters",
  }),
  description: Joi.string().max(200).optional().messages({
    "string.max": "Description must not exceed 200 characters",
  }),
  isActive: Joi.boolean().optional(),
  icon: Joi.string().uri().optional().messages({
    "string.uri": "Icon must be a valid URL",
  }),
});

export const deliverGiftCardSchema = Joi.object({
  cardDetails: Joi.object({
    pin: Joi.string().optional(),
    serial: Joi.string().optional(),
    code: Joi.string().optional(),
    redemptionUrl: Joi.string().uri().optional(),
  })
    .required()
    .messages({
      "any.required": "Card details are required",
    }),
  notes: Joi.string().max(500).optional().messages({
    "string.max": "Notes must not exceed 500 characters",
  }),
});

export const cancelBuyOrderSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    "string.min": "Reason must be at least 10 characters",
    "string.max": "Reason must not exceed 500 characters",
    "any.required": "Reason is required",
  }),
});

export const assignRoleSchema = Joi.object({
  role: Joi.string()
    .valid("user", "admin", "assistant_admin")
    .required()
    .messages({
      "any.only": "Role must be one of: user, admin, assistant_admin",
      "any.required": "Role is required",
    }),
});

export const inviteAdminSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  role: Joi.string().valid("admin", "assistant_admin").required().messages({
    "any.only": "Role must be either admin or assistant_admin",
    "any.required": "Role is required",
  }),
});
