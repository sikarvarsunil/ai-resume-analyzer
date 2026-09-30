import { AxiosError } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, setUnauthorizedHandler } from './api.service.js'

// Stands in for the server, so no real HTTP request is made.
function fakeServer(status, data) {
    return async (config) => {
        const response = { status, data, headers: {}, config }
        if (status >= 400) {
            throw new AxiosError("Request failed", "ERR_BAD_RESPONSE", config, {}, response)
        }
        return response
    }
}

describe("api service", () => {
    afterEach(() => {
        setUnauthorizedHandler(null)
    })

    it("returns the response body", async () => {
        const data = await api.get("/auth/get-me", { adapter: fakeServer(200, { user: "sam" }) })

        expect(data).toEqual({ user: "sam" })
    })

    it("uses the server's error message", async () => {
        const request = api.get("/interview", { adapter: fakeServer(500, { message: "Invalid AI response" }) })

        await expect(request).rejects.toThrow("Invalid AI response")
    })

    it("uses a generic message when the server sends none", async () => {
        const request = api.get("/interview", { adapter: fakeServer(500, null) })

        await expect(request).rejects.toThrow("Something went wrong. Please try again.")
    })

    it("explains timeouts", async () => {
        const timeout = async (config) => {
            throw new AxiosError("timeout", "ECONNABORTED", config, {})
        }

        await expect(api.get("/interview", { adapter: timeout })).rejects.toThrow("The request timed out. Please try again.")
    })

    it("calls the unauthorized handler when the server returns 401", async () => {
        const onUnauthorized = vi.fn()
        setUnauthorizedHandler(onUnauthorized)

        await expect(api.get("/auth/get-me", { adapter: fakeServer(401, { message: "Invalid Token" }) })).rejects.toThrow()

        expect(onUnauthorized).toHaveBeenCalled()
    })
})
