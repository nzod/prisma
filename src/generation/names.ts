import { DMMF } from '@prisma/generator-helper'

type Entity = string | DMMF.SchemaEnum | DMMF.OutputType | DMMF.SchemaArg
type Namer = (entity: Entity) => string

export const names: Record<string, Namer> = {
  schema: (entity) => `${entity}Schema`,
  inputSchema: (entity) => `${entity}InputSchema`,
  relatedSchema: (entity) => `Related${entity}Schema`,
  relatedInputSchema: (entity) => `Related${entity}InputSchema`,
}
