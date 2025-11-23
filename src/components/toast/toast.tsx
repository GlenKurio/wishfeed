import { toast as sonnerToast } from "sonner";
import Toast from "./toast-comp";

export type ToastVariant = "success" | "warning" | "error" | "info";

interface ToastConfig {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export const toast = {
  success: (config: Omit<ToastConfig, "variant">) => {
    return sonnerToast.custom((id) => (
      <Toast id={id} variant="success" {...config} />
    ));
  },

  warning: (config: Omit<ToastConfig, "variant">) => {
    return sonnerToast.custom((id) => (
      <Toast id={id} variant="warning" {...config} />
    ));
  },

  error: (config: Omit<ToastConfig, "variant">) => {
    return sonnerToast.custom((id) => (
      <Toast id={id} variant="error" {...config} />
    ));
  },

  info: (config: Omit<ToastConfig, "variant">) => {
    return sonnerToast.custom((id) => (
      <Toast id={id} variant="info" {...config} />
    ));
  },
};
