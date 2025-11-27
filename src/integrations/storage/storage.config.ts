import { LocalStorageAdapter } from "./local-adapter.js";
import { CloudinaryAdapter } from "./cloudinary-adapter.js";
import type { IStorageAdapter } from "./storage-adapter.interface.js";

export type StorageAdapterType = "local" | "cloudinary" | "s3";

export const storageConfig = {
  adapter: (process.env.STORAGE_ADAPTER || "local") as StorageAdapterType,
};

export function getStorageAdapter(): IStorageAdapter {
  switch (storageConfig.adapter) {
    case "local":
      return new LocalStorageAdapter();
    case "cloudinary":
      return new CloudinaryAdapter();
    case "s3":
      // TODO: S3 adapter would be implemented here
      return new LocalStorageAdapter();
    default:
      return new LocalStorageAdapter();
  }
}
