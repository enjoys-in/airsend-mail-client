import { db } from ".";

export function isOfsSupported() {
  return (
    "showDirectoryPicker" in window &&
    "getFileHandle" in FileSystemDirectoryHandle.prototype &&
    "createWritable" in FileSystemFileHandle.prototype
  );
}

type StoredFile = {
  blob: Blob;
  name: string;
  type: string;
};

class FileSystemStorage {
  /**
   * Store one or multiple files per email + tabId
   */
  async storeFiles(email: string, input: { tabId: string; files: File[] }) {
    const data: StoredFile[] = input.files.map((f) => ({
      blob: f,
      name: f.name,
      type: f.type,
    }));

    const key = [email, input.tabId];
    const existing = await db.files.get(key);

    if (existing) {
      await db.files.put({
        email,
        tabId: input.tabId,
        files: [...existing.files, ...data],
      });
    } else {
      await db.files.put({
        email,
        tabId: input.tabId,
        files: data,
      });
    }
  }

  /**
   * Get actual File objects for a given email + tabId
   */
  async getFiles(email: string, tabId: string): Promise<File[]> {
    const record = await db.files.get([email, tabId]);
    if (!record) return [];

    return record.files.map(
      (f: StoredFile) => new File([f.blob], f.name, { type: f.type })
    );
  }

  /**
   * Delete one file by filename for a given email + tabId
   */
  async deleteFile(email: string, tabId: string, filename: string) {
    const record = await db.files.get([email, tabId]);
    if (!record) return;

    const filteredFiles = record.files.filter((f: StoredFile) => f.name !== filename);

    if (filteredFiles.length === 0) {
      await db.files.where("email+tabId").equals([email, tabId]).delete();
    } else {
      await db.files.put({ email, tabId, files: filteredFiles });
    }
  }

  /**
   * Clear all stored items
   */
  clear() {
    db.files.clear();
  }
}

export const ofss = new FileSystemStorage();
