import {
  GeneratorConfig,
  generatorHandler,
  GeneratorOptions,
} from '@prisma/generator-helper'
import { Project } from 'ts-morph'
import { ConfigSchema } from './config'
import { initializeContext } from './context'
import {
  writeEnumsSource,
  writeHelpersSource,
  writeModelSource,
} from './generation'
import { formatFile } from './lib'
import { PrismaOptions } from './types'

const { version } = require('../package.json')

function createPrismaOptions(options: GeneratorOptions): PrismaOptions {
  const { schemaPath } = options

  const outputPath = options.generator.output!.value

  const isClientGenerator = (config: GeneratorConfig) =>
    config.provider.value === 'prisma-client-js'

  const clientPath =
    options.otherGenerators.find(isClientGenerator)!.output!.value!

  return {
    clientPath,
    outputPath,
    schemaPath,
  }
}

generatorHandler({
  onManifest() {
    return {
      version,
      prettyName: `N'Zod Schemas`,
      defaultOutput: './src/generated/nzod',
    }
  },
  onGenerate(options) {
    const parsing = ConfigSchema.safeParse(options.generator.config)

    if (!parsing.success) {
      throw new Error(
        'Incorrect config provided. Please check the values you provided and try again.'
      )
    }

    const project = new Project()

    initializeContext({
      project,
      options,
      prisma: createPrismaOptions(options),
      config: parsing.data,
    })

    writeHelpersSource()
    writeEnumsSource()

    for (const model of options.dmmf.datamodel.models) {
      writeModelSource(model)
    }

    const files = project.getSourceFiles()
    files.forEach(formatFile)

    return project.save()
  },
})
