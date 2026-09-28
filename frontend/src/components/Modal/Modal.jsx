import React from "react";
import { RxCross2 } from "react-icons/rx";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/75 p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-line bg-panel p-6 shadow-card">
        <button
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-zinc-400 hover:bg-void hover:text-zinc-100"
          onClick={onClose}
          aria-label="Close"
        >
          <RxCross2 />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
