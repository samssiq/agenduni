"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BookOpen, Clock, Users } from "lucide-react"
import { SubjectForm } from "@/components/subjects/subject-form"
import { ReminderForm } from "@/components/reminders/reminder-form"
import { ContactForm } from "@/components/contacts/contact-form"
import { MaterialForm } from "@/components/materials/material-form"
import { disciplinasAPI, lembretesAPI, contatosAPI, materiaisAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Disciplina {
  id: number
  nome: string
}

export function QuickActions() {
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [subjects, setSubjects] = useState<Disciplina[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await disciplinasAPI.getAll()
        setSubjects(response.data)
      } catch (error) {
        console.error("Error fetching subjects:", error)
      }
    }

    fetchSubjects()
  }, [])

  const handleAddSubject = async (subjectData: any) => {
    try {
      await disciplinasAPI.create(subjectData)
      const response = await disciplinasAPI.getAll()
      setSubjects(response.data)
      setShowSubjectForm(false)
      toast({
        title: "Sucesso",
        description: "Disciplina criada com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a disciplina",
        variant: "destructive",
      })
    }
  }

  const handleAddReminder = async (reminderData: any) => {
    try {
      await lembretesAPI.create(reminderData)
      setShowReminderForm(false)
      toast({
        title: "Sucesso",
        description: "Lembrete criado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o lembrete",
        variant: "destructive",
      })
    }
  }

  const handleAddContact = async (contactData: any) => {
    try {
      await contatosAPI.create(contactData)
      setShowContactForm(false)
      toast({
        title: "Sucesso",
        description: "Contato criado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o contato",
        variant: "destructive",
      })
    }
  }

  const handleAddMaterial = async (materialData: any) => {
    try {
      await materiaisAPI.create(materialData)
      setShowMaterialForm(false)
      toast({
        title: "Sucesso",
        description: "Material criado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o material",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              className="h-20 flex-col gap-2 bg-transparent"
              variant="outline"
              onClick={() => setShowSubjectForm(true)}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm">Nova Disciplina</span>
            </Button>

            <Button
              className="h-20 flex-col gap-2 bg-transparent"
              variant="outline"
              onClick={() => setShowReminderForm(true)}
            >
              <Clock className="h-5 w-5" />
              <span className="text-sm">Novo Lembrete</span>
            </Button>

            <Button
              className="h-20 flex-col gap-2 bg-transparent"
              variant="outline"
              onClick={() => setShowContactForm(true)}
            >
              <Users className="h-5 w-5" />
              <span className="text-sm">Novo Contato</span>
            </Button>

            <Button
              className="h-20 flex-col gap-2 bg-transparent"
              variant="outline"
              onClick={() => setShowMaterialForm(true)}
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-sm">Materiais</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {showSubjectForm && <SubjectForm onSubmit={handleAddSubject} onCancel={() => setShowSubjectForm(false)} />}

      {showReminderForm && (
        <ReminderForm onSuccess={() => setShowReminderForm(false)} onCancel={() => setShowReminderForm(false)} />
      )}

      {showContactForm && (
        <ContactForm subjects={subjects} onSubmit={handleAddContact} onCancel={() => setShowContactForm(false)} />
      )}

      {showMaterialForm && (
        <MaterialForm subjects={subjects} onSubmit={handleAddMaterial} onCancel={() => setShowMaterialForm(false)} />
      )}
    </>
  )
}
