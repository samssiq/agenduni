"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"

interface User {
  id: number
  nome: string
  email: string
}

export function SimpleProfileForm() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setNome(parsedUser.nome || "")
      setEmail(parsedUser.email || "")
    } else {
      router.push("/login")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado. Faça login novamente.",
        variant: "destructive",
      })
      return
    }

    if (!nome.trim() || !email.trim()) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await authAPI.updateProfile(user.id, nome.trim(), email.trim())

      const updatedUser = { ...user, nome: nome.trim(), email: email.trim() }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      setNome(nome.trim())
      setEmail(email.trim())

      window.dispatchEvent(new CustomEvent('userUpdated', { 
        detail: updatedUser 
      }))

      toast({
        title: "✅ Perfil atualizado com sucesso!",
        description: "Suas informações foram salvas e sincronizadas.",
        duration: 4000,
      })

    } catch (error: any) {
      let errorMessage = "Erro de conexão com o servidor"
      
      if (error.response?.status === 400 || error.response?.status === 409) {
        const serverMessage = error.response?.data?.message || error.response?.data?.error || ""
        
        if (serverMessage.toLowerCase().includes("email") && 
            (serverMessage.toLowerCase().includes("já existe") || 
             serverMessage.toLowerCase().includes("already exists") ||
             serverMessage.toLowerCase().includes("duplicat") ||
             serverMessage.toLowerCase().includes("unique"))) {
          errorMessage = "Este e-mail já está em uso por outro usuário."
        } else if (serverMessage) {
          errorMessage = serverMessage
        } else {
          errorMessage = "Dados inválidos. Verifique as informações."
        }
      } else if (error.response?.status === 401) {
        errorMessage = "Sessão expirada. Faça login novamente."
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
        return
      } else if (error.response?.data?.message || error.response?.data?.error) {
        errorMessage = error.response.data.message || error.response.data.error
      }

      toast({
        title: "Erro ao atualizar perfil",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome completo</Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome completo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
        >
          Voltar
        </Button>
      </div>
    </form>
  )
}
