import { generatorHandler } from '@prisma/generator-helper'
import { Project } from 'ts-morph'
import { SemicolonPreference } from 'typescript'
import { ConfigSchema, GeneratorInput, PrismaOptions } from './config'

const { version } = require('../package.json')

generatorHandler({
  onManifest() {
    return {
      version,
      prettyName: `N'Zod Schemas`,
      defaultOutput: './src/generated/nzod',
    }
  },
  onGenerate(options) {
    const project = new Project()

    const models = options.dmmf.datamodel.models
    const enums = options.dmmf.datamodel.enums

    const { schemaPath } = options

    const outputPath = options.generator.output!.value
    const clientPath = options.otherGenerators.find(
      (each) => each.provider.value === 'prisma-client-js'
    )!.output!.value!

    const parsing = ConfigSchema.safeParse(options.generator.config)

    if (!parsing.success) {
      throw new Error(
        'Incorrect config provided. Please check the values you provided and try again.'
      )
    }

    const input: GeneratorInput = {
      project,
      options,
      prisma: {
        clientPath,
        outputPath,
        schemaPath,
      },
      config: parsing.data,
    }

    const indexFile = project.createSourceFile(
      `${outputPath}/index.ts`,
      {},
      { overwrite: true }
    )

    indexFile.formatText({
      indentSize: 2,
      convertTabsToSpaces: true,
      semicolons: SemicolonPreference.Remove,
    })

    models.forEach((model) => {
      const sourceFile = project.createSourceFile(
        `${outputPath}/${model.name.toLowerCase()}.ts`,
        {},
        { overwrite: true }
      )

      sourceFile.formatText({
        indentSize: 2,
        convertTabsToSpaces: true,
        semicolons: SemicolonPreference.Remove,
      })
    })

    if (enums.length > 0) {
      const enumsFile = project.createSourceFile(
        `${outputPath}/enums.ts`,
        {},
        { overwrite: true }
      )

      enumsFile.formatText({
        indentSize: 2,
        convertTabsToSpaces: true,
        semicolons: SemicolonPreference.Remove,
      })
    }

    return project.save()
  },
})
