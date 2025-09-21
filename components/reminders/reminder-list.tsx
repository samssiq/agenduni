"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Clock, Calendar } from "lucide-react"
import { ReminderForm } from "./reminder-form"
import { lembretesAPI, disciplinasAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

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

export function ReminderList() {
  const [reminders, setReminders] = useState<Lembrete[]>([])
  const [subjects, setSubjects] = useState<Disciplina[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Lembrete | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [remindersResponse, subjectsResponse] = await Promise.all([lembretesAPI.getAll(), disciplinasAPI.getAll()])
      setReminders(remindersResponse.data)
      setSubjects(subjectsResponse.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddReminder = async (reminderData: any) => {
    try {
      await lembretesAPI.create(reminderData)
      await fetchData() // Refresh data
      setShowForm(false)
      toast({
        title: "Sucesso",
        description: "Lembrete criado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o lembrete",
        variant: "destructive",
      })
    }
  }

  const handleEditReminder = async (reminderData: any) => {
    if (!editingReminder) return

    try {
      await lembretesAPI.update(editingReminder.id, reminderData)
      await fetchData() // Refresh data
      setEditingReminder(null)
      setShowForm(false)
      toast({
        title: "Sucesso",
        description: "Lembrete atualizado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lembrete",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReminder = async (id: number) => {
    try {
      await lembretesAPI.delete(id)
      await fetchData() // Refresh data
      toast({
        title: "Sucesso",
        description: "Lembrete excluído com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o lembrete",
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysUntil = (date: string) => {
    const today = new Date()
    const reminderDate = new Date(date)
    const diffTime = reminderDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 1) return "bg-red-100 text-red-800"
    if (days <= 3) return "bg-yellow-100 text-yellow-800"
    return "bg-blue-100 text-blue-800"
  }

  const sortedReminders = reminders.sort(
    (a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime(),
  )

  if (isLoading) {
    return <div className="text-center py-8">Carregando lembretes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lembretes</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lembrete
        </Button>
      </div>

      <div className="grid gap-4">
        {sortedReminders.map((reminder) => {
          const daysUntil = getDaysUntil(reminder.data_inicio)
          const subject = subjects.find((s) => s.id === reminder.discId)

          return (
            <Card key={reminder.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{reminder.tipo || "Lembrete"}</CardTitle>
                    <p className="text-sm text-muted-foreground">{subject?.nome || "Disciplina"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getUrgencyColor(daysUntil)}>
                      {daysUntil === 0 ? "Hoje" : daysUntil === 1 ? "Amanhã" : `${daysUntil}d`}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingReminder(reminder)
                          setShowForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteReminder(reminder.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {reminder.descricao && <p className="text-sm text-muted-foreground">{reminder.descricao}</p>}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(reminder.data_inicio)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatTime(reminder.data_inicio)} - {formatTime(reminder.data_fim)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {sortedReminders.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Nenhum lembrete cadastrado.</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            Criar primeiro lembrete
          </Button>
        </div>
      )}

      {showForm && (
        <ReminderForm
          reminder={editingReminder}
          subjects={subjects}
          onSubmit={editingReminder ? handleEditReminder : handleAddReminder}
          onCancel={() => {
            setShowForm(false)
            setEditingReminder(null)
          }}
        />
      )}
    </div>
  )
}
