"use client";

import { ChangeEvent, CSSProperties, MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import {
  ALL_COMPETENCY_CODES,
  DATA,
  EvidenceStatus,
  FOCUS,
  LayoutKey,
  THEMES,
  THEME_ORDER,
  ThemeKey
} from "@/lib/portfolio-data";

const STORE_KEY = "psp:v2";
const STATUS_ORDER: EvidenceStatus[] = ["pending", "progress", "done"];

type PortfolioState = {
  statuses: Record<string, EvidenceStatus>;
  notes: Record<string, string>;
  name: string;
  date: string;
  layout: LayoutKey;
  theme: ThemeKey;
};

type StatusMeta = {
  label: string;
  fill: string;
  bg: string;
  ink: string;
  cell: string;
};

type CssVars = CSSProperties & Record<`--${string}`, string>;

const STATUS_META: Record<EvidenceStatus, StatusMeta> = {
  done: {
    label: "Done",
    fill: "var(--done)",
    bg: "var(--doneBg)",
    ink: "var(--doneInk)",
    cell: "var(--done)"
  },
  progress: {
    label: "In progress",
    fill: "var(--prog)",
    bg: "var(--progBg)",
    ink: "var(--progInk)",
    cell: "var(--prog)"
  },
  pending: {
    label: "Pending",
    fill: "var(--pendDot)",
    bg: "var(--pendBg)",
    ink: "var(--pendInk)",
    cell: "var(--pendCell)"
  }
};

const initialState = (): PortfolioState => ({
  statuses: {},
  notes: {},
  name: "",
  date: new Date().toISOString().slice(0, 10),
  layout: "A",
  theme: "slate"
});

const isStatus = (value: unknown): value is EvidenceStatus =>
  value === "pending" || value === "progress" || value === "done";

const cleanStatuses = (statuses: unknown): Record<string, EvidenceStatus> => {
  if (!statuses || typeof statuses !== "object") return {};
  return Object.entries(statuses as Record<string, unknown>).reduce<Record<string, EvidenceStatus>>((acc, [key, value]) => {
    if (isStatus(value)) acc[key] = value;
    return acc;
  }, {});
};

const cleanNotes = (notes: unknown): Record<string, string> => {
  if (!notes || typeof notes !== "object") return {};
  return Object.entries(notes as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === "string") acc[key] = value;
    return acc;
  }, {});
};

const percent = (part: number, total: number) => (total ? `${(part / total) * 100}%` : "0%");
const ringDash = (pct: number, radius: number) => {
  const circumference = 2 * Math.PI * radius;
  return `${((pct / 100) * circumference).toFixed(1)} ${circumference.toFixed(1)}`;
};

const statusKey = (code: string, index: number) => `${code}#${index}`;

