// ShipLabelDialog.tsx
import { forwardRef, useImperativeHandle, useRef } from "react";

export interface DialogHandle {
  open: () => void;
  close: () => void;
}

const ShipLabelDialog = forwardRef<DialogHandle>((_, ref) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  }));

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-lg">
        <h3 className="text-lg font-bold">Ship with Label</h3>
        <p className="py-4">Configure your shipping label details...</p>
        <div className="modal-action">
          <button className="btn" onClick={() => dialogRef.current?.close()}>
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
});

ShipLabelDialog.displayName = "ShipLabelDialog";
export default ShipLabelDialog;
