import * as logger from "firebase-functions/logger";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import ShipEngine from "shipengine";
interface CarrierPackage {
  packageCode: string;
  name: string;
  description?: string;
}

interface Carrier {
  carrierId: string;
  carrierCode: string;
  name: string;
  nickname?: string;
  balance: number;
  isPrimary: boolean;
  packages: CarrierPackage[];
}

interface ListCarriersResponse {
  carriers: Carrier[];
}
/**
 * Lists all connected carriers with their packages and services.
 * This data is cached on the client for 1 hour since it rarely changes.
 */
export const listCarriers = onCall<void, Promise<ListCarriersResponse>>(
  {
    secrets: ["SHIPENGINE_API_KEY"],
    // Optional: Add rate limiting and memory settings
    // maxInstances: 10,
    // memory: "256MiB",
  },
  async (request) => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in.");
    }

    const apiKey = process.env.SHIPENGINE_API_KEY;
    if (!apiKey) {
      logger.error("SHIPENGINE_API_KEY is not configured");
      throw new HttpsError("internal", "Shipping service is not configured.");
    }

    const shipengine = new ShipEngine(apiKey);

    try {
      const result = await shipengine.listCarriers();

      // Transform the response to our clean format
      const carriers: Carrier[] = result.map((carrier) => ({
        carrierId: carrier.carrierId,
        carrierCode: carrier.carrierCode,
        name: carrier.friendlyName,
        nickname: carrier.nickname || undefined,
        balance: carrier.balance,
        isPrimary: carrier.primary,
        packages: carrier.packages.map((pkg) => ({
          packageCode: pkg.packageCode,
          name: pkg.name,
          description: pkg.description || undefined,
        })),
      }));

      logger.info(
        `Returning ${carriers.length} carriers for user ${request.auth.uid}`,
      );

      return { carriers };
    } catch (error: unknown) {
      logger.error("Error listing carriers:", error);

      if (error instanceof Error) {
        throw new HttpsError(
          "internal",
          error.message || "Failed to fetch carriers.",
        );
      }

      throw new HttpsError("internal", "An unexpected error occurred.");
    }
  },
);
