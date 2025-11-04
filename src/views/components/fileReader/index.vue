<!--
  功能：功能描述
  时间：2025年11月04日 23:35:03
-->
<template>
  <FileBrowser @fileSelected="readFileContent"></FileBrowser>

  <div v-if="fileContent">
    <h3>文件内容</h3>
    <pre>{{ fileContent }}</pre>
  </div>
</template>
<script setup lang="ts">
import FileBrowser from './FileBrowser.vue'
// @ts-ignore: Unable to find type declarations for 'xlsx'
import * as XLSX from 'xlsx'
import { modalController } from '@ionic/vue'
import { ref } from 'vue'
import { Filesystem } from '@capacitor/filesystem'
const fileContent = ref<any>(null)
const readFileContent = async (file: { uri: any }) => {
  console.log('选中文件:', file)
  try {
    // 读取文件内容
    const contents = await Filesystem.readFile({
      path: file.uri
    })

    const base64Data = contents.data as string
    // 显示文件内容
    const arrayBuffer = base64ToArrayBuffer(base64Data)
    //

    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]

    fileContent.value = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

    modalController.dismiss(fileContent.value, 'onFileRead')
  } catch (error: unknown) {
    console.error('读取文件出错:', error)
    const message = error instanceof Error ? error.message : String(error)
    fileContent.value = `无法读取文件: ${message}`
  }
}
/**
 * 将 base64 转换为 ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes.buffer
}
</script>
<style scoped></style>
