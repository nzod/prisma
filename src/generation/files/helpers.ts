import { StructureKind } from 'ts-morph'
import { SharedFiles } from '../../constants'
import { useContext } from '../../context'
import { useSource } from '../lib/files'
import { Names } from '../lib/names'

export function writeHelpersSource() {
  const { config } = useContext()

  if (!config.useDecimalJs) {
    return
  }

  const source = useSource(SharedFiles.Helpers)

  source.addImportDeclarations([
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nzod/z',
      namespaceImport: 'z',
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: 'decimal.js',
      namedImports: ['Decimal'],
    },
  ])

  source.addStatements((writer) => {
    writer.write(`
    export const ${Names.DecimalSchema()} = z
      .instanceof(Decimal)
      .or(z.string())
      .or(z.number())
      .refine((value) => {
        try {
          return new Decimal(value);
        } catch (error) {
          return false;
        }
      })
      .transform((value) => new Decimal(value));
    `)
  })
}
