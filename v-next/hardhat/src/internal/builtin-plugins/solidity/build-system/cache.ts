import path from "node:path";

import {
  exists,
  readJsonFile,
  writeJsonFile,
} from "@ignored/hardhat-vnext-utils/fs";

export class Cache {
  readonly #basePath: string;
  readonly #namespace: string;
  readonly #version: string;

  constructor(basePath: string, namespace: string, version: string) {
    this.#basePath = basePath;
    this.#namespace = namespace;
    this.#version = version;
  }

  #getPath(key: string): string {
    return path.join(this.#basePath, this.#namespace, this.#version, key);
  }

  public async has(key: string): Promise<boolean> {
    return exists(this.#getPath(key));
  }

  public async setJson<T>(key: string, value: T): Promise<void> {
    const filePath = this.#getPath(key);
    await writeJsonFile(filePath, value);
  }

  public async getJson<T>(key: string): Promise<T | undefined> {
    const filePath = this.#getPath(key);
    return (await this.has(key)) ? readJsonFile<T>(filePath) : undefined;
  }
}
