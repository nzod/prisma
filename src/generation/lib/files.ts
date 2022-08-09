import kebabCase from 'just-kebab-case'
import { useContext } from '../../context'

export function useSource(name: string) {
  const { project, prisma } = useContext()

  const fileName = `${kebabCase(name)}.ts`
  const path = `${prisma.outputPath}/${fileName}`

  return (
    project.getSourceFile(path) ??
    project.createSourceFile(path, {}, { overwrite: true })
  )
}

export function getImportPath(name: string) {
  const source = useSource(name)

  return `./${source.getBaseNameWithoutExtension()}`
}
