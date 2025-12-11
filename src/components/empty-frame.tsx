export default function EmptyFrame({ text }: { text: string }) {
  return (
    <div className="border-primary/50 flex min-h-[300px] w-full items-center justify-center rounded-3xl border-2 border-dashed p-4 lg:min-h-[400px]">
      <p className="text-base-content/70 text-center font-bold">{text}</p>
    </div>
  );
}
