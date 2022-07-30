import { GeneratorInput } from '../../config'
import { createFile, formatFile } from '../lib'

export function generateEntryFile(input: GeneratorInput) {
  const { models } = input.options.dmmf.datamodel

  const file = createFile(input, 'index.ts')

  for (const model of models) {
    file.addExportDeclaration({
      moduleSpecifier: `./${model.name.toLowerCase()}`,
    })
  }

  formatFile(file)
}
