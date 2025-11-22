import {
  IconAlertTriangle,
  IconCircleCheck,
  IconExclamationCircle,
  IconInfoCircle,
} from "@tabler/icons-react";
import type { ToastVariant } from "./toast";

interface ToastProps {
  id: string | number;
  title: string;
  description: string;
  variant: ToastVariant;
}

const variantStyles = {
  success: {
    bg: "bg-success",
    text: "text-success-content",
    icon: IconCircleCheck,
  },
  warning: {
    bg: "bg-warning",
    text: "text-warning-content",
    icon: IconAlertTriangle,
  },
  error: {
    bg: "bg-error",
    text: "text-error-content",
    icon: IconExclamationCircle,
  },
  info: {
    bg: "bg-info",
    text: "text-info-content",
    icon: IconInfoCircle,
  },
};

export default function Toast({ title, description, variant }: ToastProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div
      className={`flex rounded-3xl ${styles.bg} shadow-lg ring-1 ring-black/5 w-full md:max-w-[364px] items-center gap-3 p-4`}
    >
      <Icon className={`${styles.text} shrink-0`} size={24} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${styles.text}`}>{title}</p>
        <p className={`mt-1 text-sm ${styles.text} opacity-70`}>
          {description}
        </p>
      </div>
    </div>
  );
}
