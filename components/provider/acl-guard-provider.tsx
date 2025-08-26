"use client"

import { AppAbility, buildAbilityFor } from "@/lib/acl"
import { Session } from "next-auth"
import { useEffect, useState } from "react"
import { AbilityContext } from "../acl/can"
import { useRouter } from "nextjs-toploader/app"
import { findMenuByHref, getMenuList } from "@/constant/menu"
import { notFound, usePathname } from "next/navigation"

type ACLGuardProviderProps = {
  session: Session | null
  children: React.ReactNode
}

//* ACL - Access Control List - refer a list of rules that determine who or what is allowed to access specific resources on a website or application.
export default function ACLGuardProvider({ session, children }: ACLGuardProviderProps) {
  const user = session?.user
  const router = useRouter()
  const [ability, setAbility] = useState<AppAbility | undefined>(undefined)
  const pathname = usePathname()

  useEffect(() => {
    if (!user) setAbility(undefined)
  }, [session])

  if (user && !ability) {
    if (user.role === "admin") setAbility(buildAbilityFor({ role: user.role, rolePermissions: [] }))
    else setAbility(buildAbilityFor({ role: user.role, rolePermissions: user.rolePermissions }))
  }

  if (ability && user) {
    const menuList = getMenuList(user.role)
    const menuItem = findMenuByHref(menuList, user.role, pathname)

    if (menuItem && menuItem.actions && menuItem.subjects) {
      const actions = Array.isArray(menuItem.actions) ? menuItem.actions : [menuItem.actions]
      const subjects = Array.isArray(menuItem.subjects) ? menuItem.subjects : [menuItem.subjects]

      const isAllowed = actions.some((act) => subjects.some((sub) => ability.can(act, sub)))
      if (!isAllowed) router.push("/unauthorized")
    }
  }

  if (ability) return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>

  return <>{children}</>
}
