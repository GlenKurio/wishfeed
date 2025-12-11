import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      className="btn btn-circle btn-ghost btn-sm"
      onClick={() => router.history.back()}
    >
      <IconArrowLeft className="size-4" />
    </button>
  );
}
