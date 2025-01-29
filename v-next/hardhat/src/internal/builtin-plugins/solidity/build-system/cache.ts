import path from "node:path";

import {
  exists,
  getAccessTime,
  getAllFilesMatching,
  getSize,
  readJsonFile,
  remove,
  writeJsonFile,
} from "@ignored/hardhat-vnext-utils/fs";

export class ObjectCache<T> {
  readonly #path: string;
  readonly #defaultMaxAgeMs: number;
  readonly #defaultMaxSize: number;

  constructor(
    basePath: string,
    namespace: string,
    version: string,
    defaultMaxAgeMs: number = 7 * 24 * 60 * 60 * 1000, // 1 week
    defaultMaxSize: number = 2 * 1024 * 1024 * 1024, // 2 GB
  ) {
    this.#path = path.join(basePath, namespace, version);
    this.#defaultMaxAgeMs = defaultMaxAgeMs;
    this.#defaultMaxSize = defaultMaxSize;
  }

  public async set(key: string, value: T): Promise<void> {
    const filePath = path.join(this.#path, key);
    await writeJsonFile(filePath, value);
  }

  public async get(key: string): Promise<T | undefined> {
    const filePath = path.join(this.#path, key);
    return (await exists(filePath)) ? readJsonFile<T>(filePath) : undefined;
  }

  public async clean(maxAgeMs?: number, maxSize?: number): Promise<void> {
    maxAgeMs ??= this.#defaultMaxAgeMs;
    maxSize ??= this.#defaultMaxSize;

    const files = await getAllFilesMatching(this.#path);
    const fileInfos = await Promise.all(
      files.map(async (file) => ({
        file,
        atimeMs: (await getAccessTime(file)).getTime(),
        size: await getSize(file),
      })),
    );

    const sortedFileInfos = fileInfos.sort((a, b) => a.atimeMs - b.atimeMs);

    let size = sortedFileInfos.reduce(
      (acc, fileInfo) => acc + fileInfo.size,
      0,
    );
    const minAtimeMs = new Date().getTime() - maxAgeMs;

    const filesToRemove: string[] = [];

    for (const fileInfo of sortedFileInfos) {
      if (fileInfo.atimeMs < minAtimeMs || size > maxSize) {
        filesToRemove.push(fileInfo.file);
        size -= fileInfo.size;
      } else {
        break;
      }
    }

    await Promise.all(filesToRemove.map(async (file) => remove(file)));
  }
}
