import type { HardhatPlugin } from "../../../types/plugins.js";

import { task } from "../../core/config.js";

import "./type-extensions.js";

const hardhatPlugin: HardhatPlugin = {
  id: "builtin:solidity-tests",
  hookHandlers: {
    config: import.meta.resolve("./hook-handlers/config.js"),
  },
  tasks: [
    task(["test", "solidity"], "Run the Solidity tests")
      .addFlag({
        name: "noCompile",
        description: "Don't compile the project before running the test",
      })
      .setAction(import.meta.resolve("./task-action.js"))
      .build(),
  ],
  dependencies: [
    async () => {
      const { default: solidityBuiltinPlugin } = await import(
        "../solidity/index.js"
      );
      return solidityBuiltinPlugin;
    },
    async () => {
      const { default: testBuiltinPlugin } = await import("../test/index.js");
      return testBuiltinPlugin;
    },
  ],
  npmPackage: "@ignored/hardhat-vnext",
};

export default hardhatPlugin;
