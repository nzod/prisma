import { DMMF } from '@prisma/generator-helper'

const scalarMap: Record<string, string | undefined> = {
  String: 'z.string()',
  Int: 'z.number().int()',
  BigInt: 'z.bigint()',
  DateTime: 'z.date()',
  Float: 'z.number()',
  Decimal: 'z.number()',
  Json: 'z.json()',
  Boolean: 'z.boolean()',
  Bytes: 'z.instanceOf(Buffer)',
}

interface Options {
  annotation?: string | null
  nullish?: boolean
  transformRelatedName?: (name: string) => string
}

function toBase(field: DMMF.Field, options: Options = {}) {
  const { transformRelatedName = (name) => name } = options

  if (field.kind === 'scalar') {
    return scalarMap[field.type] ?? 'z.unknown()'
  }

  if (field.kind === 'enum') {
    return `z.nativeEnum(${field.type})`
  }

  if (field.kind === 'object') {
    return transformRelatedName(field.type)
  }

  return 'z.unknown()'
}

export function prismaToZod(field: DMMF.Field, options: Options = {}) {
  const { annotation = null, nullish = false } = options

  let zod = toBase(field, options)

  if (annotation) zod += annotation

  if (field.isList) zod += '.array()'

  if (!field.isRequired && field.type !== 'Json') {
    if (nullish) zod += '.nullish()'
    else zod += '.nullable()'
  }

  return zod
}
