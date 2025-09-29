import { Icon, Icons } from "@/components/icons"

type Submenu = {
  href: string
  label: string
  active?: boolean
  actions?: string | string[]
  subjects?: string | string[]
}

type Menu = {
  href: string
  label: string
  active?: boolean
  icon: Icon
  submenus?: Submenu[]
  target?: string
  actions?: string | string[]
  subjects?: string | string[]
}

type MenuGroup = {
  groupLabel: string
  menus: Menu[]
  actions?: string | string[]
  subjects?: string | string[]
}

type FoundMenu = Menu | Submenu | undefined

export function getMenuList(role: string | null | undefined): MenuGroup[] {
  if (!role) return []

  //** role - admin, sales, supply-chain, finance, logistics, accounting
  //* ROUTE PATH - with ACL
  const MENU_GROUPS: MenuGroup[] = [
    {
      groupLabel: "",
      actions: "read",
      subjects: ["p-dashboard", "p-calendar", "p-activity-logs", "p-settings"],
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: Icons.dashboard,
          actions: "read",
          subjects: "p-dashboard",
          submenus: [],
        },
        {
          href: "/dashboard/calendar",
          label: "Calendar",
          icon: Icons.calendar,
          actions: "read",
          subjects: "p-calendar",
          submenus: [],
        },
        {
          href: "/dashboard/activity-logs",
          label: "Activity Logs",
          icon: Icons.history,
          actions: "read",
          subjects: "p-activity-logs",
          submenus: [],
        },
        {
          href: `/dashboard/settings/${role}`,
          label: "Settings",
          icon: Icons.settings,
          actions: "read",
          subjects: "p-settings",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Systems",
      actions: "read",
      subjects: ["p-csrm", "p-master-data"],
      menus: [
        {
          href: "/dashboard/admin/crm",
          label: "CSRM",
          icon: Icons.handeShake,
          actions: "read",
          subjects: "p-csrm",
          submenus: [
            {
              href: "/dashboard/crm/accounts",
              label: "Accounts",
              actions: "read",
              subjects: "p-csrm-accounts",
            },
            {
              href: "/dashboard/crm/leads",
              label: "Leads",
              actions: "read",
              subjects: "p-csrm-leads",
            },
            {
              href: "/dashboard/crm/requisitions",
              label: "Requisitions",
              actions: "read",
              subjects: "p-csrm-requisitions",
            },
            {
              href: "/dashboard/crm/supplier-quotes",
              label: "Supplier Quotes",
              actions: "read",
              subjects: "p-csrm-supplier-quotes",
            },
            {
              href: "/dashboard/crm/sale-quotes",
              label: "Sales Quotes",
              actions: "read",
              subjects: "p-csrm-sales-quotes",
            },
            {
              href: "/dashboard/crm/shipments",
              label: "Shipments",
              actions: "read",
              subjects: "p-csrm-shipments",
            },
          ],
        },
        {
          href: "/dashboard/master-data",
          label: "Master Data",
          icon: Icons.database,
          actions: "read",
          subjects: "p-master-data",
          submenus: [
            {
              href: "/dashboard/master-data/customers",
              label: "Customers",
              actions: "read",
              subjects: "p-master-data-customers",
            },
            {
              href: "/dashboard/master-data/suppliers",
              label: "Suppliers",
              actions: "read",
              subjects: "p-master-data-suppliers",
            },
            {
              href: "/dashboard/master-data/items",
              label: "Items",
              actions: "read",
              subjects: "p-master-data-items",
            },
          ],
        },
      ],
    },
  ]

  return MENU_GROUPS
}

//* Find menu or submenu by href for a given role
//* use this to get the action and subject based on pathname then use it to check if user has permission to access the page
// TODO: find behavior needs improvement
export function findMenuByHref(menus: MenuGroup[], role: string, href: string): FoundMenu {
  for (const group of menus) {
    for (const menu of group.menus) {
      if (menu.href === href) return menu

      if (menu.submenus) {
        const found = menu.submenus.find((sm) => sm.href === href)
        if (found) return found
      }
    }
  }

  return undefined
}
