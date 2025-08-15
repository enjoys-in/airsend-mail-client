export function isOfsSupported() {
    return (
        "showDirectoryPicker" in window &&
        "getFileHandle" in FileSystemDirectoryHandle.prototype &&
        "createWritable" in FileSystemFileHandle.prototype
    );
}

