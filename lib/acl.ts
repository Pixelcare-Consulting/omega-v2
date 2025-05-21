import { AbilityBuilder, Ability } from "@casl/ability"

export type Subject = string
export type Action = string
export type AppAbility = Ability<[Action, Subject]> | undefined

export const AppAbility = Ability as any

export type ACLObj = {
  action: string | string[]
  subject: string | string[]
}

export type DefineRulesUser = {
  role: string
  rolePermissions: { id: string; code: string; actions: string[] }[]
}

//* manage - represent any action
//* all - represent any subject
//* manage & all - grant full access to system

export const defineRulesForUser = ({ role, rolePermissions }: DefineRulesUser) => {
  const { can, rules } = new AbilityBuilder(AppAbility)

  //* Grant full access to system
  if (role === "admin") can("manage", "all")

  rolePermissions?.forEach((permission) => {
    can(permission.actions, permission.code)
  })

  return rules
}

export const buildAbilityFor = ({ role, rolePermissions }: DefineRulesUser): AppAbility => {
  return new AppAbility(defineRulesForUser({ role, rolePermissions }), {
    detectSubjectType: (object: Record<string, any>) => object!.type,
  })
}
