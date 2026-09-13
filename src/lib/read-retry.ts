/** Retry only reads, once, when a connection fails. Never use for writes. */
export async function withReadRetry<T>(read: () => Promise<T>): Promise<T> {
    try {
        return await read()
    } catch (error) {
        const codes = new Set(['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND', 'CONNECTION_CLOSED', 'CONNECTION_ENDED', 'CONNECT_TIMEOUT', '57P01', '57P02', '57P03', '08006'])
        let cause: unknown = error
        let transient = false
        for (let depth = 0; depth < 5 && cause && typeof cause === 'object'; depth++) {
            const detail = cause as { code?: string; cause?: unknown }
            if (detail.code && codes.has(detail.code)) transient = true
            cause = detail.cause
        }
        if (!transient) throw error
        await new Promise(resolve => setTimeout(resolve, 250))
        return read()
    }
}
