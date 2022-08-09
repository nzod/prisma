import { z } from '@nzod/z'

const boolean = z.enum(['true', 'false']).transform((arg) => arg === 'true')

export const ConfigSchema = z.object({
  useDecimalJs: boolean.default('false'),
  imports: z.string().optional(),
})

export type Config = z.infer<typeof ConfigSchema>
