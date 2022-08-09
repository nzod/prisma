import { GeneratorOptions } from '@prisma/generator-helper'
import { Project } from 'ts-morph'
import { Config } from './config'
import { PrismaOptions } from './types'

interface Context {
  project: Project
  options: GeneratorOptions
  prisma: PrismaOptions
  config: Config
}

let context: Context

export function initializeContext(value: Context) {
  context = value
}

export function useContext() {
  return context
}
