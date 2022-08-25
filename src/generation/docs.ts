enum Directive {
  Start = '@z.',
  Append = '@z&.',
}

const SLICE_OFFSETS: Record<Directive, number> = {
  [Directive.Start]: 1,
  [Directive.Append]: 3,
}

function hasDirectives(line: string, directives = Object.values(Directive)) {
  return directives.some((directive) => {
    return line.trim().startsWith(directive)
  })
}

function hasNoDirectives(line: string, directives?: Directive[]) {
  return !hasDirectives(line, directives)
}

function extractDirectiveValue(lines: string[], directive: Directive) {
  for (const line of lines) {
    if (hasNoDirectives(line, [directive])) continue
    return line.trim().slice(SLICE_OFFSETS[directive])
  }

  return null
}

export function findJSDocs(documentation: string | undefined) {
  if (!documentation) return []

  const jsDocs: string[] = []

  const lines = documentation
    .split('\n')
    .filter((line) => hasNoDirectives(line))

  if (lines.length > 0) {
    jsDocs.push('/**')
    for (const line of lines) jsDocs.push(` * ${line}`)
    jsDocs.push(' */')
  }

  return jsDocs
}

export function findCustomSchema(
  documentation: string | undefined
): string | null {
  if (!documentation) return null
  const lines = documentation.split('\n')
  return extractDirectiveValue(lines, Directive.Start)
}

export function findSchemaAppends(
  documentation: string | undefined
): string | null {
  if (!documentation) return null

  const appends: string[] = []

  for (const line of documentation.split('\n')) {
    const append = extractDirectiveValue([line], Directive.Append)
    if (append) appends.push(append)
  }

  if (appends.length === 0) {
    return null
  }

  return appends.join('')
}
