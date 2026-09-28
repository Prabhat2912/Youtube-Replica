//Fails the build if any file calls a React hook it didn't import.
//(Bundlers don't catch this — it explodes at runtime instead.)
const fs = require("fs");
const path = require("path");

const HOOKS = [
  "useState",
  "useEffect",
  "useLayoutEffect",
  "useRef",
  "useCallback",
  "useMemo",
  "useContext",
  "useReducer",
];

let bad = 0;

function check(p) {
  const src = fs.readFileSync(p, "utf8");
  const imported = new Set();
  for (const line of src.split("\n")) {
    const m = line.match(/import\s+.*\{([^}]*)\}\s+from\s+['"]react['"]/);
    if (m) m[1].split(",").forEach((x) => imported.add(x.trim()));
    if (/import\s+React\b/.test(line)) imported.add("React");
  }
  const body = src.replace(/import[^;]+;/g, "");
  for (const h of HOOKS) {
    if (new RegExp(`\\b${h}\\s*[(<]`).test(body) && !imported.has(h)) {
      console.error(`MISSING ${h} in ${path.relative("src", p)}`);
      bad++;
    }
  }
}

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "dist") continue;
      walk(p);
    } else if (/\.(jsx|js)$/.test(p) && !p.includes(`${path.sep}Redux${path.sep}`)) {
      check(p);
    }
  }
}

walk(path.join(__dirname, "..", "src"));
if (bad) {
  console.error(`check-hooks: ${bad} missing import(s)`);
  process.exit(1);
}
console.log("check-hooks: all clean");
