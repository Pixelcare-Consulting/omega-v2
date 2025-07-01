"use client"

import Link from "next/link"
import { Fragment } from "react"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

type BreadcrumbItemType = {
  label: string
  href?: string
  isPage?: boolean
}

type BreadcrumbProps = {
  items: BreadcrumbItemType[]
}

export default function Breadcrumbs({ items }: BreadcrumbProps) {
  const shouldCollapse = items.length > 7

  const firstItem = items[0]
  let middleItems: BreadcrumbItemType[] = []
  let lastItems: BreadcrumbItemType[] = []

  if (shouldCollapse) {
    middleItems = items.slice(1, -2)
    lastItems = items.slice(-2)
  } else {
    //* Render all items normally (first + middle + last)
    middleItems = items.slice(1) //* Everything after the first
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* First Item */}
        <BreadcrumbItem>
          {firstItem.href ? (
            <BreadcrumbLink asChild>
              <Link href={firstItem.href}>{firstItem.label}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{firstItem.label}</BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {/* Separator */}
        {items.length > 1 && <BreadcrumbSeparator />}

        {/* If shouldCollapse, show dropdown for middle items */}
        {shouldCollapse ? (
          <>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className='flex items-center gap-1'>
                  <BreadcrumbEllipsis className='size-4' />
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start'>
                  {middleItems.map((item, index) => (
                    <DropdownMenuItem key={`${index}-${item.label}`} asChild>
                      {item.href ? <Link href={item.href}>{item.label}</Link> : <div>{item.label}</div>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : (
          //* If not collapsed, render middle items normally
          middleItems.slice(0, -1).map((item, index) => (
            <Fragment key={`${index}-${item.label}`}>
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : item.isPage ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  item.label
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))
        )}

        {(shouldCollapse ? lastItems : middleItems.slice(-1)).map((item, index, array) => (
          <Fragment key={`${index}-${item.label}`}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : item.isPage ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                item.label
              )}
            </BreadcrumbItem>
            {/* Don't render separator after the last item */}
            {index < array.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
