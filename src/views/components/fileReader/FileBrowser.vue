<template>
  <div>
    <ion-item>
      <ion-label>目录类型:</ion-label>
      <ion-select v-model="directory" @ion-change="browsePath">
        <ion-select-option value="EXTERNAL">External</ion-select-option>
        <ion-select-option value="EXTERNAL_STORAGE">External Storage</ion-select-option>
      </ion-select>
    </ion-item>

    <!-- <ion-item>
      <ion-label position="stacked">路径:</ion-label>
      <ion-input v-model="path" placeholder="例如: images"></ion-input>
    </ion-item> -->

    <!-- <ion-button expand="block" @click="browsePath">
      <ion-icon :icon="search"></ion-icon>
      浏览路径
    </ion-button> -->

    <div v-if="loading">加载中...</div>

    <ion-list>
      <ion-item
        v-for="file in files"
        :key="file.uri"
        @click="selectFile(file)"
        :class="{ selected: selectedFile?.uri === file.uri }"
      >
        <ion-icon :icon="file.type === 'directory' ? folder : document" slot="start"></ion-icon>
        <ion-label>
          <h2>{{ file.name }}</h2>
          <p v-if="file.type === 'file'">{{ formatFileSize(file.size) }}</p>
          <p v-else>目录</p>
        </ion-label>
      </ion-item>
    </ion-list>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import {
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonList
} from '@ionic/vue'
import { search, folder, document } from 'ionicons/icons'
import { Filesystem, Directory } from '@capacitor/filesystem'

const emit = defineEmits(['fileSelected', 'error'])

const directory = ref('EXTERNAL')
const path = ref('')
const files = ref<any[]>([])
const selectedFile = ref<any | null>(null)
const loading = ref(false)

function getDirectory(dir: string): Directory {
  const directories: Record<string, Directory> = {
    DOCUMENTS: Directory.Documents,
    DATA: Directory.Data,
    CACHE: Directory.Cache,
    EXTERNAL: Directory.External,
    EXTERNAL_STORAGE: Directory.ExternalStorage
  }
  return directories[dir] ?? Directory.Documents
}

async function browsePath() {
  loading.value = true
  files.value = []
  selectedFile.value = null

  try {
    const dir = getDirectory(directory.value)
    const result = await Filesystem.readdir({
      path: path.value,
      directory: dir
    })
    // result.files is expected to be an array of file entries
    files.value = (result as any).files ?? []
  } catch (error: any) {
    console.error('读取目录出错:', error)
    emit('error', error?.message ?? String(error))
  } finally {
    loading.value = false
  }
}

function selectFile(file: any) {
  selectedFile.value = file
  if (file.type === 'file') {
    emit('fileSelected', file)
  } else if (file.type === 'directory') {
    path.value = path.value ? `${path.value}/${file.name}` : file.name
    browsePath()
  }
}

function formatFileSize(bytes: number) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  browsePath()
})
</script>

<style scoped>
.selected {
  background: rgba(0, 0, 0, 0.05);
}
</style>
