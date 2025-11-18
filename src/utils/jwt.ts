import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { appConfig } from "@/config/app.config";

export interface JWTPayload {
  userId: string;
  role: string;
  email: string;
  sessionId?: string;
}

export function generateToken(payload: JWTPayload): string {
  const secret = appConfig.security.jwtSecret;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.sign(payload, secret as Secret, {
    expiresIn: appConfig.security.jwtExpire,
    issuer: "sped_x_pay-platform",
    audience: "sped_x_pay-users",
  } as SignOptions);
}

export function verifyToken(token: string): JWTPayload {
  const secret = appConfig.security.jwtSecret;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.verify(token, secret, {
    issuer: "sped_x_pay-platform",
    audience: "sped_x_pay-users",
  }) as JWTPayload;
}

export function generateRefreshToken(payload: JWTPayload): string {
  const secret = appConfig.security.jwtSecret;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "30d",
    issuer: "sped_x_pay-platform",
    audience: "sped_x_pay-refresh",
  });
}

export function verifyRefreshToken(token: string): JWTPayload {
  const secret = appConfig.security.jwtSecret;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.verify(token, secret, {
    issuer: "sped_x_pay-platform",
    audience: "sped_x_pay-refresh",
  }) as JWTPayload;
}
