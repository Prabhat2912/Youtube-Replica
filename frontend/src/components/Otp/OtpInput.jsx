import React, { useEffect, useRef } from "react";

const LEN = 6;

// Six-box ticket input: auto-advance, backspace rewind, whole-code paste,
// arrow navigation. All boxes share one value string owned by the parent.
const OtpInput = ({ value, onChange, disabled, error }) => {
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setAt = (i, ch) => {
    const next = value.split("");
    while (next.length < LEN) next.push("");
    next[i] = ch;
    onChange(next.join("").slice(0, LEN));
  };

  const handleChange = (i, e) => {
    const ch = e.target.value.replace(/\D/g, "").slice(-1);
    if (!ch) {
      setAt(i, "");
      return;
    }
    setAt(i, ch);
    if (i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
      setAt(i - 1, "");
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
    if (!digits) return;
    onChange(digits);
    refs.current[Math.min(digits.length, LEN - 1)]?.focus();
  };

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
        {Array.from({ length: LEN }).map((_, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            className={`otp-box h-12 w-11 rounded-xl border bg-void text-center text-lg font-black text-lime outline-none transition sm:h-[52px] sm:w-12 ${
              error
                ? "border-blaze focus:border-blaze-hot focus:ring-2 focus:ring-blaze/20"
                : "border-line focus:border-lime/60 focus:ring-2 focus:ring-lime/15"
            }`}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            value={value[i] || ""}
            disabled={disabled}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKey(i, e)}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {value.length} of {LEN} digits entered
      </p>
    </div>
  );
};

export default OtpInput;
