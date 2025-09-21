import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SubjectGrid } from "@/components/dashboard/subject-grid"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { UpcomingReminders } from "@/components/dashboard/upcoming-reminders"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-3 space-y-6">
            <QuickActions />
            <SubjectGrid />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <UpcomingReminders />
          </div>
        </div>
      </main>
    </div>
  )
}
