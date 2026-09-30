import { api } from '../../services/api.service.js'

export const loginUser = ({ email, password }) =>
    api.post("/auth/login", { email, password })

export const registerUser = ({ username, email, password }) =>
    api.post("/auth/register", { username, email, password })

export const logoutUser = () => api.post("/auth/logout")

export const getCurrentUser = () => api.get("/auth/get-me")
