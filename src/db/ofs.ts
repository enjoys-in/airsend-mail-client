import { db } from ".";

export function isOfsSupported() {
  return (
    "showDirectoryPicker" in window &&
    "getFileHandle" in FileSystemDirectoryHandle.prototype &&
    "createWritable" in FileSystemFileHandle.prototype
  );
}


type StoredFile = File

class FileSystemStorage {
  private handles: StoredFile[] = [];

  constructor(initialFiles?: StoredFile | StoredFile[]) {
    if (initialFiles) {
      if (Array.isArray(initialFiles)) {
        this.handles = [...initialFiles];
      } else {
        this.handles = [initialFiles];
      }
    }
  }

  /**
   * Store one or multiple files/handles
   */
  async storeFiles(email: string, files: File[]) {
    const data = files.map(f => ({ blob: f, name: f.name, type: f.type }));
    const existing = await db.files.get(email);

    if (existing) {
      await db.files.put({ email, files: [...existing.files, ...data] });
    } else {
      await db.files.put({ email, files: data });
    }
  }



  /**
   * Get actual File objects from handles (if handle is FileSystemFileHandle, read as File)
   */
  async getFiles(email: string): Promise<File[]> {
    const record = await db.files.get(email);
    if (!record) return [];

    return record.files.map(f => new File([f.blob], f.name, { type: f.type }));
  }
async deleteFile(email: string, filename: string) {
  const record = await db.files.get(email);
  if (!record) return;

  const filteredFiles = record.files.filter(f => f.name !== filename);

  if (filteredFiles.length === 0) {
   
    await db.files.delete(email);
  } else {
   
    await db.files.put({ email, files: filteredFiles });
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