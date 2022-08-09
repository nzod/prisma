import { SourceFile } from 'ts-morph'
import { SemicolonPreference } from 'typescript'

export function formatFile(file: SourceFile) {
  file.formatText({
    indentSize: 2,
    convertTabsToSpaces: true,
    semicolons: SemicolonPreference.Remove,
    ensureNewLineAtEndOfFile: true,
  })
}
