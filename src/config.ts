import { GeneratorOptions } from '@prisma/generator-helper'
import { Project } from 'ts-morph'
import { z } from 'zod'

const boolean = z.enum(['true', 'false']).transform((arg) => arg === 'true')

export const ConfigSchema = z.object({
  generateSchema: boolean.default('true'),
  generateInputSchema: boolean.default('true'),
  generateDto: boolean.default('true'),
  imports: z.string().optional(),
})

export type Config = z.infer<typeof ConfigSchema>

export interface PrismaOptions {
  schemaPath: string
  outputPath: string
  clientPath: string
}

export interface GeneratorInput {
  project: Project
  options: GeneratorOptions
  prisma: PrismaOptions
  config: Config
}
