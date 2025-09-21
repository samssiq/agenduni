"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { disciplinasAPI } from "@/lib/api"

interface SubjectFormProps {
  subject?: {
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
  } | null
  onSubmit?: (data: any) => void
  onCancel: () => void
  onSuccess?: () => void
}

export function SubjectForm({ subject, onCancel, onSuccess }: SubjectFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    sala: "",
    professor: "",
    horario: "",
    semestre: "",
    avaliacoes: "",
    faltas: 0,
    notas: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (subject) {
      setFormData({
        nome: subject.nome,
        sala: subject.sala,
        professor: subject.professor,
        horario: subject.horario,
        semestre: subject.semestre || "",
        avaliacoes: subject.avaliacoes,
        faltas: subject.faltas,
        notas: subject.notas,
      })
    }
  }, [subject])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const userString = localStorage.getItem("user")
      const user = userString ? JSON.parse(userString) : null
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado. Faça login novamente.",
          variant: "destructive",
        })
        return
      }

      const dataToSend = {
        ...formData,
        userId: user.id
      }

      if (subject) {
        await disciplinasAPI.update(subject.id, dataToSend)
        toast({
          title: "Disciplina atualizada!",
          description: "As alterações foram salvas com sucesso.",
        })
      } else {
        await disciplinasAPI.create(dataToSend)
        toast({
          title: "Disciplina criada!",
          description: "A disciplina foi adicionada com sucesso.",
        })
      }

      window.dispatchEvent(new CustomEvent('disciplinasUpdated', {
        detail: { action: subject?.id ? 'updated' : 'created' }
      }))
      
      localStorage.setItem('disciplinasLastUpdate', Date.now().toString())

      onSuccess?.()
      onCancel()

    } catch (error: any) {
      console.error("Erro ao salvar disciplina:", error)
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Erro de conexão com o servidor"

      toast({
        title: "Erro ao salvar disciplina",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "faltas" || name === "notas" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{subject ? "Editar Disciplina" : "Nova Disciplina"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Disciplina</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Cálculo II"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professor">Professor</Label>
              <Input
                id="professor"
                name="professor"
                value={formData.professor}
                onChange={handleChange}
                placeholder="Ex: Prof. Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sala">Sala</Label>
              <Input
                id="sala"
                name="sala"
                value={formData.sala}
                onChange={handleChange}
                placeholder="Ex: Sala 201"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario">Horário</Label>
              <Input
                id="horario"
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                placeholder="Ex: Seg/Qua 14:00-16:00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semestre">Semestre</Label>
              <Input
                id="semestre"
                name="semestre"
                value={formData.semestre}
                onChange={handleChange}
                placeholder="Ex: 2024.1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faltas">Faltas</Label>
                <Input
                  id="faltas"
                  name="faltas"
                  type="number"
                  min="0"
                  value={formData.faltas}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Nota Atual</Label>
                <Input
                  id="notas"
                  name="notas"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.notas}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avaliacoes">Avaliações</Label>
              <Textarea
                id="avaliacoes"
                name="avaliacoes"
                value={formData.avaliacoes}
                onChange={handleChange}
                placeholder="Ex: P1: 8.5, P2: 7.0, Projeto: 9.0"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Salvando..." : (subject ? "Salvar Alterações" : "Criar Disciplina")}
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