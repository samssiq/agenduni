import { ReminderList } from "@/components/reminders/reminder-list"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function RemindersPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6">
        <ReminderList />
      </main>
    </div>
  )
}
