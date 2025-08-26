"use client"

import Link from "next/link"
import { useContext, useState } from "react"
import { ChevronDown, Dot, LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"
import CanView from "@/components/acl/can-view"
import { v4 as uuidv4 } from "uuid"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"

type Submenu = {
  href: string
  label: string
  active?: boolean
  actions?: string | string[]
  subjects?: string | string[]
}

interface CollapseMenuButtonProps {
  index: number
  icon: LucideIcon
  label: string
  active: boolean
  submenus: Submenu[]
  isOpen: boolean | undefined
  actions?: string | string[]
  subjects?: string | string[]
}

export function CollapseMenuButton({ index, icon: Icon, label, active, submenus, isOpen, actions, subjects }: CollapseMenuButtonProps) {
  const pathname = usePathname()
  const isSubmenuActive = submenus.some((submenu) => (submenu.active === undefined ? submenu.href === pathname : submenu.active))
  const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubmenuActive)

  const isShowMenu = CanView({ action: actions || [], subject: subjects || [], isReturnBoolean: true }) as boolean

  if (isOpen && isShowMenu) {
    return (
      <Collapsible open={isCollapsed} onOpenChange={setIsCollapsed} className='w-full'>
        <CollapsibleTrigger className='mb-1 [&[data-state=open]>div>div>svg]:rotate-180' asChild>
          <Button variant={isSubmenuActive ? "secondary" : "ghost"} className='h-10 w-full justify-start'>
            <div className='flex w-full items-center justify-between'>
              <div className='flex items-center'>
                <span className='mr-4'>
                  <Icon size={18} />
                </span>
                <p className={cn("max-w-[150px] truncate", isOpen ? "translate-x-0 opacity-100" : "-translate-x-96 opacity-0")}>{label}</p>
              </div>
              <div className={cn("whitespace-nowrap", isOpen ? "translate-x-0 opacity-100" : "-translate-x-96 opacity-0")}>
                <ChevronDown size={18} className='transition-transform duration-200' />
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>

        {submenus.length > 0 && (
          <CollapsibleContent className='data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden'>
            {submenus.map(({ href, label, active, actions: subMenuActions, subjects: subMenuSubjects }, subMenusIndex) => {
              return (
                <CanView key={`${index}-${uuidv4()}`} subject={subMenuSubjects || []} action={subMenuActions || []}>
                  <Button
                    key={`${subMenusIndex}-${uuidv4()}`}
                    variant={(active === undefined && pathname === href) || active ? "secondary" : "ghost"}
                    className='mb-1 h-10 w-full justify-start'
                    asChild
                  >
                    <Link href={href}>
                      <span className='ml-2 mr-4'>
                        <Dot size={18} />
                      </span>
                      <p className={cn("max-w-[170px] truncate", isOpen ? "translate-x-0 opacity-100" : "-translate-x-96 opacity-0")}>
                        {label}
                      </p>
                    </Link>
                  </Button>
                </CanView>
              )
            })}
          </CollapsibleContent>
        )}
      </Collapsible>
    )
  }

  if (!isOpen && isShowMenu) {
    return (
      <DropdownMenu>
        <ActionTooltipProvider delayDuration={100} side='right' align='start' alignOffset={2} label={label}>
          <DropdownMenuTrigger asChild>
            <Button variant={isSubmenuActive ? "secondary" : "ghost"} className='mb-1 h-10 w-full justify-start'>
              <div className='flex w-full items-center justify-between'>
                <div className='flex items-center'>
                  <span className={cn(isOpen === false ? "" : "mr-4")}>
                    <Icon size={18} />
                  </span>
                  <p className={cn("max-w-[200px] truncate", isOpen === false ? "opacity-0" : "opacity-100")}>{label}</p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
        </ActionTooltipProvider>

        {submenus.length > 0 && (
          <DropdownMenuContent side='right' sideOffset={25} align='start'>
            <DropdownMenuLabel className='max-w-[190px] truncate'>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {submenus.map(({ href, label, active, actions: subMenuActions, subjects: subMenuSubjects }, subMenuIndex) => (
              <CanView key={`${index}-${uuidv4()}`} subject={subMenuSubjects || []} action={subMenuActions || []}>
                <DropdownMenuItem key={subMenuIndex} asChild>
                  <Link
                    className={`cursor-pointer ${((active === undefined && pathname === href) || active) && "bg-secondary"}`}
                    href={href}
                  >
                    <p className='max-w-[180px] truncate'>{label} </p>
                  </Link>
                </DropdownMenuItem>
              </CanView>
            ))}
            <DropdownMenuArrow className='fill-border' />
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    )
  }

  return null
}
