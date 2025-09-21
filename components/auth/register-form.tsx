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

export function RegisterForm() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmSenha, setConfirmSenha] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (senha !== confirmSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    if (senha.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Criar usuário usando a API real
      const response = await authAPI.register(nome, email, senha)
      
      // Backend retorna: { id, nome, email, senha }
      const user = response.data

      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${user.nome}! Agora faça login.`,
      })

      // Redirecionar para página de login após registro
      router.push("/login")
    } catch (error: any) {
      console.error("Erro no registro:", error)
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Erro de conexão com o servidor"

      toast({
        title: "Erro ao criar conta",
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

      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmSenha">Confirmar senha</Label>
        <Input
          id="confirmSenha"
          type="password"
          placeholder="Digite a senha novamente"
          value={confirmSenha}
          onChange={(e) => setConfirmSenha(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Criando conta..." : "Criar Conta"}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Já tem uma conta? </span>
        <Link href="/login" className="text-primary hover:underline">
          Fazer login
        </Link>
      </div>
    </form>
  )
}