import { SharedFiles } from '../../constants'
import { useContext } from '../../context'
import { getImportPath, useSource } from '../lib/files'

export function writeEnumsSource() {
  const { options } = useContext()

  const { enums } = options.dmmf.datamodel

  if (enums.length === 0) {
    return
  }

  const enumsSource = useSource(SharedFiles.Enums)
  const entrySource = useSource(SharedFiles.Entry)

  for (const { name, values } of enums) {
    const members = values.map(({ name }) => {
      return { name, value: name }
    })

    enumsSource
      .addEnum({
        name,
        members,
      })
      .setIsExported(true)
  }

  entrySource.addExportDeclaration({
    moduleSpecifier: getImportPath(SharedFiles.Enums),
  })
}
