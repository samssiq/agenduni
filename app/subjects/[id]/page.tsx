import { SubjectDetails } from "@/components/subjects/subject-details"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

interface SubjectPageProps {
  params: {
    id: string
  }
}

export default function SubjectPage({ params }: SubjectPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6">
        <SubjectDetails subjectId={Number.parseInt(params.id)} />
      </main>
    </div>
  )
}
