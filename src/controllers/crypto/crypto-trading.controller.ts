import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware.js";
import { CryptoTradingService } from "../../services/crypto/crypto-trading.service.js";
import { successResponse } from "../../utils/response-formatter.js";
import { asyncHandler } from "../../middlewares/common/error.middleware.js";

export class CryptoTradingController {
  private cryptoTradingService: CryptoTradingService;

  constructor() {
    this.cryptoTradingService = new CryptoTradingService();
  }

  sellCrypto = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const result = await this.cryptoTradingService.sellCrypto(
        userId,
        req.body
      );
      res
        .status(201)
        .json(successResponse("Sell crypto transaction created", result));
    }
  );

  buyCrypto = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const result = await this.cryptoTradingService.buyCrypto(
        userId,
        req.body
      );
      res
        .status(201)
        .json(successResponse("Buy crypto transaction created", result));
    }
  );

  iHaveSent = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { transactionId } = req.params;
      const { proofOfSend } = req.body;
      const result = await this.cryptoTradingService.iHaveSent(
        userId,
        transactionId,
        proofOfSend
      );
      res
        .status(200)
        .json(successResponse("Transaction marked as sent", result));
    }
  );

  iHavePaid = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { transactionId } = req.params;
      const { proofOfPayment } = req.body;
      const result = await this.cryptoTradingService.iHavePaid(
        userId,
        transactionId,
        proofOfPayment
      );
      res
        .status(200)
        .json(successResponse("Payment confirmation received", result));
    }
  );

  getTransaction = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { transactionId } = req.params;
      const transaction = await this.cryptoTradingService.getTransaction(
        userId,
        transactionId
      );
      res
        .status(200)
        .json(successResponse("Transaction retrieved", transaction));
    }
  );

  getUserTransactions = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { status } = req.query;
      const transactions = await this.cryptoTradingService.getUserTransactions(
        userId,
        status as string
      );
      res
        .status(200)
        .json(successResponse("Transactions retrieved", transactions));
    }
  );

  getPlatformWallets = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const wallets = await this.cryptoTradingService.getPlatformWallets();
      res
        .status(200)
        .json(successResponse("Platform wallets retrieved", wallets));
    }
  );

  getPlatformPaymentDetails = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const details =
        await this.cryptoTradingService.getPlatformPaymentDetails();
      res
        .status(200)
        .json(successResponse("Platform payment details retrieved", details));
    }
  );
}
