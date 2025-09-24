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
import { useToast } from "@/hooks/use-toast"

interface MaterialFormProps {
  material?: {
    id: number
    nome: string
    resumos: string
    links: string
    discId: number
  } | null
  subjects: Array<{ id: number; nome: string }>
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function MaterialForm({ material, subjects, onSubmit, onCancel }: MaterialFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nome: "",
    resumos: "",
    links: "",
    discId: "",
  })

  useEffect(() => {
    if (material) {
      setFormData({
        nome: material.nome,
        resumos: material.resumos,
        links: material.links,
        discId: material.discId.toString(),
      })
    }
  }, [material])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!formData.discId || formData.discId === "") {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione uma disciplina.",
        variant: "destructive",
      })
      return
    }

    // Converter discId para número, com fallback para prevenir NaN
    const discIdNumber = parseInt(formData.discId, 10)
    if (isNaN(discIdNumber)) {
      toast({
        title: "Erro de validação",
        description: "Disciplina inválida selecionada.",
        variant: "destructive",
      })
      return
    }

    const materialData = {
      nome: formData.nome,
      resumos: formData.resumos,
      links: formData.links,
      discId: discIdNumber,
    }

    onSubmit(materialData)
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
            <CardTitle>{material ? "Editar Material" : "Novo Material"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discId">
                Disciplina <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.discId} onValueChange={(value) => handleChange("discId", value)}>
                <SelectTrigger className={!formData.discId ? "border-red-300" : ""}>
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
              {!formData.discId && (
                <p className="text-sm text-red-500">Este campo é obrigatório</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Material</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Ex: Resumo de LEDA, Exercícios de Cálculo, Projeto Final..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumos">Descrição</Label>
              <Textarea
                id="resumos"
                value={formData.resumos}
                onChange={(e) => handleChange("resumos", e.target.value)}
                placeholder="Descrição opcional sobre o material, anotações importantes..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="links">Links Úteis</Label>
              <Textarea
                id="links"
                value={formData.links}
                onChange={(e) => handleChange("links", e.target.value)}
                placeholder="https://exemplo.com/calculo2&#10;https://youtube.com/watch?v=...&#10;https://drive.google.com/file/d/..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Adicione links para PDFs, vídeos, artigos ou arquivos no Google Drive/OneDrive (um link por linha)
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {material ? "Salvar Alterações" : "Criar Material"}
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
