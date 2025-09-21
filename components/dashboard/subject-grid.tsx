"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, User, Clock, Edit, Plus } from "lucide-react"
import { disciplinasAPI } from "@/lib/api"

interface Disciplina {
  id: number
  nome: string
  sala: string
  professor: string
  horario: string
  avaliacoes: string
  faltas: number
  notas: number
  userId: number
}

export function SubjectGrid() {
  const [subjects, setSubjects] = useState<Disciplina[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await disciplinasAPI.getAll()
        setSubjects(response.data)
      } catch (error) {
        console.error("Error fetching subjects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  const getGradeColor = (grade: number) => {
    if (grade >= 8) return "bg-green-100 text-green-800"
    if (grade >= 7) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getAbsenceColor = (absences: number) => {
    if (absences === 0) return "bg-green-100 text-green-800"
    if (absences <= 2) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando disciplinas...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Minhas Disciplinas</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Disciplina
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <Card key={subject.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg text-balance">{subject.nome}</CardTitle>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{subject.sala}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{subject.professor}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{subject.horario}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col gap-1">
                  <Badge className={getGradeColor(subject.notas)}>Nota: {subject.notas.toFixed(1)}</Badge>
                  <Badge className={getAbsenceColor(subject.faltas)}>Faltas: {subject.faltas}</Badge>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <strong>Avaliações:</strong> {subject.avaliacoes}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
