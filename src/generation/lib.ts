import { SourceFile } from 'ts-morph'
import { SemicolonPreference } from 'typescript'
import { GeneratorInput } from '../config'

export function createFile(input: GeneratorInput, file: string) {
  return input.project.createSourceFile(
    `${input.prisma.outputPath}/${file}`,
    {},
    { overwrite: true }
  )
}

export function formatFile(file: SourceFile) {
  file.formatText({
    indentSize: 2,
    convertTabsToSpaces: true,
    semicolons: SemicolonPreference.Remove,
    ensureNewLineAtEndOfFile: true,
  })
}
