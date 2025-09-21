"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, FileText, Link, Download } from "lucide-react"
import { MaterialForm } from "./material-form"

// Mock data - replace with actual API calls
const mockMaterials = [
  {
    id: 1,
    resumos: "Resumo sobre derivadas e integrais. Conceitos fundamentais de cálculo diferencial e integral.",
    links: "https://exemplo.com/calculo2\nhttps://youtube.com/watch?v=derivadas",
    arquivos: "lista_exercicios_1.pdf",
    discId: 1,
    disciplina: "Cálculo II",
  },
  {
    id: 2,
    resumos: "Anotações da aula sobre limites. Definições e propriedades dos limites de funções.",
    links: "https://exemplo.com/limites",
    arquivos: "slides_aula_5.pdf",
    discId: 1,
    disciplina: "Cálculo II",
  },
  {
    id: 3,
    resumos: "Conceitos de POO: herança, polimorfismo, encapsulamento. Exemplos em Java.",
    links: "https://docs.oracle.com/javase/tutorial/java/concepts/",
    arquivos: "projeto_exemplo.zip",
    discId: 2,
    disciplina: "POO",
  },
  {
    id: 4,
    resumos: "Normalização de banco de dados. Formas normais 1FN, 2FN, 3FN.",
    links: "https://exemplo.com/normalizacao",
    arquivos: "diagrama_er.png",
    discId: 3,
    disciplina: "Banco de Dados",
  },
]

const mockSubjects = [
  { id: 1, nome: "Cálculo II" },
  { id: 2, nome: "Programação Orientada a Objetos" },
  { id: 3, nome: "Banco de Dados" },
]

export function MaterialList() {
  const [materials, setMaterials] = useState(mockMaterials)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<(typeof mockMaterials)[0] | null>(null)

  const filteredMaterials = materials.filter(
    (material) =>
      material.resumos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.arquivos.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddMaterial = (materialData: any) => {
    const newMaterial = {
      ...materialData,
      id: Math.max(...materials.map((m) => m.id)) + 1,
      disciplina: mockSubjects.find((s) => s.id === materialData.discId)?.nome || "",
    }
    setMaterials([...materials, newMaterial])
    setShowForm(false)
  }

  const handleEditMaterial = (materialData: any) => {
    setMaterials(
      materials.map((m) =>
        m.id === editingMaterial?.id
          ? {
              ...materialData,
              id: editingMaterial.id,
              disciplina: mockSubjects.find((s) => s.id === materialData.discId)?.nome || "",
            }
          : m,
      ),
    )
    setEditingMaterial(null)
    setShowForm(false)
  }

  const handleDeleteMaterial = (id: number) => {
    setMaterials(materials.filter((m) => m.id !== id))
  }

  const groupedMaterials = filteredMaterials.reduce(
    (acc, material) => {
      if (!acc[material.disciplina]) {
        acc[material.disciplina] = []
      }
      acc[material.disciplina].push(material)
      return acc
    },
    {} as Record<string, typeof mockMaterials>,
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
            placeholder="Buscar materiais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

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
                        Material de Estudo
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
                    <div>
                      <h4 className="font-medium text-sm mb-2">Resumos e Anotações</h4>
                      <p className="text-sm text-muted-foreground">{material.resumos}</p>
                    </div>

                    {material.links && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Links Úteis</h4>
                        {renderLinks(material.links)}
                      </div>
                    )}

                    {material.arquivos && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Arquivos</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <button className="text-primary hover:underline">{material.arquivos}</button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Nenhum material encontrado.</p>
          {searchTerm === "" && (
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              Criar primeiro material
            </Button>
          )}
        </div>
      )}

      {showForm && (
        <MaterialForm
          material={editingMaterial}
          subjects={mockSubjects}
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
