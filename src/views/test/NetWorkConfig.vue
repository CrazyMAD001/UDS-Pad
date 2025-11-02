<template>
  <ion-page>
    <ion-content class="ion-padding">
      <ion-button expand="block" @click="testConfig">Test Network Config</ion-button>
      <ion-text>
        <pre>{{ testResults }}</pre>
      </ion-text>
      <ion-input
        label="测试 IP"
        label-placement="floating"
        fill="outline"
        :model-value="inputModel.url"
        placeholder="输入 IP"
        @ion-focus="handleFocus"
        @ionChange="handleInputChange($event, 'url')"
      ></ion-input>
      <ion-button expand="block" color="success" @click="initWs">连接Ws服务</ion-button>
      <!-- <ion-button expand="block" @click="testHttp">Test http</ion-button> -->
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-input
              label="测试 SEND"
              label-placement="floating"
              fill="outline"
              placeholder="输入 SEND 内容"
              @ionChange="handleInputChange($event, 'send')"
            ></ion-input>
          </ion-col>
          <ion-col>
            <ion-button expand="block" @click="sendWs">测试发送</ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <!-- 测试连接 input group  -->
    <!-- demo 连接 ws 测试 停止按钮 -->
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  IonPage,
  IonContent,
  IonButton,
  IonText,
  IonInput,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/vue'
import WebSocketService from '@/utils/websocketService'
import messageService from '@/utils/messageService'
import fetcher from '@/utils/fetch'
const testResults = ref('')

const ws = ref<WebSocketService | null>(null)
const inputModel = reactive<any>({})

const testConfig = async () => {
  const results: string[] = []

  // 测试各种地址
  const testUrls = ['ws://192.168.4.1/ws', '192.168.4.1', 'localhost']

  for (const url of testUrls) {
    try {
      if (url.startsWith('ws')) {
        // 测试 WebSocket
        await testWebSocket(url)
        results.push(`✅ ${url} - WebSocket OK`)
      } else {
        // 测试 HTTP
        const response = await fetch(`http://${url}`)
        results.push(`✅ ${url} - HTTP ${response.status}`)
      }
    } catch (error: any) {
      results.push(`❌ ${url} - ${JSON.stringify(error)}`)
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
const handleFocus = () => {
  inputModel.url = '192.168.4.1/ws'
}
const handleInputChange = (event: any, modelKey?: any) => {
  console.log('Input changed:', event.detail.value)
  inputModel[modelKey] = event.detail.value
}
const initWs = () => {
  if (!inputModel.url) {
    messageService.error('Please enter a valid URL')
    return
  }
  messageService.toast(`Initializing WebSocket...     ${inputModel.url}`)
  ws.value = new WebSocketService(`ws://${inputModel.url}`)

  ws.value.on('reconnect', ({ attempt }) => {
    messageService.toast('WebSocket reconnecting...' + attempt)
  })
  ws.value.on('open', () => {
    console.log('WebSocket connection opened')
    messageService.success('WebSocket connection opened')
  })
  ws.value.on('message', (data: any) => {
    // console.log('WebSocket message received:', data)
    messageService.toast('WebSocket message received: ' + JSON.stringify(data))
  })
  ws.value.on('error', (err: any) => {
    messageService.error('WebSocket connection err', err)
  })
  ws.value.connect()
}

const testHttp = async () => {
  const testUrl = inputModel.url
  await fetcher(testUrl)
    .then((response) => {
      messageService.success(`HTTP request successful: ${response.status}`)
    })
    .catch((error) => {
      messageService.error(`HTTP request failed: ${error.message}`)
    })
}

const sendWs = () => {
  if (ws.value && ws.value.isConnected()) {
    ws.value.send(inputModel.send || 'Hello WebSocket')
    // messageService.toast('WebSocket message sent: ' + (inputModel.send || 'Hello WebSocket'))
  } else {
    messageService.error('WebSocket is not connected')
  }
}
</script>
