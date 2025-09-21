import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  login: (email: string, senha: string) => api.post("/users/login", { email, senha }),
  register: (nome: string, email: string, senha: string) => api.post("/users", { nome, email, senha }),
}

export const disciplinasAPI = {
  getAll: () => {
    if (typeof window !== 'undefined') {
      const userString = localStorage.getItem("user")
      const user = userString ? JSON.parse(userString) : null
      if (user) {
        return api.get(`/disciplinas/disciplinas/${user.id}`)
      }
    }
    return Promise.reject(new Error("Usuário não encontrado"))
  },
  getById: (id: number) => api.get(`/disciplinas/${id}`),
  create: (data: any) => api.post("/disciplinas", {
    nome: data.nome,
    sala: data.sala,
    professor: data.professor,
    horario: data.horario,
    avaliacoes: data.avaliacoes || "",
    faltas: data.faltas || 0,
    notas: data.notas || 0,
    userId: data.userId
  }),
  update: (id: number, data: any) => api.patch(`/disciplinas/${id}`, data),
  delete: (id: number) => api.delete(`/disciplinas/${id}`),
}

export const lembretesAPI = {
  getAll: () => api.get("/lembretes"),
  getByDisciplina: (discId: number) => api.get(`/lembretes/disciplina/${discId}`),
  create: (data: any) => api.post("/lembretes", data),
  update: (id: number, data: any) => api.put(`/lembretes/${id}`, data),
  delete: (id: number) => api.delete(`/lembretes/${id}`),
}

export const contatosAPI = {
  getByDisciplina: (discId: number) => api.get(`/contatos/disciplina/${discId}`),
  create: (data: any) => api.post("/contatos", data),
  update: (id: number, data: any) => api.put(`/contatos/${id}`, data),
  delete: (id: number) => api.delete(`/contatos/${id}`),
}

export const materiaisAPI = {
  getByDisciplina: (discId: number) => api.get(`/materiais/disciplina/${discId}`),
  create: (data: FormData) =>
    api.post("/materiais", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: number, data: any) => api.put(`/materiais/${id}`, data),
  delete: (id: number) => api.delete(`/materiais/${id}`),
}
