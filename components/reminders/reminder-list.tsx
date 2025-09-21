"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Clock, Calendar, Bell, Search, Filter } from "lucide-react"
import { ReminderForm } from "./reminder-form"
import { lembretesAPI, disciplinasAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// Interface do lembrete como vem do backend
interface BackendReminder {
  id: number
  nome: string
  descricao: string
  data_inicio: string
  data_fim?: string
  discId: number
  userId: number
}

// Interface da disciplina
interface Subject {
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

export function ReminderList() {
  const [reminders, setReminders] = useState<BackendReminder[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<BackendReminder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log("=== CARREGANDO DADOS DA LISTA ===")
      setIsLoading(true)
      
      const [remindersResponse, subjectsResponse] = await Promise.all([
        lembretesAPI.getAll(), 
        disciplinasAPI.getAll()
      ])
      
      console.log("Resposta lembretes:", remindersResponse)
      console.log("Dados lembretes:", remindersResponse.data)
      console.log("Resposta disciplinas:", subjectsResponse)
      console.log("Dados disciplinas:", subjectsResponse.data)
      
      setReminders(remindersResponse.data || [])
      setSubjects(subjectsResponse.data || [])
      
      console.log("Estados atualizados - Lembretes:", remindersResponse.data?.length || 0)
      console.log("Estados atualizados - Disciplinas:", subjectsResponse.data?.length || 0)
      
    } catch (error) {
      console.error("Error fetching data:", error)
      if (typeof error === "object" && error !== null && "response" in error) {
        // @ts-expect-error: response might exist on error
        console.error("Erro detalhado:", error.response?.data)
      }
      toast({
        title: "Erro",
        description: "Não foi possível carregar os lembretes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      console.log("=== FIM DO CARREGAMENTO ===")
    }
  }

  const handleDeleteReminder = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este lembrete?")) {
      return
    }

    try {
      await lembretesAPI.delete(id)
      toast({
        title: "Lembrete excluído",
        description: "O lembrete foi removido com sucesso.",
      })
      fetchData()
    } catch (error) {
      console.error("Error deleting reminder:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o lembrete",
        variant: "destructive",
      })
    }
  }

  const handleEditReminder = (reminder: BackendReminder) => {
    console.log("Editando lembrete:", reminder)
    setEditingReminder(reminder)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingReminder(null)
  }

  const handleFormSuccess = () => {
    console.log("handleFormSuccess chamado - recarregando lista...")
    fetchData()
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Data não informada"
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return "Data inválida"
    }
  }

  const getDaysUntil = (dateString: string | undefined) => {
    if (!dateString) return 0
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const reminderDate = new Date(dateString)
      reminderDate.setHours(0, 0, 0, 0)
      
      const diffTime = reminderDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return 0
    }
  }

  const getUrgencyColor = (days: number) => {
    if (days < 0) return "bg-gray-100 text-gray-800"
    if (days === 0) return "bg-red-100 text-red-800"
    if (days <= 3) return "bg-yellow-100 text-yellow-800"
    return "bg-blue-100 text-blue-800"
  }

  const getUrgencyText = (days: number) => {
    if (days < 0) return `${Math.abs(days)}d atrás`
    if (days === 0) return "Hoje"
    if (days === 1) return "Amanhã"
    return `${days}d`
  }

  // Verificar se reminders existe e tem dados válidos
  const validReminders = reminders.filter(r => r && r.data_inicio)
  
  const filteredReminders = validReminders.filter(reminder => {
    const subject = subjects.find((s) => s.id === reminder.discId)
    const disciplineName = subject?.nome || "Sem disciplina"
    
    const matchesSearch = searchTerm === "" || 
      reminder.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disciplineName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSubject = selectedSubject === "all" || reminder.discId.toString() === selectedSubject
    
    return matchesSearch && matchesSubject
  })
  
  const sortedReminders = filteredReminders.sort(
    (a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
  )

  const groupedReminders = sortedReminders.reduce(
    (acc, reminder) => {
      const subject = subjects.find((s) => s.id === reminder.discId)
      const disciplineName = subject?.nome || "Sem disciplina"
      if (!acc[disciplineName]) {
        acc[disciplineName] = []
      }
      acc[disciplineName].push(reminder)
      return acc
    },
    {} as Record<string, typeof reminders>,
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Lembretes</h2>
        </div>
        <div className="text-center py-8">Carregando lembretes...</div>
      </div>
    )
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

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar lembretes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-64">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por disciplina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as disciplinas</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id.toString()}>
                {subject.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(searchTerm || selectedSubject !== "all") && (
        <div className="text-sm text-muted-foreground">
          Mostrando {sortedReminders.length} de {validReminders.length} lembretes
          {selectedSubject !== "all" && (
            <span> • {subjects.find(s => s.id.toString() === selectedSubject)?.nome}</span>
          )}
        </div>
      )}

      {Object.keys(groupedReminders).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            {searchTerm || selectedSubject !== "all" ? (
              <>
                <h3 className="text-lg font-medium mb-2">Nenhum lembrete encontrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Tente ajustar os filtros ou buscar por outros termos.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedSubject("all")
                    }}
                  >
                    Limpar Filtros
                  </Button>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Lembrete
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-2">Nenhum lembrete cadastrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Crie lembretes para não esquecer das suas atividades acadêmicas.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Lembrete
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedReminders).map(([disciplineName, disciplineReminders]) => (
            <div key={disciplineName} className="space-y-4">
              <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {disciplineName}
                <span className="text-sm text-muted-foreground font-normal">
                  ({disciplineReminders.length} {disciplineReminders.length === 1 ? 'lembrete' : 'lembretes'})
                </span>
              </h3>
              <div className="grid gap-4">
                {disciplineReminders.map((reminder) => {
                  if (!reminder) return null
                  
                  const daysUntil = getDaysUntil(reminder.data_inicio)
                  const subject = subjects.find((s) => s.id === reminder.discId)

                  return (
                    <Card key={reminder.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-lg">{reminder.nome || "Sem título"}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getUrgencyColor(daysUntil)}>
                              {getUrgencyText(daysUntil)}
                            </Badge>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditReminder(reminder)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteReminder(reminder.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {reminder.descricao && (
                          <p className="text-sm text-muted-foreground">{reminder.descricao}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(reminder.data_inicio)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ReminderForm
          reminder={editingReminder}
          onCancel={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}