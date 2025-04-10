import { Icon, Icons } from '@/components/icons'
import { Tag, Bookmark, SquarePen } from 'lucide-react'

type Submenu = {
  href: string
  label: string
  active?: boolean
}

type Menu = {
  href: string
  label: string
  active?: boolean
  icon: Icon
  submenus?: Submenu[]
}

type Group = {
  groupLabel: string
  menus: Menu[]
}

export function getMenuList(): Group[] {
  return [
    {
      groupLabel: 'CRM',
      menus: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: Icons.dashboard,
          submenus: []
        },
        {
          href: '/dashboard/users',
          label: 'Users',
          icon: Icons.users,
          submenus: []
        },
        {
          href: '/dashboard/settings',
          label: 'Settings',
          icon: Icons.settings,
          submenus: [
            {
              href: '/dashboard/settings/structure',
              label: 'Structure'
            },
            {
              href: '/dashboard/settings/roles',
              label: 'Roles'
            },
            {
              href: '/dashboard/settings/tables',
              label: 'Tables'
            },
            {
              href: '/dashboard/settings/app-properties',
              label: 'App Properties'
            },
            {
              href: '/dashboard/settings/pages',
              label: 'Pages'
            },
            {
              href: '/dashboard/settings/branding',
              label: 'Branding'
            },
            {
              href: '/dashboard/settings/connection-central',
              label: 'Connection Central'
            },
            {
              href: '/dashboard/settings/app-management',
              label: 'App Management'
            },
            {
              href: '/dashboard/settings/plugins',
              label: 'App Management'
            },
            {
              href: '/dashboard/settings/variables',
              label: 'Variables'
            },
            {
              href: '/dashboard/settings/automation',
              label: 'Automation'
            }
          ]
        }
      ]
    },
    {
      groupLabel: 'Menu',
      menus: [
        {
          href: '/dashboard/lead-list',
          label: 'Lead List',
          icon: Icons.table,
          submenus: []
        },
        {
          href: '/dashboard/leads',
          label: 'Leads',
          icon: Icons.table,
          submenus: []
        },
        {
          href: '/dashboard/call-logs-details',
          label: 'Call Logs Details (API)',
          icon: Icons.folder,
          submenus: []
        },
        {
          href: '/dashboard/meeting-tracker',
          label: 'Meeting Tracker',
          icon: Icons.handeShake,
          submenus: []
        },
        {
          href: '/dashboard/employees',
          label: 'Employees',
          icon: Icons.folder,
          submenus: []
        },
        {
          href: '/dashboard/email-communication',
          label: 'Email Communication',
          icon: Icons.inbox,
          submenus: []
        }
      ]
    }
  ]
}
