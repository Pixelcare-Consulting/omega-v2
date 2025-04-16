import { Icon, Icons } from '@/components/icons'

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

type MenuGroup = {
  groupLabel: string
  menus: Menu[]
}

type RoleBasedMenuGroups = {
  role: string
  menuGroups: MenuGroup[]
}

export function getMenuList(role: string | null | undefined): MenuGroup[] {
  if (!role) return []

  //** role - admin, sales, supply-chain, finance, logistics, accounting
  const roleBasedMenuGroups: RoleBasedMenuGroups[] = [
    {
      role: 'admin',
      menuGroups: [
        {
          groupLabel: '',
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
              submenus: []
            },
            {
              href: '/dashboard/permissions',
              label: 'Permissions',
              icon: Icons.lock,
              submenus: []
            },
            {
              href: '/dashboard/Analytics',
              label: 'Analytics',
              icon: Icons.report,
              submenus: []
            },
            {
              href: '/dashboard/calendar',
              label: 'Calendar',
              icon: Icons.calendar,
              submenus: []
            },
            {
              href: '/dashboard/activity-log',
              label: 'Activity Logs',
              icon: Icons.history,
              submenus: []
            }
          ]
        },
        {
          groupLabel: 'Systems',
          menus: [
            {
              href: '/dashboard/accounting',
              label: 'Accounting',
              icon: Icons.wallet,
              submenus: []
            },
            {
              href: '/dashboard/quality-control',
              label: 'Quality Control',
              icon: Icons.checkCircle,
              submenus: []
            },
            {
              href: '/dashboard/crm',
              label: 'CRM',
              icon: Icons.handeShake,
              submenus: []
            },
            {
              href: '/dashboard/global-procurement-system',
              label: 'Global Procurement',
              icon: Icons.dollar,
              submenus: []
            },
            {
              href: '/dashboard/warehouse-services',
              label: 'Warehouse Services',
              icon: Icons.truck,
              submenus: []
            },
            {
              href: '/dashboard/document-library',
              label: 'Document Library',
              icon: Icons.fileText,
              submenus: []
            }
          ]
        }
      ]
    },
    {
      role: 'sales',
      menuGroups: [
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
              icon: Icons.settings
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
    },
    {
      role: 'supply-chain',
      menuGroups: [
        {
          groupLabel: 'Global Procument System',
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
              icon: Icons.settings
            }
          ]
        },
        {
          groupLabel: 'Menu',
          menus: [
            {
              href: '/dashboard/requisitions',
              label: 'Requisitions',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/supplier-quotes',
              label: 'Supplier Quotes',
              icon: Icons.squareActivity,
              submenus: []
            },
            {
              href: '/dashboard/customers',
              label: 'Customers',
              icon: Icons.store,
              submenus: []
            },
            {
              href: '/dashboard/supplier',
              label: 'Supplier',
              icon: Icons.truck,
              submenus: []
            },
            {
              href: '/dashboard/contacts',
              label: 'Contacts',
              icon: Icons.contact,
              submenus: []
            },
            {
              href: '/dashboard/employees-new',
              label: 'Employees (New)',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/so-report',
              label: 'SO Report',
              icon: Icons.receipt,
              submenus: []
            },
            {
              href: '/dashboard/commission',
              label: 'Commission',
              icon: Icons.commision,
              submenus: []
            },
            {
              href: '/dashboard/commission-adjustments',
              label: 'Commission Adjustments',
              icon: Icons.paperClip,
              submenus: []
            },
            {
              href: '/dashboard/employee-commission-adjustments',
              label: 'Employee Commission Adjustments',
              icon: Icons.notepadText,
              submenus: []
            },
            {
              href: '/dashboard/product-brands',
              label: 'Product Brands',
              icon: Icons.shoppingBag,
              submenus: []
            },
            {
              href: '/dashboard/product-availability',
              label: 'Product Availability',
              icon: Icons.shoppingCart,
              submenus: []
            },
            {
              href: '/dashboard/product-commodities',
              label: 'Product Commodities',
              icon: Icons.shapes,
              submenus: []
            },
            {
              href: '/dashboard/incoming-tracking',
              label: 'Incoming Tracking',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/boms',
              label: 'BOMS',
              icon: Icons.notepadText,
              submenus: []
            },
            {
              href: '/dashboard/boms-items',
              label: 'BOMS Items',
              icon: Icons.receipt,
              submenus: []
            },
            {
              href: '/dashboard/boms-items-quotes',
              label: 'BOMS Items Quotes',
              icon: Icons.boxes,
              submenus: []
            },
            {
              href: '/dashboard/customer-excess',
              label: 'Customer Excess',
              icon: Icons.blocks,
              submenus: []
            },
            {
              href: '/dashboard/supplier-offers',
              label: 'Supplier Offers',
              icon: Icons.shoppingBaskt,
              submenus: []
            },
            {
              href: '/dashboard/documents',
              label: 'Documents',
              icon: Icons.files,
              submenus: []
            },
            {
              href: '/dashboard/requisitions-kpi',
              label: 'Requisitions KPI Table',
              icon: Icons.table,
              submenus: []
            }
          ]
        }
      ]
    },
    {
      role: 'finance',
      menuGroups: [
        {
          groupLabel: 'Accounting',
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
              icon: Icons.settings
            }
          ]
        },
        {
          groupLabel: 'Menu',
          menus: [
            {
              href: '/dashboard/expense-reports',
              label: 'Expense Reports',
              icon: Icons.notepadText,
              submenus: []
            },
            {
              href: '/dashboard/expense-line-items',
              label: 'Expense Line Items',
              icon: Icons.sheet,
              submenus: []
            },
            {
              href: '/dashboard/documents',
              label: 'Documents',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/approval-audit-log',
              label: 'Approval Audit Log',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/a-p-invoices',
              label: 'A/P Invoices',
              icon: Icons.fileText,
              submenus: []
            },
            {
              href: '/dashboard/invoice-line-items',
              label: 'Invoice Line Items',
              icon: Icons.notepadText,
              submenus: []
            },
            {
              href: '/dashboard/employees',
              label: 'Employees',
              icon: Icons.users,
              submenus: []
            },
            {
              href: '/dashboard/owned-equipment',
              label: 'Owned Equipment',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/employee-performance',
              label: 'Employee Performance',
              icon: Icons.clipboardPen,
              submenus: []
            },
            {
              href: '/dashboard/hr-documents',
              label: 'HR Documents',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/pay-rates',
              label: 'Pay Rates',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/hiring-checklist-master',
              label: 'Hiring Checklist Master',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/hr-document-master',
              label: 'HR Document Master',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/ph-payroll',
              label: 'PH Payroll',
              icon: Icons.dollar,
              submenus: []
            },
            {
              href: '/dashboard/ph-timecards',
              label: 'PH Timecards',
              icon: Icons.clock,
              submenus: []
            },
            {
              href: '/dashboard/ph-pto',
              label: 'PH PTO',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/document-templates',
              label: 'Document Templates',
              icon: Icons.fileText,
              submenus: []
            },
            {
              href: '/dashboard/document-subtables',
              label: 'Document Subtables',
              icon: Icons.fileText,
              submenus: []
            },
            {
              href: '/dashboard/ph-payroll-holidays',
              label: 'PH Payroll Holidays',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/working-days-by-month',
              label: 'Working Days (By Month)',
              icon: Icons.folderClosed,
              submenus: []
            }
          ]
        }
      ]
    },
    {
      role: 'accounting',
      menuGroups: [
        {
          groupLabel: 'Accounting',
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
              icon: Icons.settings
            }
          ]
        },
        {
          groupLabel: 'Menu',
          menus: [
            {
              href: '/dashboard/expense-reports',
              label: 'Expense Reports',
              icon: Icons.notepadText,
              submenus: []
            },
            {
              href: '/dashboard/expense-line-items',
              label: 'Expense Line Items',
              icon: Icons.sheet,
              submenus: []
            },
            {
              href: '/dashboard/documents',
              label: 'Documents',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/approval-audit-log',
              label: 'Approval Audit Log',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/a-p-invoices',
              label: 'A/P Invoices',
              icon: Icons.fileText,
              submenus: []
            },
            {
              href: '/dashboard/invoice-line-items',
              label: 'Invoice Line Items',
              icon: Icons.notepadText,
              submenus: []
            },
            {
              href: '/dashboard/employees',
              label: 'Employees',
              icon: Icons.users,
              submenus: []
            },
            {
              href: '/dashboard/owned-equipment',
              label: 'Owned Equipment',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/employee-performance',
              label: 'Employee Performance',
              icon: Icons.clipboardPen,
              submenus: []
            },
            {
              href: '/dashboard/hr-documents',
              label: 'HR Documents',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/pay-rates',
              label: 'Pay Rates',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/hiring-checklist-master',
              label: 'Hiring Checklist Master',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/hr-document-master',
              label: 'HR Document Master',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/ph-payroll',
              label: 'PH Payroll',
              icon: Icons.dollar,
              submenus: []
            },
            {
              href: '/dashboard/ph-timecards',
              label: 'PH Timecards',
              icon: Icons.clock,
              submenus: []
            },
            {
              href: '/dashboard/ph-pto',
              label: 'PH PTO',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/document-templates',
              label: 'Document Templates',
              icon: Icons.fileText,
              submenus: []
            },
            {
              href: '/dashboard/document-subtables',
              label: 'Document Subtables',
              icon: Icons.fileText,
              submenus: []
            },
            {
              href: '/dashboard/ph-payroll-holidays',
              label: 'PH Payroll Holidays',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/working-days-by-month',
              label: 'Working Days (By Month)',
              icon: Icons.folderClosed,
              submenus: []
            }
          ]
        }
      ]
    },
    {
      role: 'logistics',
      menuGroups: [
        {
          groupLabel: 'Warehouse Services',
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
              icon: Icons.settings
            }
          ]
        },
        {
          groupLabel: 'Menu',
          menus: [
            {
              href: '/dashboard/service-contracts',
              label: 'Service Contracts',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/warehouse-services-list',
              label: 'Warehouse Services List',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/warehousing-invoices',
              label: 'Warehousing Invoices',
              icon: Icons.fileText,
              submenus: []
            },
            {
              href: '/dashboard/invoice-line-items',
              label: 'Invoice Line Items',
              icon: Icons.clipboardPen,
              submenus: []
            },
            {
              href: '/dashboard/price-assignments',
              label: 'Price Assignments',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/consigned-price-lists',
              label: 'Consigned Price Lists',
              icon: Icons.dollar,
              submenus: []
            },
            {
              href: '/dashboard/consignment-splits',
              label: 'Consignment Splits',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/service-pricing',
              label: 'Service Pricing ($)',
              icon: Icons.folderClosed,
              submenus: []
            },
            {
              href: '/dashboard/warehouse-time-log',
              label: 'Warehouse Time Log',
              icon: Icons.clock,
              submenus: []
            }
          ]
        }
      ]
    }
  ]

  //* filter menu group by role
  const menusGroups = roleBasedMenuGroups.find((item) => item.role === role)

  console.log(menusGroups)

  return menusGroups?.menuGroups || roleBasedMenuGroups[0].menuGroups
}
