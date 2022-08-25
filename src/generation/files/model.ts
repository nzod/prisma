import * as path from 'path'
import { DMMF } from '@prisma/generator-helper'
import {
  ImportDeclarationStructure,
  SourceFile,
  StructureKind,
  VariableDeclarationKind,
} from 'ts-morph'
import { SharedFiles } from '../../constants'
import { useContext } from '../../context'
import { findJSDocs } from '../docs'
import { getImportPath, useSource } from '../lib/files'
import { Names } from '../lib/names'
import { prismaToZod } from '../lib/prisma-to-zod'

export function writeModelSource(model: DMMF.Model) {
  const modelSource = useSource(model.name)
  const entrySource = useSource(SharedFiles.Entry)

  const importList = Object.values(sharedImports)
    .map((creator) => creator(model))
    .filter(isImport)

  modelSource.addImportDeclarations(importList)

  writeSchema(modelSource, model)
  writeInputSchema(modelSource, model)
  writeRelatedSchema(modelSource, model)
  writeRelatedInputSchema(modelSource, model)

  entrySource.addExportDeclaration({
    moduleSpecifier: getImportPath(model.name),
  })
}

function writeSchema(file: SourceFile, model: DMMF.Model) {
  const { config } = useContext()

  file.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    leadingTrivia: (writer) => writer.blankLineIfLastNot(),
    declarations: [
      {
        name: Names.Schema(model.name),
        initializer(writer) {
          writer
            .write('z.object(')
            .inlineBlock(() => {
              model.fields
                .filter((field) => field.kind !== 'object')
                .forEach((field) => {
                  findJSDocs(field.documentation).forEach(writer.writeLine)

                  writer
                    .write(`${field.name}: ${prismaToZod(field)},`)
                    .newLine()
                })
            })
            .write(')')
        },
      },
    ],
  })

  if (config.generateDto) {
    file.addClass({
      name: Names.Dto(model.name),
      extends: `createNZodDto(${Names.Schema(model.name)})`,
      isExported: true,
      leadingTrivia: (writer) => writer.blankLineIfLastNot(),
    })
  }
}

function writeInputSchema(file: SourceFile, model: DMMF.Model) {
  const { config } = useContext()

  file.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    leadingTrivia: (writer) => writer.blankLineIfLastNot(),
    declarations: [
      {
        name: Names.InputSchema(model.name),
        initializer(writer) {
          writer
            .write('z.object(')
            .inlineBlock(() => {
              model.fields
                .filter((field) => field.kind !== 'object')
                .forEach((field) => {
                  findJSDocs(field.documentation).forEach(writer.writeLine)

                  writer
                    .write(
                      `${field.name}: ${prismaToZod(field, { nullish: true })},`
                    )
                    .newLine()
                })
            })
            .write(')')
        },
      },
    ],
  })

  if (config.generateDto) {
    file.addClass({
      name: Names.InputDto(model.name),
      extends: `createNZodDto(${Names.InputSchema(model.name)})`,
      isExported: true,
      leadingTrivia: (writer) => writer.blankLineIfLastNot(),
    })
  }
}

function writeRelatedSchema(file: SourceFile, model: DMMF.Model) {
  const relationFields = model.fields.filter((field) => field.kind === 'object')

  if (relationFields.length === 0) {
    return null
  }

  const names = relationFields
    .filter((field) => field.type !== model.name)
    .flatMap((field) => [
      Names.RelatedInterface(field.type),
      Names.RelatedSchema(field.type),
    ])

  const uniqueNames = Array.from(new Set(names))

  file.addImportDeclaration({
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: getImportPath(SharedFiles.Entry),
    namedImports: uniqueNames,
  })

  file.addInterface({
    name: Names.RelatedInterface(model.name),
    isExported: true,
    extends: [`z.infer<typeof ${Names.Schema(model.name)}>`],
    properties: relationFields.map((field) => ({
      name: field.name,
      type: `${Names.RelatedInterface(field.type)}${field.isList ? '[]' : ''}${
        !field.isRequired ? ' | null' : ''
      }`,
    })),
  })

  file.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: Names.RelatedSchema(model.name),
        type: `z.ZodSchema<${Names.RelatedInterface(model.name)}>`,
        initializer(writer) {
          writer
            .write(`z.lazy(() => ${Names.Schema(model.name)}.extend(`)
            .inlineBlock(() => {
              relationFields.forEach((field) => {
                findJSDocs(field.documentation).forEach(writer.writeLine)

                const schema = prismaToZod(field, {
                  transformSchemaName: Names.RelatedSchema,
                })

                writer.write(`${field.name}: ${schema}`).write(',').newLine()
              })
            })
            .write('))')
        },
      },
    ],
  })
}

