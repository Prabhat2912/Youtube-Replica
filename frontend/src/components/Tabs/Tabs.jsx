import React, { useLayoutEffect, useRef, useState } from "react";

// Segmented tabs with a sliding active pill. The indicator measures the
// active button and glides between tabs — no layout jumps.
const Tabs = ({ tabs, active, onChange }) => {
  const bar = useRef(null);
  const btns = useRef({});
  const [geom, setGeom] = useState({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const measure = () => {
      const el = btns.current[active];
      const parent = bar.current;
      if (!el || !parent) return;
      const pb = parent.getBoundingClientRect();
      const bb = el.getBoundingClientRect();
      setGeom({ left: bb.left - pb.left, width: bb.width, ready: true });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, tabs]);

  return (
    <div
      ref={bar}
      role="tablist"
      aria-label="Sections"
      className="relative inline-flex gap-1 rounded-full border border-line bg-panel p-1"
    >
      <span
        aria-hidden="true"
        className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-ember transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: geom.left,
          width: geom.width,
          opacity: geom.ready ? 1 : 0,
        }}
      />
      {tabs.map(([id, label]) => (
        <button
          key={id}
          ref={(el) => (btns.current[id] = el)}
          role="tab"
          aria-selected={active === id}
          onClick={() => onChange(id)}
          className={`relative z-10 h-10 rounded-full px-5 text-sm font-bold transition-colors duration-300 ${
            active === id ? "text-white" : "text-zinc-400 hover:text-zinc-100"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
