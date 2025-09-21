"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Clock, MapPin, User } from "lucide-react"
import { SubjectForm } from "./subject-form"
import { useToast } from "@/hooks/use-toast"
import { disciplinasAPI } from "@/lib/api"

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

export function SubjectList() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Função para carregar disciplinas
  const loadSubjects = async () => {
    try {
      setIsLoading(true)
      const response = await disciplinasAPI.getAll()
      setSubjects(response.data)
    } catch (error: any) {
      console.error("Erro ao carregar disciplinas:", error)
      toast({
        title: "Erro ao carregar disciplinas",
        description: "Não foi possível carregar suas disciplinas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar disciplinas ao montar o componente
  useEffect(() => {
    loadSubjects()
  }, [])

  const handleCreateSubject = () => {
    setSelectedSubject(null)
    setIsFormOpen(true)
  }

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedSubject(null)
  }

  // Callback chamado quando disciplina é criada/editada com sucesso
  const handleFormSuccess = () => {
    loadSubjects() // Recarregar a lista
  }

  const handleDeleteSubject = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta disciplina?")) {
      return
    }

    try {
      await disciplinasAPI.delete(id)
      toast({
        title: "Disciplina excluída",
        description: "A disciplina foi removida com sucesso.",
      })
      loadSubjects() // Recarregar a lista
    } catch (error: any) {
      console.error("Erro ao excluir disciplina:", error)
      toast({
        title: "Erro ao excluir disciplina",
        description: "Não foi possível excluir a disciplina.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Minhas Disciplinas</h1>
        </div>
        <div className="text-center py-8">
          <div className="text-lg">Carregando disciplinas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Minhas Disciplinas</h1>
        <Button onClick={handleCreateSubject}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Disciplina
        </Button>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma disciplina encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece criando sua primeira disciplina para organizar seus estudos.
            </p>
            <Button onClick={handleCreateSubject}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Disciplina
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{subject.nome}</CardTitle>
                  <Badge variant={subject.notas >= 7 ? "default" : "destructive"}>
                    {subject.notas.toFixed(1)}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3 h-3" />
                      {subject.professor}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3" />
                      {subject.sala}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-3 h-3" />
                      {subject.horario}
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">
                    Faltas: {subject.faltas}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditSubject(subject)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDeleteSubject(subject.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && (
        <SubjectForm
          subject={selectedSubject}
          onCancel={handleCloseForm}
          onSuccess={handleFormSuccess} // Passa o callback para recarregar
        />
      )}
    </div>
  )
}