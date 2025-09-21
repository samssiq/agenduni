"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Plus } from "lucide-react"
import { lembretesAPI, disciplinasAPI } from "@/lib/api"

interface Lembrete {
  id: number
  data_inicio: string
  data_fim: string
  discId: number
  tipo?: string
  descricao?: string
}

interface Disciplina {
  id: number
  nome: string
}

export function UpcomingReminders() {
  const [reminders, setReminders] = useState<Lembrete[]>([])
  const [subjects, setSubjects] = useState<Disciplina[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [remindersResponse, subjectsResponse] = await Promise.all([
          lembretesAPI.getAll(),
          disciplinasAPI.getAll(),
        ])
        setReminders(remindersResponse.data)
        setSubjects(subjectsResponse.data)
      } catch (error) {
        console.error("Error fetching reminders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 1) return "bg-red-100 text-red-800"
    if (days <= 3) return "bg-yellow-100 text-yellow-800"
    return "bg-blue-100 text-blue-800"
  }

  const upcomingReminders = reminders
    .filter((reminder) => getDaysUntil(reminder.data_inicio) >= 0)
    .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
    .slice(0, 5) // Show only next 5 reminders

  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-lg">Próximos Lembretes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Próximos Lembretes</CardTitle>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {upcomingReminders.map((reminder) => {
          const daysUntil = getDaysUntil(reminder.data_inicio)
          const subject = subjects.find((s) => s.id === reminder.discId)

          return (
            <div key={reminder.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{reminder.tipo || "Lembrete"}</p>
                  <p className="text-xs text-muted-foreground">{subject?.nome || "Disciplina"}</p>
                </div>
                <Badge className={getUrgencyColor(daysUntil)}>
                  {daysUntil === 0 ? "Hoje" : daysUntil === 1 ? "Amanhã" : `${daysUntil}d`}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDate(reminder.data_inicio)} às {formatTime(reminder.data_inicio)}
                </span>
              </div>
            </div>
          )
        })}

        {upcomingReminders.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum lembrete próximo</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
