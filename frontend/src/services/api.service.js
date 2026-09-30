import axios from 'axios'

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again."

class ApiError extends Error {
    constructor(message, status = 0, data = null) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.data = data
    }
}

let unauthorizedHandler = null

export const setUnauthorizedHandler = (handler) => {
    unauthorizedHandler = handler
}

const apiClient = axios.create({
    baseURL: "/api",
    withCredentials: true,
    timeout: 30000
})

function toApiError(error) {
    if (axios.isCancel(error)) {
        return new ApiError("The request was cancelled.")
    }
    if (error.response) {
        const { status, data } = error.response
        return new ApiError(data?.message || DEFAULT_ERROR_MESSAGE, status, data)
    }
    if (error.code === "ECONNABORTED") {
        return new ApiError("The request timed out. Please try again.")
    }
    if (error.request) {
        return new ApiError("Unable to reach the server. Please check your connection.")
    }
    return new ApiError(error.message || DEFAULT_ERROR_MESSAGE)
}

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const apiError = toApiError(error)
        if (apiError.status === 401) {
            unauthorizedHandler?.(apiError)
        }
        return Promise.reject(apiError)
    }
)

const request = async (config) => {
    const response = await apiClient.request(config)
    return response.data
}

export const api = {
    get: (url, config) => request({ ...config, method: "get", url }),
    post: (url, data, config) => request({ ...config, method: "post", url, data })
}
