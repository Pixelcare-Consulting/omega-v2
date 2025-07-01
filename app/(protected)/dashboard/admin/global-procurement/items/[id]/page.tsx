import { getItemById } from "@/actions/item"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { notFound } from "next/navigation"
import React from "react"
import ItemForm from "../_components/item-form"

export default async function ItemPage({ params }: { params: { id: string } }) {
  const { id } = params
  const item = id === "add" ? null : await getItemById(id)

  if (id !== "add" && !item) notFound()

  return (
    <ContentLayout title='Item'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Items", href: "/dashboard/admin/global-procurement/items" },
          { label: id !== "add" && item ? item.ItemName || item.id : "Add" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <ItemForm item={item} />
      </div>
    </ContentLayout>
  )
}
