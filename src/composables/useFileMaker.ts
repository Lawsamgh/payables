/**
 * FileMaker Data API integration composable.
 */

import { ref, computed } from 'vue'
import axios from 'axios'
import type { ConnectionStatus, FileMakerCredentials, FindOptions } from '../types'
import { getBaseUrl, getAuthHeaders, parseFileMakerError } from '../utils/filemakerApi'

const STORAGE_KEY_TOKEN = 'fm_session_token'

function loadStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_TOKEN)
  } catch {
    return null
  }
}

const storedToken = loadStoredToken()
const sessionToken = ref<string | null>(storedToken)
const connectionStatus = ref<ConnectionStatus>(
  storedToken && getBaseUrl()?.trim() ? 'connected' : 'idle'
)
const lastError = ref<string | null>(null)

function createApi(token: string) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(token),
  }
  return axios.create({
    baseURL: getBaseUrl(),
    headers,
    timeout: 15000,
  })
}

export interface FileMakerFieldData {
  [key: string]: string | number | null | undefined
}

/**
 * Get a FileMaker Data API session token by POST to /sessions with HTTP Basic auth.
 * Requires VITE_FILEMAKER_BASE_URL (e.g. https://your-server/fmi/data/v1/databases/YourDB)
 * and credentials (VITE_FILEMAKER_USER, VITE_FILEMAKER_PASSWORD). The token is stored
 * and sent as Bearer on all subsequent API calls.
 */
