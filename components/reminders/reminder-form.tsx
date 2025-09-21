"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface ReminderFormProps {
  reminder?: {
    id: number
    data_inicio: Date
    data_fim: Date
    discId: number
    tipo: string
    descricao?: string
  } | null
  subjects: Array<{ id: number; nome: string }>
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function ReminderForm({ reminder, subjects, onSubmit, onCancel }: ReminderFormProps) {
  const [formData, setFormData] = useState({
    tipo: "",
    descricao: "",
    discId: "",
    data_inicio: "",
    hora_inicio: "",
    data_fim: "",
    hora_fim: "",
  })

  useEffect(() => {
    if (reminder) {
      const dataInicio = new Date(reminder.data_inicio)
      const dataFim = new Date(reminder.data_fim)

      setFormData({
        tipo: reminder.tipo,
        descricao: reminder.descricao || "",
        discId: reminder.discId.toString(),
        data_inicio: dataInicio.toISOString().split("T")[0],
        hora_inicio: dataInicio.toTimeString().slice(0, 5),
        data_fim: dataFim.toISOString().split("T")[0],
        hora_fim: dataFim.toTimeString().slice(0, 5),
      })
    }
  }, [reminder])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const dataInicio = new Date(`${formData.data_inicio}T${formData.hora_inicio}:00`)
    const dataFim = new Date(`${formData.data_fim}T${formData.hora_fim}:00`)

    const reminderData = {
      tipo: formData.tipo,
      descricao: formData.descricao,
      discId: Number.parseInt(formData.discId),
      data_inicio: dataInicio,
      data_fim: dataFim,
    }

    onSubmit(reminderData)
  }

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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
              <Label htmlFor="discId">Disciplina</Label>
              <Select value={formData.discId} onValueChange={(value) => handleChange("discId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma disciplina" />
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
              <Label htmlFor="tipo">Tipo do Lembrete</Label>
              <Input
                id="tipo"
                value={formData.tipo}
                onChange={(e) => handleChange("tipo", e.target.value)}
                placeholder="Ex: Prova P2, Entrega de Trabalho"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleChange("descricao", e.target.value)}
                placeholder="Detalhes adicionais sobre o lembrete"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => handleChange("data_inicio", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora de Início</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => handleChange("hora_inicio", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data de Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => handleChange("data_fim", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_fim">Hora de Fim</Label>
                <Input
                  id="hora_fim"
                  type="time"
                  value={formData.hora_fim}
                  onChange={(e) => handleChange("hora_fim", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {reminder ? "Salvar Alterações" : "Criar Lembrete"}
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
