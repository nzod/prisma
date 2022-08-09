export const Names = {
  Schema: (name: string) => `${name}Schema`,
  Dto: (name: string) => `${name}Dto`,
  InputSchema: (name: string) => `${name}InputSchema`,
  InputDto: (name: string) => `${name}InputDto`,
  RelatedInterface: (name: string) => `Related${name}`,
  RelatedSchema: (name: string) => `Related${name}Schema`,
  RelatedInputInterface: (name: string) => `RelatedInput${name}`,
  RelatedInputSchema: (name: string) => `Related${name}InputSchema`,
  DecimalSchema: () => `DecimalSchema`,
}
