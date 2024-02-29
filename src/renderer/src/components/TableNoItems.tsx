import { TableCell, TableRow } from './ui/table'

export function TableNoItems() {
  return (
    <TableRow>
      <TableCell
        class="p-9 text-center"
        colspan="100%"
      >
        Aucun élément
      </TableCell>
    </TableRow>
  )
}
