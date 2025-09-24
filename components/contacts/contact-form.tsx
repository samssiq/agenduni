"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ContactFormProps {
  contact?: {
    id: number
    nome: string
    email: string
    telefone: string
    discId: number
  } | null
  subjects: Array<{ id: number; nome: string }>
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function ContactForm({ contact, subjects, onSubmit, onCancel }: ContactFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    discId: "",
  })

  useEffect(() => {
    if (contact) {
      setFormData({
        nome: contact.nome,
        email: contact.email,
        telefone: contact.telefone,
        discId: contact.discId.toString(),
      })
    }
  }, [contact])

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

    // Obter o usuário do localStorage
    const userString = typeof window !== 'undefined' ? localStorage.getItem("user") : null
    const user = userString ? JSON.parse(userString) : null

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

    const contactData = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      discId: discIdNumber,
      ...(user && !contact && { userId: user.id })
    }

    onSubmit(contactData)
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
            <CardTitle>{contact ? "Editar Contato" : "Novo Contato"}</CardTitle>
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
              <Select 
                value={formData.discId} 
                onValueChange={(value) => handleChange("discId", value)}
              >
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
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Ex: Prof. Silva, Monitor João"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="exemplo@universidade.edu.br"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {contact ? "Salvar Alterações" : "Criar Contato"}
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
