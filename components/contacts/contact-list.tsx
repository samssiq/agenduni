"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, Mail, Phone, User, Filter, Users } from "lucide-react"
import { ContactForm } from "./contact-form"
import { contatosAPI, disciplinasAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Contact {
  id: number
  nome: string
  email: string
  telefone: string
  discId: number
  disciplina?: string
}

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

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [contactsResponse, subjectsResponse] = await Promise.all([
        contatosAPI.getAll(),
        disciplinasAPI.getAll()
      ])
      
      const contactsWithSubject = (contactsResponse.data || []).map((contact: any) => ({
        ...contact,
        disciplina: subjectsResponse.data?.find((s: any) => s.id === contact.discId)?.nome || "Sem disciplina",
      }))
      
      setContacts(contactsWithSubject)
      setSubjects(subjectsResponse.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      setContacts([])
      setSubjects([])
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contatos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredContacts = contacts.filter(
    (contact: Contact) => {
      const matchesSearch = searchTerm === "" || 
        contact.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.telefone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.disciplina && contact.disciplina.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesSubject = selectedSubject === "all" || contact.discId.toString() === selectedSubject
      
      return matchesSearch && matchesSubject
    }
  )

  const groupedContacts = filteredContacts.reduce(
    (acc, contact) => {
      const disciplineName = contact.disciplina || "Sem disciplina"
      if (!acc[disciplineName]) {
        acc[disciplineName] = []
      }
      acc[disciplineName].push(contact)
      return acc
    },
    {} as Record<string, Contact[]>,
  )

  const handleAddContact = async (contactData: any) => {
    try {
      await contatosAPI.create(contactData)
      toast({
        title: "Contato criado!",
        description: "O contato foi adicionado com sucesso.",
      })
      fetchData()
      setShowForm(false)
    } catch (error) {
      console.error("Error creating contact:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o contato",
        variant: "destructive",
      })
    }
  }

  const handleEditContact = async (contactData: any) => {
    if (!editingContact) return
    
    try {
      await contatosAPI.update(editingContact.id, contactData)
      toast({
        title: "Contato atualizado!",
        description: "O contato foi editado com sucesso.",
      })
      fetchData()
      setEditingContact(null)
      setShowForm(false)
    } catch (error: any) {
      console.error("Erro ao atualizar contato:", error)
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Não foi possível atualizar o contato",
        variant: "destructive",
      })
    }
  }

  const handleDeleteContact = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este contato?")) {
      return
    }

    try {
      await contatosAPI.delete(id)
      toast({
        title: "Contato excluído",
        description: "O contato foi removido com sucesso.",
      })
      fetchData()
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o contato",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Contatos</h2>
        </div>
        <div className="text-center py-8">Carregando contatos...</div>
      </div>
    )
  }

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
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-64">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por disciplina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as disciplinas</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id.toString()}>
                {subject.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(searchTerm || selectedSubject !== "all") && (
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredContacts.length} de {contacts.length} contatos
          {selectedSubject !== "all" && (
            <span> • {subjects.find(s => s.id.toString() === selectedSubject)?.nome}</span>
          )}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedContacts).map(([disciplina, disciplinaContacts]) => (
          <div key={disciplina} className="space-y-4">
            <h3 className="text-lg font-medium text-primary flex items-center gap-2">
              <Users className="h-5 w-5" />
              {disciplina}
              <span className="text-sm text-muted-foreground font-normal">
                ({disciplinaContacts.length} {disciplinaContacts.length === 1 ? 'contato' : 'contatos'})
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(disciplinaContacts as Contact[]).map((contact: Contact) => (
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

      {Object.keys(groupedContacts).length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          {searchTerm || selectedSubject !== "all" ? (
            <>
              <h3 className="text-lg font-medium mb-2">Nenhum contato encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Tente ajustar os filtros ou buscar por outros termos.
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedSubject("all")
                  }}
                >
                  Limpar Filtros
                </Button>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Contato
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium mb-2">Nenhum contato cadastrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Adicione contatos importantes das suas disciplinas.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Contato
              </Button>
            </>
          )}
        </div>
      ) : null}

      {showForm && (
        <ContactForm
          contact={editingContact}
          subjects={subjects}
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
