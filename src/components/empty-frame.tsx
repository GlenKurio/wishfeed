import React from "react";

export default function EmptyFrame({ text }: { text: string }) {
  return (
    <div className="border-primary/50 flex min-h-[400px] w-full items-center justify-center rounded-3xl border-2 border-dashed">
      <p className="text-base-content/70 font-bold">{text}</p>
    </div>
  );
}
