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

export function ProfileForm() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    console.log("=== PERFIL USEEFFECT ===")
    // Carregar dados do usuário do localStorage
    const userData = localStorage.getItem("user")
    console.log("UserData do localStorage:", userData)
    if (userData) {
      const parsedUser = JSON.parse(userData)
      console.log("Parsed user:", parsedUser)
      setUser(parsedUser)
      setNome(parsedUser.nome)
      setEmail(parsedUser.email)
    } else {
      console.log("Sem dados de usuário, redirecionando para login")
      router.push("/login")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("=== PERFIL SUBMIT ===")
    console.log("Nome:", nome)
    console.log("Email:", email)
    console.log("User:", user)
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Dados do usuário não encontrados. Faça login novamente.",
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

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Atualizar dados do usuário
      const response = await authAPI.updateProfile(user.id, nome.trim(), email.trim())

      // Atualizar dados no localStorage
      const updatedUser = { ...user, nome: nome.trim(), email: email.trim() }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram atualizadas com sucesso.",
      })

    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error)
      
      // Tratamento específico de erros
      let errorMessage = "Erro de conexão com o servidor"
      
      if (error.response?.status === 400 || error.response?.status === 409) {
        const serverMessage = error.response?.data?.message || error.response?.data?.error || ""
        
        // Verificar se é erro de email duplicado
        if (serverMessage.toLowerCase().includes("email") && 
            (serverMessage.toLowerCase().includes("já existe") || 
             serverMessage.toLowerCase().includes("already exists") ||
             serverMessage.toLowerCase().includes("duplicat") ||
             serverMessage.toLowerCase().includes("unique") ||
             serverMessage.toLowerCase().includes("em uso"))) {
          errorMessage = "Este e-mail já está em uso por outro usuário."
        }
        else if (serverMessage.toLowerCase().includes("email") && serverMessage.toLowerCase().includes("inválido")) {
          errorMessage = "Formato de e-mail inválido."
        }
        else if (serverMessage) {
          errorMessage = serverMessage
        } else {
          errorMessage = "Dados inválidos. Verifique as informações e tente novamente."
        }
      }
      // Erro de autenticação
      else if (error.response?.status === 401) {
        errorMessage = "Sessão expirada. Faça login novamente."
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
        return
      }
      // Erro 500 - problema no servidor  
      else if (error.response?.status === 500) {
        errorMessage = "Erro interno do servidor. Tente novamente em alguns minutos."
      }
      // Outros erros do servidor
      else if (error.response?.data?.message || error.response?.data?.error) {
        errorMessage = error.response.data.message || error.response.data.error
      }
      // Erro de rede/conexão
      else if (error.code === 'NETWORK_ERROR' || !error.response) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
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
          type="text"
          placeholder="Seu nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
