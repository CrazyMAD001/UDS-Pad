// src/utils/fetch.ts
export interface FetchOptions extends RequestInit {
  query?: Record<string, string | number | boolean | null | undefined>
  timeout?: number // milliseconds, 0 = no timeout
  parseJson?: boolean // default true: attempt to parse JSON responses
}

function buildUrl(url: string, query?: FetchOptions['query']) {
  if (!query) return url
  console.log('Building URL with query:', window.location.origin)
  const u = new URL(
    url,
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
  )
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    u.searchParams.set(k, String(v))
  })
  return u.toString()
}

export async function fetcher<T = any>(input: string, opts: FetchOptions = {}): Promise<T> {
  const { query, timeout = 0, parseJson = true, headers = {}, body, ...rest } = opts

  const url = buildUrl(input, query)

  // prepare body & headers for JSON by default when passing a plain object
  let finalBody: BodyInit | undefined = body as BodyInit | undefined
  const mutableHeaders = new Headers(headers)
  const isPlainObject =
    body != null &&
    typeof body === 'object' &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer)

  if (isPlainObject) {
    if (!mutableHeaders.has('content-type')) {
      mutableHeaders.set('content-type', 'application/json; charset=utf-8')
    }
    finalBody = JSON.stringify(body)
  }

  const controller = new AbortController()
  const signal = controller.signal
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  if (timeout > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeout)
  }

  try {
    const res = await fetch(url, {
      ...rest,
      headers: mutableHeaders,
      body: finalBody,
      signal
    })
    console.log('headers', res.headers)
    const contentType = res.headers.get('content-type') || ''
    const tryParseJson = parseJson && contentType.includes('application/json')

    if (!res.ok) {
      // attempt to extract error body
      let errBody: any = null
      try {
        errBody = tryParseJson ? await res.json() : await res.text()
      } catch {
        /* ignore */
      }
      const err = new Error(`Fetch error: ${res.status} ${res.statusText}`)
      ;(err as any).status = res.status
      ;(err as any).body = errBody
      throw err
    }

    if (res.status === 204) return undefined as unknown as T
    if (tryParseJson) return (await res.json()) as T
    return (await res.text()) as unknown as T
  } catch (e: any) {
    if (e.name === 'AbortError') throw new Error('Fetch aborted (timeout?)')
    throw e
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export default fetcher
