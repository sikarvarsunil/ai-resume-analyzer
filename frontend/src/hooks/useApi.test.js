import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useApi from './useApi.js'

describe("useApi", () => {
    it("starts with no data and no error", () => {
        const { result } = renderHook(() => useApi(async () => "hello"))

        expect(result.current.data).toBe(null)
        expect(result.current.error).toBe(null)
        expect(result.current.isLoading).toBe(false)
    })

    it("stores the data when the request succeeds", async () => {
        const { result } = renderHook(() => useApi(async () => "hello"))

        await act(() => result.current.execute())

        expect(result.current.data).toBe("hello")
        expect(result.current.isSuccess).toBe(true)
    })

    it("stores the error message when the request fails", async () => {
        const { result } = renderHook(() => useApi(async () => {
            throw new Error("Server is down")
        }))

        await act(() => result.current.execute())

        expect(result.current.error).toBe("Server is down")
        expect(result.current.isSuccess).toBe(false)
    })
})