export function PortfolioApp() {
  const [portfolio, setPortfolio] = useState<PortfolioState>(() => initialState());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [filterOutstanding, setFilterOutstanding] = useState(false);
  const [focusFilter, setFocusFilter] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PortfolioState>;
        setPortfolio((current) => ({
          statuses: cleanStatuses(parsed.statuses),
          notes: cleanNotes(parsed.notes),
          name: typeof parsed.name === "string" ? parsed.name : "",
          date: typeof parsed.date === "string" ? parsed.date : current.date,
          layout: parsed.layout === "B" || parsed.layout === "C" ? parsed.layout : "A",
          theme: parsed.theme && parsed.theme in THEMES ? (parsed.theme as ThemeKey) : "slate"
        }));
      }
    } catch {
      // Ignore unreadable legacy data and start from a clean portfolio.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        statuses: portfolio.statuses,
        notes: portfolio.notes,
        name: portfolio.name,
        date: portfolio.date,
        layout: portfolio.layout,
        theme: portfolio.theme
      })
    );
  }, [hydrated, portfolio]);

  const derived = useMemo(() => {
    const reqByCode: Record<string, number> = {};
    DATA.forEach((unit) => unit.comps.forEach((comp) => (reqByCode[comp.code] = comp.req)));

    const focusByCode: Record<string, string> = {};
    FOCUS.forEach((focus) => focus.codes.forEach((code) => (focusByCode[code] = focus.name)));
    const activeFocus = FOCUS.find((focus) => focus.id === focusFilter) ?? null;
    const focusCodes = activeFocus ? new Set(activeFocus.codes) : null;

    const stOf = (key: string) => portfolio.statuses[key] ?? "pending";
    let total = 0;
    let done = 0;
    let prog = 0;
    let pend = 0;

    DATA.forEach((unit) => {
      unit.comps.forEach((comp) => {
        for (let i = 0; i < comp.req; i += 1) {
          total += 1;
          const status = stOf(statusKey(comp.code, i));
          if (status === "done") done += 1;
          else if (status === "progress") prog += 1;
          else pend += 1;
        }
      });
    });

    const pct = total ? Math.round((done / total) * 100) : 0;

    const unitNav = DATA.map((unit) => {
      let uTot = 0;
      let uDone = 0;
      let uProg = 0;
      unit.comps.forEach((comp) => {
        for (let i = 0; i < comp.req; i += 1) {
          uTot += 1;
          const status = stOf(statusKey(comp.code, i));
          if (status === "done") uDone += 1;
          if (status === "progress") uProg += 1;
        }
      });

      return {
        num: unit.num,
        name: unit.name,
        href: `#unit-${unit.num}`,
        countLabel: `${uDone}/${uTot}`,
        donePctW: percent(uDone, uTot),
        progPctW: percent(uProg, uTot)
      };
    });

    const units = DATA.map((unit) => {
      let uTot = 0;
      let uDone = 0;
      let uProg = 0;
      const comps = unit.comps.map((comp) => {
        let compDone = 0;
        let compProg = 0;
        const slots = Array.from({ length: comp.req }, (_, index) => {
          const key = statusKey(comp.code, index);
          const status = stOf(key);
          if (status === "done") {
            compDone += 1;
            uDone += 1;
          } else if (status === "progress") {
            compProg += 1;
            uProg += 1;
          }
          uTot += 1;
          return { index, key, status, label: STATUS_META[status].label };
        });

        const aggregate: EvidenceStatus =
          compDone === comp.req ? "done" : compDone > 0 || compProg > 0 ? "progress" : "pending";

        return {
          ...comp,
          slots,
          compDone,
          aggregate,
          focusName: focusByCode[comp.code] ?? "",
          expanded: !!expanded[comp.code],
          notes: portfolio.notes[comp.code] ?? ""
        };
      });

      let visibleComps = comps;
      if (focusCodes) visibleComps = visibleComps.filter((comp) => focusCodes.has(comp.code));
      if (filterOutstanding) visibleComps = visibleComps.filter((comp) => comp.aggregate !== "done");

      const withGroups = visibleComps.map((comp, index, all) => ({
        ...comp,
        groupHeader: comp.group && (index === 0 || all[index - 1]?.group !== comp.group) ? comp.group : ""
      }));

      return {
        num: unit.num,
        name: unit.name,
        anchor: `unit-${unit.num}`,
        comps: withGroups,
        countLabel: `${uDone} / ${uTot}`,
        donePctW: percent(uDone, uTot),
        progPctW: percent(uProg, uTot),
        empty: (focusCodes || filterOutstanding) && withGroups.length === 0
      };
    }).filter((unit) => !unit.empty);

    const heat = DATA.map((unit) => ({
      num: unit.num,
      cells: unit.comps.flatMap((comp) =>
        Array.from({ length: comp.req }, (_, index) => {
          const key = statusKey(comp.code, index);
          const status = stOf(key);
          return {
            key,
            code: comp.code,
            index,
            req: comp.req,
            status,
            label: STATUS_META[status].label
          };
        })
      )
    }));

    let focusDone = 0;
    const focusAreas = FOCUS.map((focus) => {
      let focusTotal = 0;
      let focusDoneSlots = 0;
      let focusActiveSlots = 0;

      focus.codes.forEach((code) => {
        const req = reqByCode[code] ?? 0;
        for (let i = 0; i < req; i += 1) {
          focusTotal += 1;
          const status = stOf(statusKey(code, i));
          if (status === "done") focusDoneSlots += 1;
          if (status === "done" || status === "progress") focusActiveSlots += 1;
        }
      });

      const status: EvidenceStatus =
        focusTotal > 0 && focusDoneSlots === focusTotal ? "done" : focusActiveSlots > 0 ? "progress" : "pending";
      if (status === "done") focusDone += 1;

      return {
        ...focus,
        status,
        active: focus.id === focusFilter,
        statusLabel: status === "done" ? "Complete" : status === "progress" ? "In progress" : "Not started"
      };
    });

    return {
      activeFocus,
      done,
      prog,
      pend,
      total,
      remaining: total - done,
      pct,
      doneW: percent(done, total),
      progW: percent(prog, total),
      pendW: percent(pend, total),
      ringDash: ringDash(pct, 52),
      ringDashSm: ringDash(pct, 44),
      heat,
      focusAreas,
      focusDone,
      units,
      unitNav
    };
  }, [expanded, filterOutstanding, focusFilter, portfolio.notes, portfolio.statuses]);

  const theme = THEMES[portfolio.theme] ?? THEMES.slate;
  const themeVars = Object.fromEntries(Object.entries(theme.vars).map(([key, value]) => [`--${key}`, value])) as CssVars;

  const setField = <K extends keyof PortfolioState>(key: K, value: PortfolioState[K]) => {
    setPortfolio((current) => ({ ...current, [key]: value }));
  };

  const setNote = (code: string, body: string) => {
    setPortfolio((current) => ({ ...current, notes: { ...current.notes, [code]: body } }));
  };

  const cycleStatus = (key: string) => {
    setPortfolio((current) => {
      const currentStatus = current.statuses[key] ?? "pending";
      const nextStatus = STATUS_ORDER[(STATUS_ORDER.indexOf(currentStatus) + 1) % STATUS_ORDER.length];
      return { ...current, statuses: { ...current.statuses, [key]: nextStatus } };
    });
  };

  const expandAll = () => {
    setExpanded(Object.fromEntries(ALL_COMPETENCY_CODES.map((code) => [code, true])));
  };

  const collapseAll = () => setExpanded({});

  const exportData = () => {
    const data = {
      statuses: portfolio.statuses,
      notes: portfolio.notes,
      name: portfolio.name,
      date: portfolio.date,
      version: 2
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student_portfolio.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importData = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        setPortfolio((current) => ({
          ...current,
          statuses: cleanStatuses(parsed.statuses),
          notes: cleanNotes(parsed.notes),
          name: typeof parsed.name === "string" ? parsed.name : "",
          date: typeof parsed.date === "string" ? parsed.date : current.date
        }));
      } catch {
        window.alert("Could not read that file — please choose a portfolio export (.json).");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="approot" style={themeVars}>
      <TopControls
        layout={portfolio.layout}
        themeKey={portfolio.theme}
        onLayout={(layout) => setField("layout", layout)}
        onTheme={(nextTheme) => setField("theme", nextTheme)}
        onExport={exportData}
        onImport={importData}
        onPrint={() => window.print()}
        fileInputRef={fileInputRef}
      />

      {portfolio.layout === "A" && (
        <CommandOverview
          portfolio={portfolio}
          derived={derived}
          onName={(name) => setField("name", name)}
          onDate={(date) => setField("date", date)}
          onCycle={cycleStatus}
        />
      )}

      {portfolio.layout === "B" && (
        <AnalyticsOverview
          portfolio={portfolio}
          derived={derived}
          onName={(name) => setField("name", name)}
          onDate={(date) => setField("date", date)}
        />
      )}

      <div className="content-shell maxw">
        {portfolio.layout === "C" && (
          <SidebarOverview
            portfolio={portfolio}
            derived={derived}
            onName={(name) => setField("name", name)}
            onDate={(date) => setField("date", date)}
          />
        )}

        <main className="competency-main">
          <div className="toolbar no-print">
            <button
              className={`tool-btn ${filterOutstanding ? "active" : ""}`}
              type="button"
              aria-pressed={filterOutstanding}
              onClick={() => setFilterOutstanding((current) => !current)}
            >
              Outstanding only
            </button>
            <button className="tool-btn" type="button" onClick={expandAll}>
              Expand notes
            </button>
            <button className="tool-btn" type="button" onClick={collapseAll}>
              Collapse all
            </button>
            <span className="toolbar-hint">Click a marker to cycle: Pending → In progress → Done</span>
          </div>

          {derived.units.map((unit) => (
            <section className="unit-card" id={unit.anchor} key={unit.num}>
              <div className="unit-head">
                <div className="unit-badge">{unit.num}</div>
                <div className="unit-title-block">
                  <h2>{unit.name}</h2>
                  <div className="unit-progress-row">
                    <StackedBar doneW={unit.donePctW} progW={unit.progPctW} />
                    <span className="mono-count">{unit.countLabel}</span>
                  </div>
                </div>
              </div>

              <div className="competency-list">
                {unit.comps.map((comp) => {
                  const meta = STATUS_META[comp.aggregate];
                  return (
                    <div className="competency-wrap" key={comp.code}>
                      {comp.groupHeader && (
                        <div className="group-divider">
                          <span>{comp.groupHeader}</span>
                          <i />
                        </div>
                      )}
                      <article className="competency-row">
                        <div className="competency-top">
                          <div className="competency-copy">
                            <span className="comp-code">{comp.code}</span>
                            <div className="comp-text">
                              <span>{comp.title}</span>
                              {comp.focusName && <span className="focus-tag">{comp.focusName}</span>}
                            </div>
                          </div>
                          <span className="print-only print-badge" style={{ background: meta.bg, color: meta.ink }}>
                            {comp.compDone} / {comp.req} done
                          </span>
                          <div className="evidence-controls no-print">
                            <span className="evidence-label">Evidence</span>
                            <div className="markers">
                              {comp.slots.map((slot) => (
                                <button
                                  type="button"
                                  key={slot.key}
                                  className={`marker ${slot.status}`}
                                  aria-pressed={slot.status === "done"}
                                  aria-label={`${comp.code} evidence ${slot.index + 1} of ${comp.req} — ${slot.label}`}
                                  title={`${comp.code} · evidence ${slot.index + 1} of ${comp.req} — ${slot.label}`}
                                  onClick={() => cycleStatus(slot.key)}
                                >
                                  {slot.index + 1}
                                </button>
                              ))}
                            </div>
                            <span className={`tally ${comp.compDone === comp.req ? "complete" : ""}`}>
                              {comp.compDone} / {comp.req}
                            </span>
                            <button
                              type="button"
                              className={`note-toggle ${comp.expanded ? "open" : ""}`}
                              title="Toggle notes"
                              aria-label={`Toggle notes for ${comp.code}`}
                              aria-pressed={comp.expanded}
                              onClick={() => setExpanded((current) => ({ ...current, [comp.code]: !current[comp.code] }))}
                            >
                              ✎
                            </button>
                          </div>
                        </div>
                        {comp.expanded && (
                          <textarea
                            value={comp.notes}
                            onChange={(event) => setNote(comp.code, event.target.value)}
                            placeholder="Evidence, reflections, assessor notes…"
                            aria-label={`Notes for ${comp.code}`}
                          />
                        )}
                      </article>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </main>

        <FocusRail
          activeFocus={derived.activeFocus}
          focusAreas={derived.focusAreas}
          focusDone={derived.focusDone}
          onFocus={(id) => setFocusFilter((current) => (current === id ? null : id))}
          onClear={() => setFocusFilter(null)}
        />
      </div>
    </div>
  );
}

function TopControls({
  layout,
  themeKey,
  onLayout,
  onTheme,
  onExport,
  onImport,
  onPrint,
  fileInputRef
}: {
  layout: LayoutKey;
  themeKey: ThemeKey;
  onLayout: (layout: LayoutKey) => void;
  onTheme: (theme: ThemeKey) => void;
  onExport: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onPrint: () => void;
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="topbar no-print maxw">
      <div className="control-group">
        <span className="control-label">View</span>
        <div className="segmented" role="group" aria-label="View">
          {[
            ["A", "Command"],
            ["B", "Analytics"],
            ["C", "Sidebar"]
          ].map(([key, label]) => (
            <button
              key={key}
              className={layout === key ? "selected" : ""}
              type="button"
              onClick={() => onLayout(key as LayoutKey)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <span className="control-label">Theme</span>
        <div className="swatches" role="group" aria-label="Theme">
          {THEME_ORDER.map((key) => {
            const theme = THEMES[key];
            return (
              <button
                type="button"
                key={key}
                title={theme.name}
                aria-label={theme.name}
                aria-pressed={themeKey === key}
                className={`swatch ${themeKey === key ? "selected" : ""}`}
                onClick={() => onTheme(key)}
              >
                <span style={{ background: theme.vars.accent }} />
                <span style={{ background: theme.vars.done }} />
                <span style={{ background: theme.vars.prog }} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="actions">
        <button className="action-btn" type="button" onClick={onExport}>
          Export
        </button>
        <label className="action-btn import-control">
          Import
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={onImport} />
        </label>
        <button className="action-btn primary" type="button" onClick={onPrint}>
          Print
        </button>
      </div>
    </div>
  );
}

function CommandOverview({
  portfolio,
  derived,
  onName,
  onDate,
  onCycle
}: {
  portfolio: PortfolioState;
  derived: ReturnType<typeof usePortfolioDerivedShape>;
  onName: (name: string) => void;
  onDate: (date: string) => void;
  onCycle: (key: string) => void;
}) {
  return (
    <div className="maxw overview overview-command">
      <section className="summary-card fx">
        <div className="summary-flex">
          <div className="summary-copy">
            <TitleBlock />
            <StudentFields portfolio={portfolio} onName={onName} onDate={onDate} />
          </div>
          <div className="summary-metrics">
            <CompletionRing pct={derived.pct} dash={derived.ringDash} size="large" />
            <CountsStack derived={derived} />
          </div>
        </div>
        <StackedBar doneW={derived.doneW} progW={derived.progW} size="large" />
      </section>

      <section className="evidence-map no-print fx fx2">
        <div className="map-head">
          <h2>Evidence map</h2>
          <div className="legend">
            <LegendItem className="done-bg" label="Done" />
            <LegendItem className="prog-bg" label="In progress" />
            <LegendItem className="pend-bg" label="Pending" />
          </div>
        </div>
        <div className="heat-groups">
          {derived.heat.map((group) => (
            <div className="heat-group" key={group.num}>
              <span>Unit {group.num}</span>
              <div className="heat-grid">
                {group.cells.map((cell) => (
                  <button
                    type="button"
                    key={cell.key}
                    className={`heat-cell ${cell.status}`}
                    title={`${cell.code} · evidence ${cell.index + 1}/${cell.req} — ${cell.label}`}
                    aria-label={`${cell.code} evidence ${cell.index + 1} of ${cell.req} — ${cell.label}`}
                    onClick={() => onCycle(cell.key)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <p>Tip — each square is one required evidence. Click to cycle its status.</p>
      </section>
    </div>
  );
}

function AnalyticsOverview({
  portfolio,
  derived,
  onName,
  onDate
}: {
  portfolio: PortfolioState;
  derived: ReturnType<typeof usePortfolioDerivedShape>;
  onName: (name: string) => void;
  onDate: (date: string) => void;
}) {
  return (
    <div className="maxw overview analytics-overview">
      <div className="analytics-title">
        <TitleBlock />
        <div className="inline-fields">
          <input value={portfolio.name} onChange={(event) => onName(event.target.value)} placeholder="Student name" />
          <input type="date" value={portfolio.date} onChange={(event) => onDate(event.target.value)} />
        </div>
      </div>
      <div className="kpi-row">
        <article className="kpi-card completion">
          <CompletionRing pct={derived.pct} dash={derived.ringDashSm} size="small" />
          <div>
            <h2>Overall completion</h2>
            <p>{derived.done} of {derived.total} evidences done</p>
            <span>{derived.remaining} remaining</span>
          </div>
        </article>
        <KpiCard label="Done" value={derived.done} width={derived.doneW} status="done" />
        <KpiCard label="In progress" value={derived.prog} width={derived.progW} status="progress" />
        <KpiCard label="Pending" value={derived.pend} width={derived.pendW} status="pending" />
      </div>
      <section className="unit-progress-card">
        <h2>Unit progress</h2>
        {derived.unitNav.map((unit) => (
          <a href={unit.href} key={unit.num} className="unit-progress-link">
            <span className="mini-badge">{unit.num}</span>
            <span className="unit-progress-name">{unit.name}</span>
            <StackedBar doneW={unit.donePctW} progW={unit.progPctW} size="mini" />
            <span className="mono-count">{unit.countLabel}</span>
          </a>
        ))}
      </section>
    </div>
  );
}

function SidebarOverview({
  portfolio,
  derived,
  onName,
  onDate
}: {
  portfolio: PortfolioState;
  derived: ReturnType<typeof usePortfolioDerivedShape>;
  onName: (name: string) => void;
  onDate: (date: string) => void;
}) {
  return (
    <aside className="left-sidebar no-print">
      <section className="sidebar-card">
        <div className="sidebar-title">
          <BrandMark className="sidebar-logo" />
          <h1>Student Competency Portfolio</h1>
        </div>
        <div className="sidebar-fields">
          <input value={portfolio.name} onChange={(event) => onName(event.target.value)} placeholder="Student name" />
          <input type="date" value={portfolio.date} onChange={(event) => onDate(event.target.value)} />
        </div>
        <CompletionRing pct={derived.pct} dash={derived.ringDash} size="medium" />
        <div className="sidebar-counts">
          <CompactCount value={derived.done} label="Done" className="done-text" />
          <CompactCount value={derived.prog} label="Prog" className="prog-text" />
          <CompactCount value={derived.pend} label="Pend" className="pend-text" />
        </div>
        <StackedBar doneW={derived.doneW} progW={derived.progW} size="sidebar" />
        <div className="units-label">Units</div>
        <div className="sidebar-units">
          {derived.unitNav.map((unit) => (
            <a href={unit.href} key={unit.num}>
              <span className="sidebar-unit-num">{unit.num}</span>
              <span className="sidebar-unit-name">{unit.name}</span>
              <StackedBar doneW={unit.donePctW} progW={unit.progPctW} size="tiny" />
            </a>
          ))}
        </div>
      </section>
    </aside>
  );
}

function FocusRail({
  activeFocus,
  focusAreas,
  focusDone,
  onFocus,
  onClear
}: {
  activeFocus: { id: number; name: string; codes: string[] } | null;
  focusAreas: Array<{ id: number; name: string; status: EvidenceStatus; active: boolean; statusLabel: string }>;
  focusDone: number;
  onFocus: (id: number) => void;
  onClear: () => void;
}) {
  return (
    <aside className="focus-rail no-print fx fx3">
      <section className="focus-card">
        <div className="focus-head">
          <span>Focus areas</span>
          <strong>{focusDone}/{FOCUS.length}</strong>
        </div>
        <p>Complete when all linked evidences are signed off.</p>
        {activeFocus && (
          <button type="button" className="clear-focus" onClick={onClear}>
            Clear “{activeFocus.name}” ✕
          </button>
        )}
        <div className="focus-list">
          {focusAreas.map((focus) => (
            <button
              type="button"
              className={`frow ${focus.active ? "active" : ""}`}
              key={focus.id}
              title={focus.statusLabel}
              aria-pressed={focus.active}
              onClick={() => onFocus(focus.id)}
            >
              <span className={`focus-dot ${focus.status}`} />
              <span>{focus.name}</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

function TitleBlock() {
  return (
    <div className="title-block">
      <BrandMark />
      <div>
        <h1>Student Competency Portfolio</h1>
        <p>PC Degree Apprenticeship · 15 Units</p>
      </div>
    </div>
  );
}

function StudentFields({
  portfolio,
  onName,
  onDate
}: {
  portfolio: PortfolioState;
  onName: (name: string) => void;
  onDate: (date: string) => void;
}) {
  return (
    <div className="student-fields">
      <label>
        <span>Student</span>
        <input value={portfolio.name} onChange={(event) => onName(event.target.value)} placeholder="Add name" />
      </label>
      <label>
        <span>Date</span>
        <input type="date" value={portfolio.date} onChange={(event) => onDate(event.target.value)} />
      </label>
    </div>
  );
}

function CompletionRing({ pct, dash, size }: { pct: number; dash: string; size: "large" | "medium" | "small" }) {
  const dimensions = size === "small" ? { box: 104, view: 104, center: 52, radius: 44, width: 11, circ: "276.5" } : { box: size === "medium" ? 120 : 124, view: 124, center: 62, radius: 52, width: 12, circ: "326.7" };

  return (
    <div className={`ring ring-${size}`}>
      <svg width={dimensions.box} height={dimensions.box} viewBox={`0 0 ${dimensions.view} ${dimensions.view}`} aria-hidden="true">
        <circle cx={dimensions.center} cy={dimensions.center} r={dimensions.radius} fill="none" strokeWidth={dimensions.width} className="ring-track" />
        <circle
          cx={dimensions.center}
          cy={dimensions.center}
          r={dimensions.radius}
          fill="none"
          strokeWidth={dimensions.width}
          strokeLinecap="round"
          strokeDasharray={dash}
          className="ring-progress"
          style={{ "--circ": dimensions.circ } as CssVars}
        />
      </svg>
      <div className="ring-label">
        <div>{pct}<span>%</span></div>
        {size !== "small" && <p>Complete</p>}
      </div>
    </div>
  );
}

function CountsStack({ derived }: { derived: ReturnType<typeof usePortfolioDerivedShape> }) {
  return (
    <div className="counts-stack">
      <CountLine status="done" value={derived.done} label="Done" />
      <CountLine status="progress" value={derived.prog} label="In progress" />
      <CountLine status="pending" value={derived.pend} label="Pending" />
      <div className="remaining-line">{derived.remaining} of {derived.total} evidences left</div>
    </div>
  );
}

function CountLine({ status, value, label }: { status: EvidenceStatus; value: number; label: string }) {
  return (
    <div className="count-line">
      <span className={`count-dot ${status}`} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function CompactCount({ value, label, className }: { value: number; label: string; className: string }) {
  return (
    <div>
      <strong className={className}>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function KpiCard({ label, value, width, status }: { label: string; value: number; width: string; status: EvidenceStatus }) {
  return (
    <article className="kpi-card">
      <div className="kpi-label">
        <span className={`count-dot ${status}`} />
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      <div className="mini-bar">
        <span className={status} style={{ width }} />
      </div>
    </article>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span>
      <i className={className} />
      {label}
    </span>
  );
}

function StackedBar({ doneW, progW, size = "default" }: { doneW: string; progW: string; size?: "default" | "large" | "mini" | "sidebar" | "tiny" }) {
  return (
    <div className={`stacked-bar ${size}`}>
      <span className="done" style={{ width: doneW }} />
      <span className="progress" style={{ width: progW }} />
    </div>
  );
}

function usePortfolioDerivedShape() {
  return {
    activeFocus: null as { id: number; name: string; codes: string[] } | null,
    done: 0,
    prog: 0,
    pend: 0,
    total: 0,
    remaining: 0,
    pct: 0,
    doneW: "0%",
    progW: "0%",
    pendW: "0%",
    ringDash: "",
    ringDashSm: "",
    heat: [] as Array<{
      num: number;
      cells: Array<{ key: string; code: string; index: number; req: number; status: EvidenceStatus; label: string }>;
    }>,
    focusAreas: [] as Array<{ id: number; name: string; status: EvidenceStatus; active: boolean; statusLabel: string }>,
    focusDone: 0,
    units: [] as Array<{
      num: number;
      name: string;
      anchor: string;
      comps: Array<{
        code: string;
        req: number;
        title: string;
        group?: string;
        slots: Array<{ index: number; key: string; status: EvidenceStatus; label: string }>;
        compDone: number;
        aggregate: EvidenceStatus;
        focusName: string;
        expanded: boolean;
        notes: string;
        groupHeader?: string;
      }>;
      countLabel: string;
      donePctW: string;
      progPctW: string;
      empty: boolean;
    }>,
    unitNav: [] as Array<{ num: number; name: string; href: string; countLabel: string; donePctW: string; progPctW: string }>
  };
}
