import { useContext } from "react"
import { AbilityContext } from "./can"

type CanViewProps = {
  children: React.ReactNode
  action: string | string[]
  subject: string | string[]
}

export default function CanView({ children, action, subject }: CanViewProps) {
  const ability = useContext(AbilityContext)
  if (!ability) return null
  return ability.can(action, subject) ? <>{children}</> : null
}
