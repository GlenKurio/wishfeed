// Use ES Module imports for v2 functions
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// Use modular imports for the Firebase Admin SDK
import { FieldValue } from "firebase-admin/firestore";
import { ShipEngine } from "shipengine";
const db = admin.firestore();

/**
 * A v2 callable Cloud Function to generate a shipping label.
 * This function is configured to have access to the SHIPENGINE_API_KEY secret.
 */
export const generateShippingLabel = onCall(
  { secrets: ["SHIPENGINE_API_KEY"] },
  async (request) => {
    // 1. --- Authentication and Validation ---
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to gift a wish.",
      );
    }

    const { wisherId, wishId, carrierId, serviceCode } = request.data;
    const gifterId = request.auth.uid;

    if (!wisherId || !wishId || !carrierId || !serviceCode) {
      throw new HttpsError("invalid-argument", "Missing required data.");
    }

    // Initialize the ShipEngine client with the secret key
    const shipengine = new ShipEngine(process.env.SHIPENGINE_API_KEY!);

    try {
      // 2. --- Fetch Data from Firestore ---
      const gifterDoc = await db.collection("users").doc(gifterId).get();
      const wisherDoc = await db.collection("users").doc(wisherId).get();
      const wishDoc = await db.collection("wishes").doc(wishId).get();

      if (!gifterDoc.exists || !wisherDoc.exists || !wishDoc.exists) {
        throw new HttpsError("not-found", "User or wish data not found.");
      }

      // Note: The SDK may use camelCase (cityLocality) vs snake_case (city_locality).
      // Ensure your Firestore data matches the SDK's expected format.
      const shipFrom = gifterDoc.data().shippingAddress;
      const shipTo = wisherDoc.data().shippingAddress;
      const packageDetails = wishDoc.data().package;

      if (!shipFrom || !shipTo || !packageDetails) {
        throw new HttpsError(
          "failed-precondition",
          "Missing address or package details.",
        );
      }

      // 3. --- Construct the SDK Parameters ---
      const params = {
        shipment: {
          carrierId: carrierId,
          serviceCode: serviceCode,
          shipTo: shipTo,
          shipFrom: shipFrom,
          packages: [packageDetails],
        },
      };

      // 4. --- Call the ShipEngine SDK ---
      logger.info(`Creating label for wish: ${wishId} via ShipEngine SDK.`);
      const result = await shipengine.createLabelFromShipmentDetails(params);

      // The 'result' object is already parsed and structured.
      const labelData = {
        trackingNumber: result.trackingNumber,
        labelDownloadUrl: result.labelDownload.pdf,
      };

      // 5. --- Save Results to Firestore ---
      const giftRef = db.collection("gifts").doc();
      await giftRef.set({
        wishId: wishId,
        wisherId: wisherId,
        gifterId: gifterId,
        createdAt: FieldValue.serverTimestamp(),
        trackingNumber: labelData.trackingNumber,
        labelDownloadUrl: labelData.labelDownloadUrl,
        status: "label_created",
        shipmentId: result.shipmentId, // Store extra useful info from the result
      });

      logger.info(
        `Label created for gift ${giftRef.id}. Tracking: ${labelData.trackingNumber}`,
      );

      // 6. --- Return the clean data to the Gifter ---
      return {
        success: true,
        labelDownloadUrl: labelData.labelDownloadUrl,
        trackingNumber: labelData.trackingNumber,
        giftId: giftRef.id,
      };
    } catch (error: any) {
      // The SDK provides more structured errors
      logger.error("Error creating shipping label via SDK:", error);

      // The error object (e.g., from ShipEngine.errors) often has a helpful message
      throw new HttpsError(
        "internal",
        error.message ||
          "An unexpected error occurred while creating the shipping label.",
      );
    }
  },
);
