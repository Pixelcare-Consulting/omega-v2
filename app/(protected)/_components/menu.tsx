"use client"

import Link from "next/link"
import { Ellipsis } from "lucide-react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { getMenuList } from "@/constant/menu"
import { CollapseMenuButton } from "./collapse-menu-button"
import { ExtendedUser } from "@/auth"
import CanView from "@/components/acl/can-view"
import { v4 as uuidv4 } from "uuid"
import { memo } from "react"

interface MenuProps {
  isOpen: boolean | undefined
  user: ExtendedUser
}

export const Menu = memo(function Menu({ isOpen, user }: MenuProps) {
  const pathname = usePathname()
  const menuList = getMenuList(user.role)

  return (
    <ScrollArea className='[&>div>div[style]]:!block'>
      <nav className='mt-8 h-full w-full'>
        <ul className='flex min-h-[calc(100vh-48px-36px-16px-32px)] flex-col items-start space-y-1 px-2 lg:min-h-[calc(100vh-32px-40px-32px)]'>
          {menuList.map(({ groupLabel, menus, actions: menuListActions, subjects: menuListSubjects }, MenuListIndex) => (
            <CanView key={`${MenuListIndex}-${uuidv4()}`} subject={menuListSubjects || []} action={menuListActions || []}>
              <li className={cn("w-full", groupLabel ? "pt-5" : "")}>
                {(isOpen && groupLabel) || isOpen === undefined ? (
                  <p className='max-w-[248px] truncate px-4 pb-2 text-sm font-medium text-muted-foreground'>{groupLabel}</p>
                ) : !isOpen && isOpen !== undefined && groupLabel ? (
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger className='w-full'>
                        <div className='flex w-full items-center justify-center'>
                          <Ellipsis className='h-5 w-5' />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side='right'>
                        <p>{groupLabel}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <p className='pb-2'></p>
                )}

                {menus.map(({ href, label, icon: Icon, active, submenus, actions: menusActions, subjects: menusSubjects }, menusIndex) => {
                  const isMenuActive = href === pathname || (pathname.startsWith(`${href}`) && href !== "/dashboard")

                  if (!submenus || submenus.length === 0) {
                    return (
                      <CanView key={`${menusIndex}-${uuidv4()}`} subject={menusSubjects || []} action={menusActions || []}>
                        <div className='w-full'>
                          <TooltipProvider disableHoverableContent>
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={(active === undefined && isMenuActive) || active ? "secondary" : "ghost"}
                                  className='mb-1 h-10 w-full justify-start'
                                  asChild
                                >
                                  <Link href={href}>
                                    <span className={cn(isOpen === false ? "" : "mr-4")}>
                                      <Icon size={18} />
                                    </span>
                                    <p
                                      className={cn(
                                        "max-w-[200px] truncate",
                                        isOpen === false ? "-translate-x-96 opacity-0" : "translate-x-0 opacity-100"
                                      )}
                                    >
                                      {label}
                                    </p>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              {isOpen === false && <TooltipContent side='right'>{label}</TooltipContent>}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CanView>
                    )
                  }

                  // console.log("what???")

                  return (
                    <CollapseMenuButton
                      key={`${menusIndex}-${uuidv4()}`}
                      index={menusIndex}
                      icon={Icon}
                      label={label}
                      active={active === undefined ? isMenuActive : active}
                      submenus={submenus}
                      isOpen={isOpen}
                      actions={menusActions}
                      subjects={menusSubjects}
                    />
                  )
                })}
              </li>
            </CanView>
          ))}
        </ul>
      </nav>
    </ScrollArea>
  )
})
