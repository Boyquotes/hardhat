import { assertHardhatInvariant } from "@ignored/hardhat-vnext-errors";
import { status } from "@ignored/hardhat-vnext-ignition-core";
import { assert } from "chai";

import { HardhatArtifactResolver } from "../../src/hardhat-artifact-resolver.js";
import { useFileIgnitionProject } from "../test-helpers/use-ignition-project.js";

// TODO: Bring back with Hardhat 3 fixtures
describe.skip("reset flag", function () {
  useFileIgnitionProject("reset-flag", "custom-reset-id");

  it("should reset a deployment", async function () {
    // TODO: HH3 look again at this any - is networkName even the right
    // thing here.
    (this.connection as any).networkName = "something-else";

    await this.hre.tasks.getTask(["ignition", "deploy"]).run({
      modulePath: "./ignition/modules/FirstPass.js",
      deploymentId: "custom-reset-id",
      reset: true,
    });

    await this.hre.tasks.getTask(["ignition", "deploy"]).run({
      modulePath: "./ignition/modules/SecondPass.js",
      deploymentId: "custom-reset-id",
      reset: true,
    });

    const artifactResolver = new HardhatArtifactResolver(this.hre);

    assertHardhatInvariant(
      this.deploymentDir !== undefined,
      "Deployment dir is undefined",
    );
    const result = await status(this.deploymentDir, artifactResolver);

    // ResetModule#B will only be in the success list if the second
    // run ran without any reconciliation errors - so the retry
    // cleared the first pass
    assert(
      result.successful.includes("ResetModule#B"),
      "Retry did not clear first pass, so second pass failed",
    );
  });
});