function writeRelatedInputSchema(file: SourceFile, model: DMMF.Model) {
  const relationFields = model.fields.filter((field) => field.kind === 'object')

  if (relationFields.length === 0) {
    return null
  }

  const names = relationFields
    .filter((field) => field.type !== model.name)
    .flatMap((field) => [
      Names.RelatedInputInterface(field.type),
      Names.RelatedInputSchema(field.type),
    ])

  const uniqueNames = Array.from(new Set(names))

  file.addImportDeclaration({
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: getImportPath(SharedFiles.Entry),
    namedImports: uniqueNames,
  })

  file.addInterface({
    name: Names.RelatedInputInterface(model.name),
    isExported: true,
    extends: [`z.infer<typeof ${Names.InputSchema(model.name)}>`],
    properties: relationFields.map((field) => ({
      hasQuestionToken: !field.isRequired,
      name: field.name,
      type: `${Names.RelatedInputInterface(field.type)}${
        field.isList ? '[]' : ''
      }${!field.isRequired ? ' | null' : ''}`,
    })),
  })

  file.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: Names.RelatedInputSchema(model.name),
        type: `z.ZodSchema<${Names.RelatedInputInterface(model.name)}>`,
        initializer(writer) {
          writer
            .write(`z.lazy(() => ${Names.InputSchema(model.name)}.extend(`)
            .inlineBlock(() => {
              relationFields.forEach((field) => {
                findJSDocs(field.documentation).forEach(writer.writeLine)

                const schema = prismaToZod(field, {
                  transformSchemaName: Names.RelatedInputSchema,
                  nullish: true,
                })

                writer.write(`${field.name}: ${schema}`).write(',').newLine()
              })
            })
            .write('))')
        },
      },
    ],
  })
}

type ImportCreator = (model: DMMF.Model) => ImportDeclarationStructure | null

function isImport(value: unknown): value is ImportDeclarationStructure {
  return Boolean(value)
}

const sharedImports: Record<string, ImportCreator> = {
  nzod: () => ({
    kind: StructureKind.ImportDeclaration,
    moduleSpecifier: '@nzod/z',
    namespaceImport: 'z',
  }),
  dto: () => {
    const { config } = useContext()

    if (!config.generateDto) {
      return null
    }

    return {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nzod/dto',
      namedImports: ['createNZodDto'],
    }
  },
  decimalJs: (model) => {
    const { config } = useContext()

    if (!config.useDecimalJs) {
      return null
    }

    const decimalFields = model.fields.filter(
      (field) => field.type === 'Decimal'
    )

    if (decimalFields.length === 0) {
      return null
    }

    return {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportPath(SharedFiles.Helpers),
      namedImports: [Names.DecimalSchema()],
    }
  },
  enums: (model) => {
    const enumFields = model.fields.filter((field) => field.kind === 'enum')

    if (enumFields.length === 0) {
      return null
    }

    return {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportPath(SharedFiles.Enums),
      namedImports: enumFields.map((field) => field.type),
    }
  },
  imports: () => {
    const { config, prisma } = useContext()

    if (!config.imports) {
      return null
    }

    const importPath = path.relative(
      prisma.outputPath,
      path.resolve(path.dirname(prisma.schemaPath), config.imports!)
    )

    return {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: importPath,
      namespaceImport: 'imports',
    }
  },
}
