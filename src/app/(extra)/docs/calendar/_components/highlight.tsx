import type { ReactNode } from "react"

/**
 * Tiny dependency-free syntax highlighter for the docs samples (JS, shell, JSON).
 * Not a real parser — it only needs to colour strings, comments, keywords, numbers and calls.
 */
export type Lang = "js" | "sh" | "json" | "text"

const TOKEN_CLASS = {
  comment: "text-zinc-500 italic",
  string: "text-emerald-300",
  prop: "text-sky-300",
  keyword: "text-pink-400",
  number: "text-amber-300",
  fn: "text-violet-300",
  flag: "text-amber-300",
  cmd: "text-pink-400",
} as const

type Kind = keyof typeof TOKEN_CLASS

const STR = `"(?:\\\\.|[^"\\\\\\n])*"|'(?:\\\\.|[^'\\\\\\n])*'`

const PATTERNS: Record<Exclude<Lang, "text">, { re: RegExp; kinds: Kind[] }> = {
  js: {
    re: new RegExp(
      `(\\/\\/[^\\n]*)|(${STR})|(\\b(?:const|let|var|await|async|function|return|new|throw|if|else|of|in|true|false|null|undefined)\\b)|(\\b\\d+(?:\\.\\d+)?\\b)|(\\b[A-Za-z_$][\\w$]*(?=\\())`,
      "g"
    ),
    kinds: ["comment", "string", "keyword", "number", "fn"],
  },
  json: {
    re: new RegExp(`(\\/\\/[^\\n]*)|(${STR})|(\\b(?:true|false|null)\\b)|(-?\\b\\d+(?:\\.\\d+)?\\b)`, "g"),
    kinds: ["comment", "string", "keyword", "number"],
  },
  sh: {
    re: new RegExp(`((?:^|\\s)#[^\\n]*)|(${STR})|(^curl\\b)|(\\s-{1,2}[A-Za-z][\\w-]*)`, "gm"),
    kinds: ["comment", "string", "cmd", "flag"],
  },
}

export function highlight(code: string, lang: Lang = "js"): ReactNode[] {
  if (lang === "text") return [code]
  const { re, kinds } = PATTERNS[lang]
  re.lastIndex = 0

  const out: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let i = 0

  while ((m = re.exec(code)) !== null) {
    if (m[0] === "") { re.lastIndex++; continue }
    if (m.index > last) out.push(code.slice(last, m.index))

    const group = m.slice(1).findIndex((g) => g !== undefined)
    let kind = kinds[group]
    // A string followed by ":" is an object key / JSON property.
    if (kind === "string" && /^\s*:/.test(code.slice(re.lastIndex, re.lastIndex + 8))) kind = "prop"

    out.push(
      <span key={i++} className={TOKEN_CLASS[kind]}>
        {m[0]}
      </span>
    )
    last = re.lastIndex
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}
