import { useCallback, useRef, useState } from 'react'

const API_STATUS = {
    IDLE: "idle",
    LOADING: "loading",
    SUCCESS: "success",
    ERROR: "error"
}

const initialState = { status: API_STATUS.IDLE, data: null, error: null }

/**
 * Tracks the status of an async API function.
 * `execute` never throws: it resolves to `{ data, error }` so callers can branch on the result.
 * `apiFn` must be stable (defined at module level or memoized) to keep `execute` stable.
 */
export default function useApi(apiFn) {
    const [state, setState] = useState(initialState)
    const latestRequestId = useRef(0)

    const execute = useCallback(async (...args) => {
        const requestId = ++latestRequestId.current
        setState({ status: API_STATUS.LOADING, data: null, error: null })

        try {
            const data = await apiFn(...args)
            if (requestId === latestRequestId.current) {
                setState({ status: API_STATUS.SUCCESS, data, error: null })
            }
            return { data, error: null }
        } catch (err) {
            const error = err?.message || "Something went wrong. Please try again."
            if (requestId === latestRequestId.current) {
                setState({ status: API_STATUS.ERROR, data: null, error })
            }
            return { data: null, error }
        }
    }, [apiFn])

    return {
        ...state,
        isLoading: state.status === API_STATUS.LOADING,
        isSuccess: state.status === API_STATUS.SUCCESS,
        execute
    }
}
