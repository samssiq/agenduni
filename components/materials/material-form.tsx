"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Upload } from "lucide-react"

interface MaterialFormProps {
  material?: {
    id: number
    resumos: string
    links: string
    arquivos: string
    discId: number
  } | null
  subjects: Array<{ id: number; nome: string }>
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function MaterialForm({ material, subjects, onSubmit, onCancel }: MaterialFormProps) {
  const [formData, setFormData] = useState({
    resumos: "",
    links: "",
    arquivos: "",
    discId: "",
  })

  useEffect(() => {
    if (material) {
      setFormData({
        resumos: material.resumos,
        links: material.links,
        arquivos: material.arquivos,
        discId: material.discId.toString(),
      })
    }
  }, [material])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const materialData = {
      resumos: formData.resumos,
      links: formData.links,
      arquivos: formData.arquivos,
      discId: Number.parseInt(formData.discId),
    }

    onSubmit(materialData)
  }

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file and get a URL
      setFormData((prev) => ({
        ...prev,
        arquivos: file.name,
      }))
    }
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
              <Label htmlFor="resumos">Resumos e Anotações</Label>
              <Textarea
                id="resumos"
                value={formData.resumos}
                onChange={(e) => handleChange("resumos", e.target.value)}
                placeholder="Resumo sobre derivadas e integrais, anotações da aula..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="links">Links Úteis</Label>
              <Textarea
                id="links"
                value={formData.links}
                onChange={(e) => handleChange("links", e.target.value)}
                placeholder="https://exemplo.com/calculo2&#10;https://youtube.com/watch?v=..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arquivos">Arquivos</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    id="arquivos"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("arquivos")?.click()}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Selecionar Arquivo
                  </Button>
                </div>
                {formData.arquivos && (
                  <p className="text-sm text-muted-foreground">Arquivo selecionado: {formData.arquivos}</p>
                )}
              </div>
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
