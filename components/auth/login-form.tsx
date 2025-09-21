"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authAPI.login(email, senha)
      
      // Assumindo que o backend retorna { user: {...}, token: "..." }
      const { user, token } = response.data

      // Salvar dados no localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${user.nome}!`,
      })

      // Redirecionar para dashboard após login
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Erro no login:", error)
      
      // Tratamento específico de erros de login
      let errorMessage = "Erro de conexão com o servidor"
      
      if (error.response?.status === 401 || error.response?.status === 400) {
        const serverMessage = error.response?.data?.message || error.response?.data?.error || ""
        
        // Verificar se são credenciais inválidas
        if (serverMessage.toLowerCase().includes("credenciais") ||
            serverMessage.toLowerCase().includes("email") ||
            serverMessage.toLowerCase().includes("senha") ||
            serverMessage.toLowerCase().includes("invalid") ||
            serverMessage.toLowerCase().includes("incorrect")) {
          errorMessage = "E-mail ou senha incorretos. Verifique suas credenciais e tente novamente."
        }
        else if (serverMessage.toLowerCase().includes("usuário") && serverMessage.toLowerCase().includes("não encontrado")) {
          errorMessage = "Usuário não encontrado. Verifique o e-mail ou crie uma nova conta."
        }
        else if (serverMessage) {
          errorMessage = serverMessage
        } else {
          errorMessage = "Dados de login inválidos."
        }
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
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Não tem uma conta? </span>
        <Link href="/register" className="text-primary hover:underline">
          Cadastre-se
        </Link>
      </div>
    </form>
  )
}
