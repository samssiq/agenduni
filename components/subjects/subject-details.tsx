"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, MapPin, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { SubjectForm } from "./subject-form"
import { disciplinasAPI, lembretesAPI, contatosAPI, materiaisAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface SubjectDetailsProps {
  subjectId: number
}

interface Subject {
  id: number
  nome: string
  sala: string
  professor: string
  horario: string
  semestre: string
  avaliacoes: string
  faltas: number
  notas: number
  userId: number
}

interface Reminder {
  id: number
  nome: string
  data_inicio: string
  data_fim?: string
  descricao?: string
  discId: number
}

interface Contact {
  id: number
  nome: string
  email: string
  telefone: string
  discId: number
}

interface Material {
  id: number
  resumos: string
  links: string
  arquivos: string
  discId: number
}

export function SubjectDetails({ subjectId }: SubjectDetailsProps) {
  const [subject, setSubject] = useState<Subject | null>(null)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [showEditForm, setShowEditForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [subjectId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [subjectResponse, remindersResponse, contactsResponse, materialsResponse] = await Promise.all([
        disciplinasAPI.getById(subjectId),
        lembretesAPI.getByDisciplina(subjectId),
        contatosAPI.getByDisciplina(subjectId),
        materiaisAPI.getByDisciplina(subjectId),
      ])
      
      setSubject(subjectResponse.data)
      setReminders(remindersResponse.data || [])
      setContacts(contactsResponse.data || [])
      setMaterials(materialsResponse.data || [])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da disciplina.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSubject = (subjectData: any) => {
    if (subject) {
      setSubject({ ...subjectData, id: subject.id, userId: subject.userId })
    }
    setShowEditForm(false)
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Carregando dados da disciplina...</p>
        </div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Disciplina não encontrada.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/subjects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{subject.nome}</h1>
          <p className="text-muted-foreground">{subject.professor}</p>
        </div>

        <Button onClick={() => setShowEditForm(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Sala</p>
              <p className="font-medium">{subject.sala}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horário</p>
              <p className="font-medium">{subject.horario}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Professor</p>
              <p className="font-medium">{subject.professor}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nota Atual</span>
              <Badge className={getGradeColor(subject.notas)}>{subject.notas.toFixed(1)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Faltas</span>
              <Badge className={getAbsenceColor(subject.faltas)}>{subject.faltas}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avaliações</p>
              <p className="text-sm">{subject.avaliacoes}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reminders.slice(0, 2).map((reminder) => (
              <div key={reminder.id} className="mb-3 last:mb-0">
                <p className="font-medium text-sm">{reminder.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(reminder.data_inicio)} às {formatTime(reminder.data_inicio)}
                </p>
              </div>
            ))}
            {reminders.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum lembrete próximo</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reminders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reminders">Lembretes</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
        </TabsList>

        <TabsContent value="reminders" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Lembretes</h3>
            <Button size="sm">Novo Lembrete</Button>
          </div>
          <div className="grid gap-4">
            {reminders.map((reminder) => (
              <Card key={reminder.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{reminder.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(reminder.data_inicio)} às {formatTime(reminder.data_inicio)}
                      </p>
                      {reminder.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">{reminder.descricao}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {reminders.length === 0 && (
              <p className="text-muted-foreground text-center py-8">Nenhum lembrete cadastrado</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Contatos</h3>
            <Button size="sm">Novo Contato</Button>
          </div>
          <div className="grid gap-4">
            {contacts.map((contact) => (
              <Card key={contact.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{contact.nome}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                      <p className="text-sm text-muted-foreground">{contact.telefone}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {contacts.length === 0 && (
              <p className="text-muted-foreground text-center py-8">Nenhum contato cadastrado</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Materiais</h3>
            <Button size="sm">Novo Material</Button>
          </div>
          <div className="grid gap-4">
            {materials.map((material) => (
              <Card key={material.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="font-medium">Material de Estudo</p>
                      <p className="text-sm text-muted-foreground">{material.resumos}</p>
                      {material.links && (
                        <p className="text-sm">
                          <strong>Link:</strong>{" "}
                          <a href={material.links} className="text-primary hover:underline">
                            {material.links}
                          </a>
                        </p>
                      )}
                      {material.arquivos && (
                        <p className="text-sm">
                          <strong>Arquivo:</strong> {material.arquivos}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {materials.length === 0 && (
              <p className="text-muted-foreground text-center py-8">Nenhum material cadastrado</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {showEditForm && (
        <SubjectForm subject={subject} onSubmit={handleEditSubject} onCancel={() => setShowEditForm(false)} />
      )}
    </div>
  )
}
