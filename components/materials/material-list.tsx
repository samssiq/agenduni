"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, FileText, Link, Filter } from "lucide-react"
import { MaterialForm } from "./material-form"
import { materiaisAPI, disciplinasAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Material {
  id: number
  nome: string
  resumos: string
  links: string
  discId: number
  disciplina?: string
}

interface Subject {
  id: number
  nome: string
}

export function MaterialList() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const subjectsResponse = await disciplinasAPI.getAll()
      setSubjects(subjectsResponse.data || [])
      
      // Carrega os materiais do usuário
      const materialsResponse = await materiaisAPI.getAll()
      const materialsWithSubject = (materialsResponse.data || []).map((material: any) => ({
        ...material,
        disciplina: subjectsResponse.data?.find((s: any) => s.id === material.discId)?.nome || "Sem disciplina",
      }))
      setMaterials(materialsWithSubject)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMaterials = materials.filter(
    (material) => {
      const matchesSearch = searchTerm === "" ||
        material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.resumos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.disciplina && material.disciplina.toLowerCase().includes(searchTerm.toLowerCase())) ||
        material.links.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSubject = selectedSubject === "all" || material.discId.toString() === selectedSubject
      
      return matchesSearch && matchesSubject
    }
  )

  const handleAddMaterial = async (materialData: any) => {
    try {
      console.log('Enviando material:', materialData)
      const response = await materiaisAPI.create(materialData)
      console.log('Resposta da API:', response.data)
      
      const newMaterial = {
        ...response.data,
        disciplina: subjects.find((s) => s.id === materialData.discId)?.nome || "",
      }
      setMaterials([...materials, newMaterial])
      setShowForm(false)
      toast({
        title: "Material criado!",
        description: "O material foi adicionado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao criar material:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o material.",
        variant: "destructive",
      })
    }
  }

  const handleEditMaterial = async (materialData: any) => {
    if (!editingMaterial) return
    
    try {
      await materiaisAPI.update(editingMaterial.id, materialData)
      setMaterials(
        materials.map((m) =>
          m.id === editingMaterial.id
            ? {
                ...materialData,
                id: editingMaterial.id,
                disciplina: subjects.find((s) => s.id === materialData.discId)?.nome || "",
              }
            : m,
        ),
      )
      setEditingMaterial(null)
      setShowForm(false)
      toast({
        title: "Material atualizado!",
        description: "As alterações foram salvas com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao atualizar material:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o material.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este material?")) return
    
    try {
      await materiaisAPI.delete(id)
      setMaterials(materials.filter((m) => m.id !== id))
      toast({
        title: "Material excluído",
        description: "O material foi removido com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir material:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o material.",
        variant: "destructive",
      })
    }
  }

  const groupedMaterials = filteredMaterials.reduce(
    (acc, material) => {
      const disciplina = material.disciplina || "Sem disciplina"
      if (!acc[disciplina]) {
        acc[disciplina] = []
      }
      acc[disciplina].push(material)
      return acc
    },
    {} as Record<string, Material[]>,
  )

  const renderLinks = (links: string) => {
    if (!links) return null

    const linkList = links.split("\n").filter((link) => link.trim())
    return (
      <div className="space-y-1">
        {linkList.map((link, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <Link className="h-3 w-3 text-muted-foreground" />
            <a href={link.trim()} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {link.trim().length > 40 ? `${link.trim().substring(0, 40)}...` : link.trim()}
            </a>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Materiais de Estudo</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Material
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, descrição ou links..."
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
          Mostrando {filteredMaterials.length} de {materials.length} materiais
          {selectedSubject !== "all" && (
            <span> • {subjects.find(s => s.id.toString() === selectedSubject)?.nome}</span>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-pulse">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Carregando materiais...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {Object.entries(groupedMaterials).map(([disciplina, disciplinaMaterials]) => (
              <div key={disciplina} className="space-y-4">
                <h3 className="text-lg font-medium text-primary">{disciplina}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disciplinaMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {material.nome}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingMaterial(material)
                            setShowForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteMaterial(material.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {material.resumos && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Descrição</h4>
                        <p className="text-sm text-muted-foreground">{material.resumos}</p>
                      </div>
                    )}

                    {material.links && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Links Úteis</h4>
                        {renderLinks(material.links)}
                      </div>
                    )}
                  </CardContent>
                </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(groupedMaterials).length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              {searchTerm || selectedSubject !== "all" ? (
                <>
                  <h3 className="text-lg font-medium mb-2">Nenhum material encontrado</h3>
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
                      Novo Material
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">Nenhum material cadastrado</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Crie materiais de estudo para organizar seus recursos acadêmicos.
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Material
                  </Button>
                </>
              )}
            </div>
          ) : null}
        </>
      )}

      {showForm && (
        <MaterialForm
          material={editingMaterial}
          subjects={subjects}
          onSubmit={editingMaterial ? handleEditMaterial : handleAddMaterial}
          onCancel={() => {
            setShowForm(false)
            setEditingMaterial(null)
          }}
        />
      )}
    </div>
  )
}