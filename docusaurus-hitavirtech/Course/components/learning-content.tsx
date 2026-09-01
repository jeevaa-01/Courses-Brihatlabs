import { ArrowRight, Info, Lightbulb } from "lucide-react";

export function FlowDiagram({ items, variant = "flow" }: { items: string[]; variant?: "flow" | "concept" | "pipeline" | "architecture" | "steps" | "timeline" | "decision-tree" }) {
  return <div className={`concept-diagram diagram-${variant}`} aria-label={items.join(" then ")}>{items.map((item, index) => <div key={`${item}-${index}`}><span>{item}</span>{index < items.length - 1 && <ArrowRight size={20} aria-hidden="true"/>}</div>)}</div>;
}

export const ConceptDiagram = FlowDiagram;
export const PipelineDiagram = FlowDiagram;
export const ArchitectureDiagram = FlowDiagram;
export const StepByStep = FlowDiagram;
export const Timeline = FlowDiagram;
export const DecisionTree = FlowDiagram;

export function ComparisonTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <div className="table-wrap" tabIndex={0} role="region" aria-label="Scrollable comparison table"><table><thead><tr>{headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function Callout({ title, text, tone = "info" }: { title: string; text: string; tone?: "info" | "success" | "warning" }) {
  const isTakeaway = /^key takeaway(s)?$/i.test(title.trim());
  return <aside className={`callout callout-${tone} ${isTakeaway ? "callout-takeaway" : ""}`.trim()} role="note" aria-label={title}>{isTakeaway ? <Lightbulb size={22} aria-hidden="true"/> : <Info size={22} aria-hidden="true"/>}<div><strong>{title}</strong><p>{text}</p></div></aside>;
}

export function FormulaCard({ expression, explanation }: { expression: string; explanation: string }) {
  return <figure className="formula-card"><code>{expression}</code><figcaption>{explanation}</figcaption></figure>;
}
