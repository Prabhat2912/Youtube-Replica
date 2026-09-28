import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Password input with a peek button. `!pr-11` reserves room for the eye
// regardless of the padding the caller passes.
const PasswordField = ({ className = "", ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative block">
      <input
        type={show ? "text" : "password"}
        className={`${className} !pr-11`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-100"
      >
        {show ? <FiEyeOff size={17} /> : <FiEye size={17} />}
      </button>
    </span>
  );
};

export default PasswordField;
