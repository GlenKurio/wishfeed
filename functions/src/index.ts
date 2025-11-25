import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const sayHello = onCall(async (request) => {
  try {
    logger.info("sayHello function called", { structuredData: true });

    const name = request.data.name || "World";

    return {
      message: `Hello, ${name}! Welcome to Wishfeed.`,
    };
  } catch (error) {
    logger.error("Error in sayHello function:", error);
    throw error;
  }
});
