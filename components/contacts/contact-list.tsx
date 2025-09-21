"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, Mail, Phone, User } from "lucide-react"
import { ContactForm } from "./contact-form"

// Mock data - replace with actual API calls
const mockContacts = [
  {
    id: 1,
    nome: "Prof. Silva",
    email: "silva@universidade.edu.br",
    telefone: "(11) 99999-9999",
    discId: 1,
    disciplina: "Cálculo II",
  },
  {
    id: 2,
    nome: "Monitor João",
    email: "joao.monitor@universidade.edu.br",
    telefone: "(11) 88888-8888",
    discId: 1,
    disciplina: "Cálculo II",
  },
  {
    id: 3,
    nome: "Prof. Santos",
    email: "santos@universidade.edu.br",
    telefone: "(11) 77777-7777",
    discId: 2,
    disciplina: "POO",
  },
  {
    id: 4,
    nome: "Prof. Oliveira",
    email: "oliveira@universidade.edu.br",
    telefone: "(11) 66666-6666",
    discId: 3,
    disciplina: "Banco de Dados",
  },
]

const mockSubjects = [
  { id: 1, nome: "Cálculo II" },
  { id: 2, nome: "Programação Orientada a Objetos" },
  { id: 3, nome: "Banco de Dados" },
]

export function ContactList() {
  const [contacts, setContacts] = useState(mockContacts)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<(typeof mockContacts)[0] | null>(null)

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.disciplina.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddContact = (contactData: any) => {
    const newContact = {
      ...contactData,
      id: Math.max(...contacts.map((c) => c.id)) + 1,
      disciplina: mockSubjects.find((s) => s.id === contactData.discId)?.nome || "",
    }
    setContacts([...contacts, newContact])
    setShowForm(false)
  }

  const handleEditContact = (contactData: any) => {
    setContacts(
      contacts.map((c) =>
        c.id === editingContact?.id
          ? {
              ...contactData,
              id: editingContact.id,
              disciplina: mockSubjects.find((s) => s.id === contactData.discId)?.nome || "",
            }
          : c,
      ),
    )
    setEditingContact(null)
    setShowForm(false)
  }

  const handleDeleteContact = (id: number) => {
    setContacts(contacts.filter((c) => c.id !== id))
  }

  const groupedContacts = filteredContacts.reduce(
    (acc, contact) => {
      if (!acc[contact.disciplina]) {
        acc[contact.disciplina] = []
      }
      acc[contact.disciplina].push(contact)
      return acc
    },
    {} as Record<string, typeof mockContacts>,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Contatos</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Contato
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contatos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedContacts).map(([disciplina, disciplinaContacts]) => (
          <div key={disciplina} className="space-y-4">
            <h3 className="text-lg font-medium text-primary">{disciplina}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {disciplinaContacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {contact.nome}
                        </CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingContact(contact)
                            setShowForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteContact(contact.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                        {contact.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${contact.telefone}`} className="text-primary hover:underline">
                        {contact.telefone}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Nenhum contato encontrado.</p>
          {searchTerm === "" && (
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              Criar primeiro contato
            </Button>
          )}
        </div>
      )}

      {showForm && (
        <ContactForm
          contact={editingContact}
          subjects={mockSubjects}
          onSubmit={editingContact ? handleEditContact : handleAddContact}
          onCancel={() => {
            setShowForm(false)
            setEditingContact(null)
          }}
        />
      )}
    </div>
  )
}
