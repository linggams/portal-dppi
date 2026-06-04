export interface User {
  idUser: number
  username: string
  level: "user" | "administrator" | "it_support" | "purchasing"
  jabatan: string
}

export interface UserFormData {
  username: string
  password: string
  level: "" | "user" | "administrator" | "it_support" | "purchasing"
  jabatan: string
}
