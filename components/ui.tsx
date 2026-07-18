"use client";
import ReactMarkdown from "react-markdown";

export function Md({ texto, className = "" }: { texto: string; className?: string }) {
  return (
    <div className={`markdown text-[15px] leading-relaxed ${className}`}>
      <ReactMarkdown>{texto}</ReactMarkdown>
    </div>
  );
}

export function PromptBloco({ texto, rotulo }: { texto: string; rotulo?: string }) {
  return (
    <div>
      {rotulo && <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-tinta/60">{rotulo}</div>}
      <pre className="whitespace-pre-wrap break-words rounded-lg bg-tinta p-3 font-mono text-[13px] leading-relaxed text-papel">
        {texto}
      </pre>
    </div>
  );
}

export function PainelSaida({ texto, titulo = "Saída esperada" }: { texto: string; titulo?: string }) {
  return (
    <div className="rounded-lg border border-tinta/15 bg-white p-3">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-acento">{titulo}</div>
      <div className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-tinta/90">{texto}</div>
    </div>
  );
}

export function BotaoVerificar({
  disabled,
  onClick,
  children = "Verificar",
}: {
  disabled?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-4 w-full rounded-xl bg-acento py-3 font-semibold text-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// Embaralhamento determinístico (mesma semente, mesma ordem) para evitar
// divergência entre a renderização no servidor e a hidratação no cliente.
export function embaralhar<T>(itens: T[], semente: string): T[] {
  let h = 2166136261;
  for (const c of semente) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const arr = [...itens];
  for (let i = arr.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h ^= h >>> 13;
    const j = (h >>> 0) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
