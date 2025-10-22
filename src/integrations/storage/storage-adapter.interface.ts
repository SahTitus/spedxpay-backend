export interface UploadResult {
  success: boolean
  url: string
  key: string
  metadata?: Record<string, any>
}

export interface IStorageAdapter {
  upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult>
  delete(key: string): Promise<boolean>
  getUrl(key: string): string
}
