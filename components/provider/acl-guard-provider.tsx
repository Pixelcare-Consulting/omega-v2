"use client"

import { AppAbility, buildAbilityFor } from "@/lib/acl"
import { Session } from "next-auth"
import { useEffect, useState } from "react"
import { AbilityContext } from "../acl/can"
import { usePathname } from "next/navigation"

type ACLGuardProviderProps = {
  session: Session | null
  children: React.ReactNode
}

//* ACL - Access Control List - refer a list of rules that determine who or what is allowed to access specific resources on a website or application.
export default function ACLGuardProvider({ session, children }: ACLGuardProviderProps) {
  const user = session?.user
  const [ability, setAbility] = useState<AppAbility | undefined>(undefined)

  useEffect(() => {
    if (!user) setAbility(undefined)
  }, [session])

  if (user && !ability) {
    if (user.role === "admin") setAbility(buildAbilityFor({ role: user.role, rolePermissions: [] }))
    else setAbility(buildAbilityFor({ role: user.role, rolePermissions: user.rolePermissions }))
  }

  if (ability) return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>

  return <>{children}</>
}
