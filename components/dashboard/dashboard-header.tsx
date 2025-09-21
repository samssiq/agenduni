"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User, BookOpen, Clock, Users, FileText } from "lucide-react"

export function DashboardHeader() {
  const [user, setUser] = useState<{ nome: string; email: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (!user) return null

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard">
              <div>
                <h1 className="text-2xl font-bold text-primary">AgendUni</h1>
                <p className="text-sm text-muted-foreground">Bem-vindo, {user.nome}</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/subjects" className="flex items-center gap-2 text-sm hover:text-primary">
                <BookOpen className="h-4 w-4" />
                Disciplinas
              </Link>
              <Link href="/reminders" className="flex items-center gap-2 text-sm hover:text-primary">
                <Clock className="h-4 w-4" />
                Lembretes
              </Link>
              <Link href="/contacts" className="flex items-center gap-2 text-sm hover:text-primary">
                <Users className="h-4 w-4" />
                Contatos
              </Link>
              <Link href="/materials" className="flex items-center gap-2 text-sm hover:text-primary">
                <FileText className="h-4 w-4" />
                Materiais
              </Link>
            </nav>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.nome.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
