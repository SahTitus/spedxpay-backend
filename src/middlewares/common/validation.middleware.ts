import type { Request, Response, NextFunction } from "express";
import type Joi from "joi";
import { errorResponse } from "../../utils/response-formatter.js";
import { logger } from "../../utils/logger.js";

export class ValidationMiddleware {
  validateBody = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const validationErrors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value,
        }));

        logger.warn("Request body validation failed", {
          path: req.path,
          method: req.method,
          errors: validationErrors,
        });

        return errorResponse(
          res,
          "Validation failed",
          400,
          { errors: validationErrors },
          "validation_error"
        );
      }

      req.body = value;
      next();
    };
  };

  validate = (schemas: {
    body?: Joi.ObjectSchema;
    query?: Joi.ObjectSchema;
    params?: Joi.ObjectSchema;
  }) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const errors: any[] = [];

      if (schemas.body) {
        const { error, value } = schemas.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
          convert: true,
        });

        if (error) {
          errors.push(
            ...error.details.map((detail) => ({
              type: "body",
              field: detail.path.join("."),
              message: detail.message,
              value: detail.context?.value,
            }))
          );
        } else {
          req.body = value;
        }
      }

      if (schemas.query) {
        const { error, value } = schemas.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
          convert: true,
        });

        if (error) {
          errors.push(
            ...error.details.map((detail) => ({
              type: "query",
              field: detail.path.join("."),
              message: detail.message,
              value: detail.context?.value,
            }))
          );
        } else {
          Object.keys(req.query).forEach((key) => delete req.query[key]);
          Object.assign(req.query, value);
        }
      }

      if (schemas.params) {
        const { error, value } = schemas.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
          convert: true,
        });

        if (error) {
          errors.push(
            ...error.details.map((detail) => ({
              type: "params",
              field: detail.path.join("."),
              message: detail.message,
              value: detail.context?.value,
            }))
          );
        } else {
          Object.keys(req.params).forEach((key) => delete req.params[key]);
          Object.assign(req.params, value);
        }
      }

      if (errors.length > 0) {
        logger.warn("Request validation failed", {
          path: req.path,
          method: req.method,
          errors,
        });

        return errorResponse(
          res,
          "Validation failed",
          400,
          { errors },
          "validation_error"
        );
      }

      next();
    };
  };
}

export const validation = new ValidationMiddleware();
