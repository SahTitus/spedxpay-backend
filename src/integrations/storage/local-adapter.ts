import type { IStorageAdapter, UploadResult } from "./storage-adapter.interface"
import { logger } from "../../utils/logger"
import fs from "fs"
import path from "path"

export class LocalStorageAdapter implements IStorageAdapter {
  private uploadDir: string

  constructor() {
    this.uploadDir = path.join(process.cwd(), "uploads")
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  async upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    try {
      const key = `${Date.now()}-${filename}`
      const filePath = path.join(this.uploadDir, key)

      fs.writeFileSync(filePath, file)

      logger.info(`File uploaded locally: ${key}`)

      return {
        success: true,
        url: `/uploads/${key}`,
        key,
        metadata: {
          mimeType,
          size: file.length,
        },
      }
    } catch (error) {
      logger.error("Local storage upload error:", error)
      throw error
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, key)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        logger.info(`File deleted locally: ${key}`)
        return true
      }
      return false
    } catch (error) {
      logger.error("Local storage delete error:", error)
      return false
    }
  }

  getUrl(key: string): string {
    return `/uploads/${key}`
  }
}
