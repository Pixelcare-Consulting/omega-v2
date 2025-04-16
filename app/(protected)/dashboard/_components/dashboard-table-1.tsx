import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const data = [
  { custDockDate: 'OCT 2024', customerName: 'Sanmina Shenzhen', amount: '$549' },
  { custDockDate: 'APR 2025', customerName: 'Block, Inc.', amount: '$1,038' },
  { custDockDate: 'APR 2025', customerName: 'DZSI, Inc', amount: '$390,651' },
  { custDockDate: 'APR 2025', customerName: 'KLA Singapore', amount: '$10,780' },
  { custDockDate: 'APR 2025', customerName: 'Microwell Technology HK Limited', amount: '$89,090' },
  { custDockDate: 'APR 2025', customerName: 'Norautron Electronics Spóka z o.o.', amount: '$9,212' },
  { custDockDate: 'APR 2025', customerName: 'Rocket EMS Inc.', amount: '$99,450' },
  { custDockDate: 'APR 2025', customerName: 'Snap-On Diagnostics', amount: '$67,700' },
  { custDockDate: 'APR 2025', customerName: 'Tecan CDMO Solutions MH, Corp', amount: '$28,824' },
  { custDockDate: 'APR 2025', customerName: 'Thermo Fisher Scientific Brno s.r.o.', amount: '$55,000' },
  { custDockDate: 'APR 2025', customerName: 'TT Electronics', amount: '$24,900' },
  { custDockDate: 'MAY 2025', customerName: 'Jabil Luxembourg Manufacturing (406820)', amount: '$133,306' },
  { custDockDate: 'MAY 2025', customerName: 'Norautron Electronics Spó&#322;ka z o.o.', amount: '$37,329' },
  { custDockDate: 'MAY 2025', customerName: 'Snap-On Diagnostics', amount: '$40,620' },
  { custDockDate: 'MAY 2025', customerName: 'TT Electronics', amount: '$16,600' },
  { custDockDate: 'JUN 2025', customerName: 'Gigamon Inc.', amount: '$26,625' },
  { custDockDate: 'JUN 2025', customerName: 'Jabil Luxembourg Manufacturing (406820)', amount: '$244,471' },
  { custDockDate: 'JUN 2025', customerName: 'Norautron Electronics Spó&#322;ka z o.o.', amount: '$21,216' },
  { custDockDate: 'JUL 2025', customerName: 'Norautron Electronics Spó&#322;ka z o.o.', amount: '$21,216' },
  { custDockDate: 'JUL 2025', customerName: 'Snap-On Diagnostics', amount: '$329,000' },
  { custDockDate: 'JUL 2025', customerName: 'Tecan CDMO Solutions MH, Corp', amount: '$9,600' },
  { custDockDate: 'JUL 2025', customerName: 'TT Electronics', amount: '$8,300' },
  { custDockDate: 'AUG 2025', customerName: 'Norautron Electronics Spó&#322;ka z o.o.', amount: '$13,160' },
  { custDockDate: 'SEP 2025', customerName: 'Jabil Luxembourg Manufacturing (406820)', amount: '$241,725' },
  { custDockDate: 'SEP 2025', customerName: 'Tecan CDMO Solutions MH, Corp', amount: '$72,000' },
  { custDockDate: 'DEC 2025', customerName: 'Jabil Luxembourg Manufacturing (406820)', amount: '$429,977' },
  { custDockDate: 'MAR 2026', customerName: 'Flex', amount: '$2,200' },
  { custDockDate: 'MAR 2026', customerName: 'Jabil Luxembourg Manufacturing (406820)', amount: '$107,059' },
  { custDockDate: 'JUN 2026', customerName: 'Snap-On Diagnostics', amount: '$460,600' }
]

export function Table1() {
  return (
    <ScrollArea className='h-[800px] rounded-md'>
      <Table>
        <TableHeader className='sticky top-0 bg-slate-100'>
          <TableRow>
            <TableHead>Cust Dock Date</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Open Row Total (tot)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, i) => (
            <TableRow key={i}>
              <TableCell>{item.custDockDate}</TableCell>
              <TableCell className='font-medium'>{item.customerName}</TableCell>
              <TableCell>{item.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className='font-bold' colSpan={2}>
              Totals (29 Groups)
            </TableCell>
            <TableCell className='font-bold'>$2,992,198</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </ScrollArea>
  )
}
