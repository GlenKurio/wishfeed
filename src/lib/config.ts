import type { GiftStatus } from "./types";

export const GIFT_STATUS_CONFIG: Record<
  GiftStatus,
  {
    label: string;
    description: string;
    color: string; // DaisyUI color class
    icon: string;
    isTerminal: boolean;
    allowedTransitions: GiftStatus[];
  }
> = {
  available: {
    label: "Available",
    description: "Gift is available for reservation",
    color: "neutral",
    icon: "IconClock",
    isTerminal: false,
    allowedTransitions: ["pending_shipment", "sent", "cancelled", "expired"],
  },
  reserved: {
    label: "Reserved",
    description: "Gift reserved, waiting to be sent",
    color: "warning",
    icon: "IconClock",
    isTerminal: false,
    allowedTransitions: ["pending_shipment", "sent", "cancelled", "expired"],
  },
  pending_shipment: {
    label: "Pending Shipment",
    description: "Waiting for shipping label",
    color: "warning",
    icon: "IconPackage",
    isTerminal: false,
    allowedTransitions: ["label_created", "cancelled"],
  },
  label_created: {
    label: "Label Ready",
    description: "Shipping label created, ready to ship",
    color: "info",
    icon: "IconPrinter",
    isTerminal: false,
    allowedTransitions: ["shipped", "cancelled"],
  },
  shipped: {
    label: "Shipped",
    description: "Package is in transit",
    color: "info",
    icon: "IconTruck",
    isTerminal: false,
    allowedTransitions: ["delivered", "received"],
  },
  sent: {
    label: "Sent",
    description: "Gift has been sent",
    color: "info",
    icon: "IconSend",
    isTerminal: false,
    allowedTransitions: ["received", "cancelled"],
  },
  delivered: {
    label: "Delivered",
    description: "Package delivered by carrier",
    color: "success",
    icon: "IconPackageCheck",
    isTerminal: false,
    allowedTransitions: ["received", "thanked"],
  },
  received: {
    label: "Received",
    description: "Recipient confirmed receipt",
    color: "success",
    icon: "IconCheck",
    isTerminal: false,
    allowedTransitions: ["thanked"],
  },
  thanked: {
    label: "Complete",
    description: "Gift cycle complete with thanks",
    color: "success",
    icon: "IconHeart",
    isTerminal: true,
    allowedTransitions: [],
  },
};
