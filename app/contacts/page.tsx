import { ContactList } from "@/components/contacts/contact-list"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6">
        <ContactList />
      </main>
    </div>
  )
}
