"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { lembretesAPI, disciplinasAPI } from "@/lib/api"

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

interface ReminderFormProps {
  reminder?: {
    id: number
    nome: string
    descricao: string
    data_inicio: string
    data_fim?: string
    discId: number
    userId: number
  } | null
  onCancel: () => void
  onSuccess?: () => void
}

export function ReminderForm({ reminder, onCancel, onSuccess }: ReminderFormProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    dataLembrete: "",
    discId: 0, // ← MUDADO: usar discId
  })
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const { toast } = useToast()

  // Carregar disciplinas ao montar o componente
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setIsLoadingSubjects(true)
        const response = await disciplinasAPI.getAll()
        console.log("Disciplinas carregadas:", response.data)
        setSubjects(response.data || [])
      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as disciplinas.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingSubjects(false)
      }
    }

    loadSubjects()
  }, [])

  // Preencher dados se for edição
  useEffect(() => {
    if (reminder) {
      console.log("Reminder recebido para edição:", reminder)
      
      // Extrair data no formato correto
      let dataFormatada = ""
      if (reminder.data_inicio) {
        try {
          dataFormatada = new Date(reminder.data_inicio).toISOString().split('T')[0]
        } catch (error) {
          console.error("Erro ao formatar data:", error)
          dataFormatada = ""
        }
      }

      setFormData({
        titulo: reminder.nome || "",
        descricao: reminder.descricao || "",
        dataLembrete: dataFormatada,
        discId: reminder.discId || 0, // ← MUDADO: usar discId
      })
    }
  }, [reminder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("=== INÍCIO DO SUBMIT ===")
    console.log("FormData atual:", formData)

    if (formData.discId === 0) { // ← MUDADO: validar discId
      console.log("Erro: disciplina não selecionada")
      toast({
        title: "Erro",
        description: "Selecione uma disciplina.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const userString = localStorage.getItem("user")
      const user = userString ? JSON.parse(userString) : null
      
      console.log("User do localStorage:", user)
      
      if (!user) {
        console.log("Erro: usuário não encontrado")
        toast({
          title: "Erro",
          description: "Usuário não encontrado. Faça login novamente.",
          variant: "destructive",
        })
        return
      }

      // Mapear para os campos que o backend espera
      const dataToSend = {
        nome: formData.titulo, // Backend espera 'nome'
        descricao: formData.descricao,
        data_inicio: new Date(formData.dataLembrete).toISOString(), // Backend espera 'data_inicio'
        data_fim: new Date(formData.dataLembrete).toISOString(), // Mesmo valor
        discId: formData.discId, // ← MUDADO: Backend espera 'discId'
        userId: user.id
      }

      console.log("Dados que serão enviados:", dataToSend)
      console.log("URL da requisição:", reminder ? `PATCH /lembretes/${reminder.id}` : "POST /lembretes")

      let response
      if (reminder) {
        console.log("Atualizando lembrete existente...")
        response = await lembretesAPI.update(reminder.id, dataToSend)
      } else {
        console.log("Criando novo lembrete...")
        response = await lembretesAPI.create(dataToSend)
      }

      console.log("Resposta da API:", response)
      console.log("Status da resposta:", response.status)
      console.log("Dados da resposta:", response.data)

      // Verificar se foi criado com sucesso
      if (response.status === 201 || response.status === 200) {
        toast({
          title: reminder ? "Lembrete atualizado!" : "Lembrete criado!",
          description: reminder ? "O lembrete foi editado com sucesso." : "O lembrete foi adicionado com sucesso.",
        })

        console.log("Chamando onSuccess...")
        onSuccess?.()
        console.log("Fechando modal...")
        onCancel()
      } else {
        throw new Error("Status inesperado na resposta")
      }

    } catch (error: any) {
      console.error("=== ERRO AO SALVAR LEMBRETE ===")
      console.error("Erro completo:", error)
      console.error("Resposta do erro:", error.response?.data)
      console.error("Status do erro:", error.response?.status)
      console.error("Config da requisição:", error.config)
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Erro de conexão com o servidor"

      toast({
        title: "Erro ao salvar lembrete",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      console.log("=== FIM DO SUBMIT ===")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    console.log(`Campo alterado: ${name} = ${value}`)
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (value: string) => {
    const discId = parseInt(value) // ← MUDADO: usar discId
    console.log(`Disciplina selecionada: ${discId}`)
    setFormData(prev => ({ ...prev, discId }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{reminder ? "Editar Lembrete" : "Novo Lembrete"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ex: Prova de Cálculo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discId">Disciplina</Label>
              <Select
                value={formData.discId.toString()}
                onValueChange={handleSelectChange}
                disabled={isLoadingSubjects}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingSubjects ? "Carregando..." : "Selecione uma disciplina"} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataLembrete">Data do Lembrete</Label>
              <Input
                id="dataLembrete"
                name="dataLembrete"
                type="date"
                value={formData.dataLembrete}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Detalhes do lembrete..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading || isLoadingSubjects}>
                {isLoading ? "Salvando..." : (reminder ? "Salvar Alterações" : "Criar Lembrete")}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}