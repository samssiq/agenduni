import { MaterialList } from "@/components/materials/material-list"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function MaterialsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6">
        <MaterialList />
      </main>
    </div>
  )
}