export async function login(credentials: FileMakerCredentials): Promise<boolean> {
  const baseUrl = getBaseUrl()
  if (!baseUrl?.trim()) {
    connectionStatus.value = 'error'
    lastError.value = 'FileMaker base URL not set. Add VITE_FILEMAKER_BASE_URL to .env (e.g. https://your-server/fmi/data/v1/databases/YourDB).'
    return false
  }
  const url = baseUrl.replace(/\/$/, '') + '/sessions'
  connectionStatus.value = 'connecting'
  lastError.value = null
  try {
    const res = await axios.post<{ response?: { token?: string } }>(
      url,
      {},
      {
        auth: {
          username: credentials.username,
          password: String(credentials.password ?? ''),
        },
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    )
    const tokenFromBody = res.data?.response?.token
    const tokenFromHeader = res.headers?.['x-fm-data-access-token'] ?? res.headers?.['X-FM-Data-Access-Token']
    const token = typeof tokenFromBody === 'string' ? tokenFromBody : typeof tokenFromHeader === 'string' ? tokenFromHeader : null
    if (token) {
      sessionToken.value = token
      connectionStatus.value = 'connected'
      try {
        localStorage.setItem(STORAGE_KEY_TOKEN, token)
      } catch {
        /* ignore */
      }
      return true
    }
    lastError.value = 'FileMaker did not return a session token. Ensure the account has the fmapi extended privilege in FileMaker.'
    connectionStatus.value = 'error'
    return false
  } catch (err) {
    const msg = parseFileMakerError(err)
    lastError.value = msg
    connectionStatus.value = 'error'
    return false
  }
}

export function logout(): void {
  sessionToken.value = null
  connectionStatus.value = 'idle'
  lastError.value = null
  try {
    localStorage.removeItem(STORAGE_KEY_TOKEN)
  } catch {
    /* ignore */
  }
}

/** Check if user is authenticated (has valid session token). Used by router guard. */
export function isAuthenticated(): boolean {
  return connectionStatus.value === 'connected'
}

export interface FindResult<T = FileMakerFieldData> {
  data: T[]
  error: string | null
}

/** Record with id returned by FileMaker list endpoint */
export interface FindRecordWithId<T = FileMakerFieldData> {
  recordId: string
  fieldData: T
}

export interface FindResultWithIds<T = FileMakerFieldData> {
  data: FindRecordWithId<T>[]
  error: string | null
}

export async function findRecords<T = FileMakerFieldData>(
  layout: string,
  options: FindOptions = {}
): Promise<FindResult<T>> {
  const token = sessionToken.value
  if (!token) {
    lastError.value = 'Not authenticated'
    return { data: [], error: lastError.value }
  }
  const api = createApi(token)
  try {
    const params: Record<string, string> = {}
    if (options.limit != null) params._limit = String(options.limit)
    if (options.offset != null) params._offset = String(options.offset)
    if (options.sort != null) params._sort = String(options.sort)
    const res = await api.get<{ response?: { data?: Array<{ fieldData?: T }> }; messages?: Array<{ code?: string }> }>(
      `/layouts/${layout}/records`,
      { params }
    )
    const list = res.data?.response?.data ?? []
    const data = list.map((r) => (r && typeof r === 'object' && 'fieldData' in r ? r.fieldData : r) as T)
    const msg = res.data?.messages?.[0]
    if (msg && msg.code !== undefined && String(msg.code) !== '0') {
      lastError.value = (res.data as { messages?: Array<{ message?: string }> }).messages?.[0]?.message ?? `Error ${msg.code}`
      return { data: [], error: lastError.value }
    }
    return { data, error: null }
  } catch (err) {
    const msg = parseFileMakerError(err)
    lastError.value = msg
    return { data: [], error: msg }
  }
}

/** Like findRecords but returns recordId with each record (for list views / navigation). */
export async function findRecordsWithIds<T = FileMakerFieldData>(
  layout: string,
  options: FindOptions = {}
): Promise<FindResultWithIds<T>> {
  const token = sessionToken.value
  if (!token) {
    lastError.value = 'Not authenticated'
    return { data: [], error: lastError.value }
  }
  const api = createApi(token)
  try {
    const params: Record<string, string> = {}
    if (options.limit != null) params._limit = String(options.limit)
    if (options.offset != null) params._offset = String(options.offset)
    if (options.sort != null) params._sort = String(options.sort)
    const res = await api.get<{
      response?: { data?: Array<{ recordId?: string | number; fieldData?: T }> }
      messages?: Array<{ code?: string }>
    }>(`/layouts/${layout}/records`, { params })
    const list = res.data?.response?.data ?? []
    const msg = res.data?.messages?.[0]
    if (msg && msg.code !== undefined && String(msg.code) !== '0') {
      lastError.value = (res.data as { messages?: Array<{ message?: string }> }).messages?.[0]?.message ?? `Error ${msg.code}`
      return { data: [], error: lastError.value }
    }
    return {
      data: list.map((r) => ({
        recordId: r?.recordId != null ? String(r.recordId) : '',
        fieldData: (r && 'fieldData' in r ? r.fieldData : r) as T,
      })),
      error: null,
    }
  } catch (err) {
    const msg = parseFileMakerError(err)
    lastError.value = msg
    return { data: [], error: msg }
  }
}

/** Find records by field criteria (exact match). Used e.g. to check if invoice number already exists. */
export async function findRecordsByQuery<T = FileMakerFieldData>(
  layout: string,
  query: Record<string, string | number>,
  limit = 1
): Promise<FindResult<T>> {
  const token = sessionToken.value
  if (!token) {
    lastError.value = 'Not authenticated'
    return { data: [], error: lastError.value }
  }
  if (Object.keys(query).length === 0) {
    return { data: [], error: null }
  }
  // FileMaker requires "=value" for exact match in find requests
  const queryExact: Record<string, string> = {}
  for (const [key, val] of Object.entries(query)) {
    if (val !== undefined && val !== null && val !== '') {
      queryExact[key] = '=' + String(val).trim()
    }
  }
  if (Object.keys(queryExact).length === 0) {
    return { data: [], error: null }
  }
  const api = createApi(token)
  try {
    const res = await api.post<{
      response?: { data?: Array<{ recordId?: string; fieldData?: T }> }
      messages?: Array<{ code?: string; message?: string }>
    }>(`/layouts/${layout}/_find`, {
      query: [queryExact],
      limit: String(limit),
    })
    const list = res.data?.response?.data ?? []
    const msg = res.data?.messages?.[0]
    // FileMaker returns code "401" for "No records match the request" - this is NOT an error,
    // it means no duplicates were found, which is what we want
    if (msg && msg.code !== undefined && String(msg.code) !== '0' && String(msg.code) !== '401') {
      lastError.value = msg.message ?? `Error ${msg.code}`
      return { data: [], error: lastError.value }
    }
    const data = list.map((r) => (r && typeof r === 'object' && 'fieldData' in r ? r.fieldData : r) as T)
    return { data, error: null }
  } catch (err) {
    // Check if this is a "No records match" error before parsing
    const errObj = err as { response?: { data?: { messages?: Array<{ code?: string | number; message?: string }> } } }
    const messages = errObj.response?.data?.messages
    if (messages && messages.length > 0) {
      const code = String(messages[0].code ?? '')
      const message = messages[0].message ?? ''
      // FileMaker returns code "401" or message "No records match" - this is NOT an error for duplicate checking
      // It means no duplicates were found, which is what we want
      if (code === '401' || code === '0' || message.toLowerCase().includes('no records match')) {
        return { data: [], error: null }
      }
    }
    const msg = parseFileMakerError(err)
    // Also check the parsed message in case the structure is different
    if (msg && (msg.toLowerCase().includes('no records match') || msg.includes('401'))) {
      return { data: [], error: null }
    }
    lastError.value = msg
    return { data: [], error: msg }
  }
}

/** Find records by query, returning recordId with each (for toggling/deleting). */
export async function findRecordsByQueryWithIds<T = FileMakerFieldData>(
  layout: string,
  query: Record<string, string | number>,
  limit = 100
): Promise<FindResultWithIds<T>> {
  const token = sessionToken.value
  if (!token) {
    lastError.value = 'Not authenticated'
    return { data: [], error: lastError.value }
  }
  if (Object.keys(query).length === 0) {
    return { data: [], error: null }
  }
  const queryExact: Record<string, string> = {}
  for (const [key, val] of Object.entries(query)) {
    if (val !== undefined && val !== null && val !== '') {
      queryExact[key] = '=' + String(val).trim()
    }
  }
  if (Object.keys(queryExact).length === 0) {
    return { data: [], error: null }
  }
  const api = createApi(token)
  try {
    const res = await api.post<{
      response?: { data?: Array<{ recordId?: string | number; fieldData?: T }> }
      messages?: Array<{ code?: string; message?: string }>
    }>(`/layouts/${layout}/_find`, {
      query: [queryExact],
      limit: String(limit),
    })
    const list = res.data?.response?.data ?? []
    const msg = res.data?.messages?.[0]
    // FileMaker returns code "401" for "No records match the request" - this is NOT an error,
    // it means no duplicates were found, which is what we want
    if (msg && msg.code !== undefined && String(msg.code) !== '0' && String(msg.code) !== '401') {
      lastError.value = msg.message ?? `Error ${msg.code}`
      return { data: [], error: lastError.value }
    }
    const data: FindRecordWithId<T>[] = list.map((r) => ({
      recordId: r?.recordId != null ? String(r.recordId) : '',
      fieldData: (r && typeof r === 'object' && 'fieldData' in r ? r.fieldData : r) as T,
    }))
    return { data, error: null }
  } catch (err) {
    // Check if this is a "No records match" error before parsing
    const errObj = err as { response?: { data?: { messages?: Array<{ code?: string | number; message?: string }> } } }
    const messages = errObj.response?.data?.messages
    if (messages && messages.length > 0) {
      const code = String(messages[0].code ?? '')
      const message = messages[0].message ?? ''
      // FileMaker returns code "401" or message "No records match" - this is NOT an error for duplicate checking
      // It means no duplicates were found, which is what we want
      if (code === '401' || code === '0' || message.toLowerCase().includes('no records match')) {
        return { data: [], error: null }
      }
    }
    const msg = parseFileMakerError(err)
    // Also check the parsed message in case the structure is different
    if (msg && (msg.toLowerCase().includes('no records match') || msg.includes('401'))) {
      return { data: [], error: null }
    }
    lastError.value = msg
    return { data: [], error: msg }
  }
}

/** Remove undefined so FileMaker receives only defined field values. Allows 0 for numeric fields. */
function sanitizeFieldData(
  data: FileMakerFieldData,
  opts?: { allowEmptyStrings?: boolean }
): Record<string, string | number> {
  const allowEmpty = opts?.allowEmptyStrings === true
  const out: Record<string, string | number> = {}
  for (const [k, v] of Object.entries(data)) {
    const keep =
      v !== undefined &&
      v !== null &&
      (typeof v === 'number' || allowEmpty || v !== '')
    if (keep) {
      out[k] = typeof v === 'number' ? v : String(v)
    }
  }
  return out
}

export async function createRecord(
  layout: string,
  fieldData: FileMakerFieldData
): Promise<{ id: string | null; error: string | null }> {
  const token = sessionToken.value
  if (!token) return { id: null, error: 'Not authenticated' }
  const api = createApi(token)
  const payload = sanitizeFieldData(fieldData)
  try {
    const res = await api.post<{ response?: { recordId?: string } }>(
      `/layouts/${layout}/records`,
      { fieldData: payload }
    )
    const id = res.data?.response?.recordId ?? null
    return { id, error: null }
  } catch (err) {
    return { id: null, error: parseFileMakerError(err) }
  }
}

/** Get a single record by id; returns fieldData so you can read auto-generated fields (e.g. TransRef). */
export async function getRecord<T = FileMakerFieldData>(
  layout: string,
  recordId: string
): Promise<{ data: T | null; error: string | null }> {
  const token = sessionToken.value
  if (!token) return { data: null, error: 'Not authenticated' }
  const api = createApi(token)
  try {
    const res = await api.get<{ response?: { data?: Array<{ fieldData: T }> } }>(
      `/layouts/${layout}/records/${recordId}`
    )
    const fieldData = res.data?.response?.data?.[0]?.fieldData ?? null
    return { data: fieldData, error: null }
  } catch (err) {
    return { data: null, error: parseFileMakerError(err) }
  }
}

export async function updateRecord(
  layout: string,
  recordId: string,
  fieldData: FileMakerFieldData,
  opts?: { allowEmptyStrings?: boolean }
): Promise<{ error: string | null }> {
  const token = sessionToken.value
  if (!token) return { error: 'Not authenticated' }
  if (!recordId || String(recordId).trim() === '') return { error: 'Invalid record ID' }
  const api = createApi(token)
  const payload = sanitizeFieldData(fieldData, opts)
  try {
    await api.patch(`/layouts/${layout}/records/${recordId}`, { fieldData: payload })
    return { error: null }
  } catch (err) {
    return { error: parseFileMakerError(err) }
  }
}

export async function deleteRecord(
  layout: string,
  recordId: string
): Promise<{ error: string | null }> {
  const token = sessionToken.value
  if (!token) return { error: 'Not authenticated' }
  const api = createApi(token)
  try {
    await api.delete(`/layouts/${layout}/records/${recordId}`)
    return { error: null }
  } catch (err) {
    return { error: parseFileMakerError(err) }
  }
}

export function useFileMaker() {
  const status = computed<ConnectionStatus>(() => connectionStatus.value)
  const error = computed(() => lastError.value)
  const isConnected = computed(() => connectionStatus.value === 'connected')
  const hasBaseUrl = computed(() => !!getBaseUrl()?.trim())

  return {
    status,
    error,
    isConnected,
    hasBaseUrl,
    login,
    logout,
    findRecords,
    findRecordsWithIds,
    findRecordsByQuery,
    findRecordsByQueryWithIds,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    getToken: () => sessionToken.value,
  }
}
