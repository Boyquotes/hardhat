import type { NetworkConnection } from "@ignored/hardhat-vnext/types/network";

import { assertHardhatInvariant } from "@ignored/hardhat-vnext-errors";

/**
 * Get latest balance for an address.
 */
export async function getBalanceFor(
  connection: NetworkConnection,
  address: string,
): Promise<bigint> {
  const balance = await connection.provider.request({
    method: "eth_getBalance",
    params: [address, "latest"],
  });

  assertHardhatInvariant(
    typeof balance === "string",
    "Balance must be a string",
  );

  return BigInt(balance);
}
