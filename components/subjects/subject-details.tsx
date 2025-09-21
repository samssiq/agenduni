"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, MapPin, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { SubjectForm } from "./subject-form"

interface SubjectDetailsProps {
  subjectId: number
}

// Mock data - replace with actual API calls
const mockSubject = {
  id: 1,
  nome: "Cálculo II",
  sala: "Sala 201",
  professor: "Prof. Silva",
  horario: "Seg/Qua 14:00-16:00",
  avaliacoes: "P1: 8.5, P2: 7.0",
  faltas: 2,
  notas: 7.75,
  userId: 1,
}

const mockReminders = [
  {
    id: 1,
    data_inicio: new Date("2024-01-15T14:00:00"),
    data_fim: new Date("2024-01-15T16:00:00"),
    tipo: "Prova P2",
  },
  {
    id: 2,
    data_inicio: new Date("2024-01-20T14:00:00"),
    data_fim: new Date("2024-01-20T16:00:00"),
    tipo: "Entrega Lista 3",
  },
]

const mockContacts = [
  {
    id: 1,
    nome: "Prof. Silva",
    email: "silva@universidade.edu.br",
    telefone: "(11) 99999-9999",
  },
  {
    id: 2,
    nome: "Monitor João",
    email: "joao.monitor@universidade.edu.br",
    telefone: "(11) 88888-8888",
  },
]

const mockMaterials = [
  {
    id: 1,
    resumos: "Resumo sobre derivadas e integrais",
    links: "https://exemplo.com/calculo2",
    arquivos: "lista_exercicios_1.pdf",
  },
  {
    id: 2,
    resumos: "Anotações da aula sobre limites",
    links: "https://exemplo.com/limites",
    arquivos: "slides_aula_5.pdf",
  },
]

export function SubjectDetails({ subjectId }: SubjectDetailsProps) {
  const [subject, setSubject] = useState(mockSubject)
  const [showEditForm, setShowEditForm] = useState(false)

  const handleEditSubject = (subjectData: any) => {
    setSubject({ ...subjectData, id: subject.id, userId: subject.userId })
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
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
            {mockReminders.slice(0, 2).map((reminder) => (
              <div key={reminder.id} className="mb-3 last:mb-0">
                <p className="font-medium text-sm">{reminder.tipo}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(reminder.data_inicio)} às {formatTime(reminder.data_inicio)}
                </p>
              </div>
            ))}
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
            {mockReminders.map((reminder) => (
              <Card key={reminder.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{reminder.tipo}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(reminder.data_inicio)} às {formatTime(reminder.data_inicio)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Contatos</h3>
            <Button size="sm">Novo Contato</Button>
          </div>
          <div className="grid gap-4">
            {mockContacts.map((contact) => (
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
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Materiais</h3>
            <Button size="sm">Novo Material</Button>
          </div>
          <div className="grid gap-4">
            {mockMaterials.map((material) => (
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
          </div>
        </TabsContent>
      </Tabs>

      {showEditForm && (
        <SubjectForm subject={subject} onSubmit={handleEditSubject} onCancel={() => setShowEditForm(false)} />
      )}
    </div>
  )
}
