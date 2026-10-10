import { useState, Fragment } from "react";
import { ChevronRight, Check } from "lucide-react";
import { CUISINES, type CuisineNode } from "@/lib/cuisines";

function nodesAt(trail: string[]): CuisineNode[] {
  let list = CUISINES;
  for (const name of trail) {
    const n = list.find((x) => x.name === name);
    if (!n || !n.children) return [];
    list = n.children;
  }
  return list;
}

/** Layered cuisine drill-down (region → sub-region → local). Controlled by `path`. */
export function CuisinePicker({ path, setPath }: { path: string[]; setPath: (p: string[]) => void }) {
  const [trail, setTrail] = useState<string[]>(path.length > 1 ? path.slice(0, -1) : []);
  const options = nodesAt(trail);
  const eq = (a: string[]) => path.length > 0 && path.join("/") === a.join("/");

  const pick = (node: CuisineNode) => {
    if (node.children && node.children.length) setTrail([...trail, node.name]);
    else setPath([...trail, node.name]);
  };

  return (
    <div>
      {/* breadcrumb */}
      <div className="flex flex-wrap items-center gap-1 text-[11.5px]">
        <button onClick={() => setTrail([])} className={trail.length ? "font-semibold text-primary" : "font-semibold text-foreground"}>All</button>
        {trail.map((t, i) => (
          <Fragment key={i}>
            <ChevronRight size={11} className="text-muted-foreground" />
            <button onClick={() => setTrail(trail.slice(0, i + 1))} className="font-semibold text-foreground">{t}</button>
          </Fragment>
        ))}
      </div>

      {trail.length > 0 && (
        <button
          onClick={() => setPath([...trail])}
          className={`mt-2.5 flex w-full items-center justify-between rounded-full px-3.5 py-2 text-[12px] font-semibold ring-1 ${eq(trail) ? "bg-primary text-primary-foreground ring-primary" : "bg-accent/40 text-foreground ring-border/50"}`}
        >
          <span>Any {trail[trail.length - 1]}</span>
          {eq(trail) && <Check size={13} className="shrink-0" />}
        </button>
      )}

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {options.map((node) => {
          const hasKids = !!(node.children && node.children.length);
          const selected = eq([...trail, node.name]);
          return (
            <button
              key={node.name}
              onClick={() => pick(node)}
              className={`flex items-center justify-between gap-1 rounded-xl px-3 py-2 text-left text-[12px] font-semibold ring-1 ${selected ? "bg-primary text-primary-foreground ring-primary" : "bg-accent/40 text-foreground/85 ring-border/50"}`}
            >
              <span className="min-w-0 truncate">{node.name}</span>
              {hasKids ? <ChevronRight size={13} className="shrink-0 opacity-60" /> : selected ? <Check size={13} className="shrink-0" /> : null}
            </button>
          );
        })}
      </div>

      {path.length > 0 && (
        <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-[11.5px] font-semibold text-foreground ring-1 ring-primary/20">
          Selected: {path.join(" › ")}
        </p>
      )}
    </div>
  );
}
