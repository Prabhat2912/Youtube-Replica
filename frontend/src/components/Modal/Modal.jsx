import React from "react";
import { RxCross2 } from "react-icons/rx";
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="absolute bg-white rounded-lg shadow-lg p-5">
        <button
          className="absolute top-0 right-0 bg-none border-none cursor-pointer p-2"
          onClick={onClose}
        >
          <RxCross2 />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
