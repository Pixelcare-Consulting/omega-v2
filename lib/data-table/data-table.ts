import { SortingFn, sortingFns, type Column, type FilterFn } from "@tanstack/react-table"

import { compareItems, RankingInfo, rankItem } from "@tanstack/match-sorter-utils"
import { compareAsc, isSameDay, isValid } from "date-fns"

export function getCommonPinningStyles<TData>({
  column,
  withBorder = false,
}: {
  column: Column<TData>
  withBorder?: boolean //* Whether to show a box shadow on the right side of the last left pinned column or the left side of the first right pinned column. This is useful for creating a border between the pinned columns and the scrollable columns.
}): React.CSSProperties {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn = isPinned === "left" && column.getIsLastColumn("left")
  const isFirstRightPinnedColumn = isPinned === "right" && column.getIsFirstColumn("right")

  return {
    boxShadow: withBorder
      ? isLastLeftPinnedColumn
        ? "-4px 0 4px -4px hsl(var(--border)) inset"
        : isFirstRightPinnedColumn
          ? "4px 0 4px -4px hsl(var(--border)) inset"
          : undefined
      : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? "sticky" : "relative",
    background: isPinned ? "hsl(var(--background))" : "hsl(var(--background))",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

export const fuzzyFilter: FilterFn<any> = (row, columnId, filterValue, addMeta) => {
  //* Rank the item
  const itemRank = rankItem(row.getValue(columnId), filterValue)

  //* Store the itemRank info
  addMeta({ itemRank })

  //* Return if the item should be filtered in/out
  return itemRank.passed
}

export const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0

  //* Only sort by rank if the column has ranking information
  if (
    rowA.columnFiltersMeta[columnId] &&
    "itemRank" in rowA.columnFiltersMeta[columnId] &&
    "itemRank" in rowB.columnFiltersMeta[columnId]
  ) {
    dir = compareItems(rowA.columnFiltersMeta[columnId]?.itemRank as RankingInfo, rowB.columnFiltersMeta[columnId]?.itemRank as RankingInfo)
  }

  //* Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir
}

//* Global search filter
export const globalSearchFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const searchTerm = String(filterValue).toLowerCase()
  const rowValue = row.getValue(columnId)
  return rowValue !== undefined ? String(rowValue).toLowerCase().includes(searchTerm) : false
}

export const dateFilter = (rowDateValue: Date, filterDateValue: Date) => {
  if (!isValid(rowDateValue) || !isValid(filterDateValue)) return false
  return isSameDay(rowDateValue, filterDateValue)
}

export const dateSort = (rowDateValue: Date, filterDateValue: Date) => {
  if (!isValid(rowDateValue) || !isValid(filterDateValue)) return 1
  return compareAsc(rowDateValue, filterDateValue)
}
