import { Preferences } from '@capacitor/preferences'

type Nullable<T> = T | null

/**
 * 基于 Capacitor Preferences 的通用本地存储组合式函数
 * - 提供 get/set/remove/clear/has
 * - 提供 useStorageRef 创建与偏好存储双向绑定的响应式引用
 */

/** 读取原始字符串值 */
async function getRaw(key: string): Promise<Nullable<string>> {
  try {
    const { value } = await Preferences.get({ key })
    return value ?? null
  } catch (err) {
    console.error(`[useConfig] get ${key} error:`, err)
    return null
  }
}

/** 设置原始字符串值 */
async function setRaw(key: string, value: string): Promise<boolean> {
  try {
    await Preferences.set({ key, value })
    return true
  } catch (err) {
    console.error(`[useConfig] set ${key} error:`, err)
    return false
  }
}

/** 删除键 */
async function remove(key: string): Promise<boolean> {
  try {
    await Preferences.remove({ key })
    return true
  } catch (err) {
    console.error(`[useConfig] remove ${key} error:`, err)
    return false
  }
}

/** 清空所有偏好（谨慎使用） */
async function clear(): Promise<boolean> {
  try {
    await Preferences.clear()
    return true
  } catch (err) {
    console.error('[useConfig] clear error:', err)
    return false
  }
}

/** 判断是否存在某键 */
async function hasKey(key: string): Promise<boolean> {
  try {
    const { keys } = await Preferences.keys()
    return keys.includes(key)
  } catch (err) {
    console.error(`[useConfig] hasKey ${key} error:`, err)
    return false
  }
}

/** 获取并解析为泛型对象（如果不存在返回 null 或默认值） */
async function get<T = any>(key: string, defaultValue?: T): Promise<Nullable<T>> {
  const raw = await getRaw(key)
  if (raw == null) return defaultValue ?? null
  try {
    return JSON.parse(raw) as T
  } catch (err) {
    // 如果不是 JSON，则当作字符串返回（仅在 T = string 时合理）
    return raw as unknown as T
  }
}

/** 设置泛型值（会 JSON.stringify） */
async function set<T = any>(key: string, value: T): Promise<boolean> {
  const toStore = typeof value === 'string' ? (value as unknown as string) : JSON.stringify(value)
  return setRaw(key, toStore)
}

export { getRaw, setRaw, get, set, remove, clear, hasKey }
