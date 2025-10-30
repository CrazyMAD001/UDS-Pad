<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Network Config Test</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-button expand="block" @click="testConfig">Test Network Config</ion-button>
      <ion-text>
        <pre>{{ testResults }}</pre>
      </ion-text>
    </ion-content>

    <!-- 测试连接 input group  -->
    <!-- demo 连接 ws 测试 停止按钮 -->
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonText
} from '@ionic/vue'

const testResults = ref('')

const testConfig = async () => {
  const results: string[] = []

  // 测试各种地址
  const testUrls = ['ws://192.168.2.141:8000']

  for (const url of testUrls) {
    try {
      if (url.startsWith('ws')) {
        // 测试 WebSocket
        await testWebSocket(url)
        results.push(`✅ ${url} - WebSocket OK`)
      } else {
        // 测试 HTTP
        const response = await fetch(url)
        results.push(`✅ ${url} - HTTP ${response.status}`)
      }
    } catch (error: any) {
      results.push(`❌ ${url} - ${error.message}`)
    }
  }

  testResults.value = results.join('\n')
}

const testWebSocket = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url)
    const timeout = setTimeout(() => {
      socket.close()
      reject(new Error('Timeout'))
    }, 5000)

    socket.onopen = () => {
      clearTimeout(timeout)
      socket.close()
      resolve()
    }

    socket.onerror = (error) => {
      clearTimeout(timeout)
      reject(error)
    }
  })
}
</script>
