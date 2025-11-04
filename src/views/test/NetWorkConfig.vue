<template>
  <ion-page>
    <ion-content class="ion-padding">
      <ion-button expand="block" @click="testConfig">网络连通情况 test</ion-button>
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
      <ion-grid fixed>
        <ion-row>
          <ion-col size="6">
            <ion-button expand="block" color="success" @click="initWs"> 连接Ws服务 </ion-button>
          </ion-col>
          <ion-col size="6">
            <ion-button expand="block" color="danger" @click="closeWs"> 断开服务</ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- <ion-button expand="block" @click="testHttp">Test http</ion-button> -->
      <ion-grid>
        <ion-radio-group
          :value="wsTransformMode"
          @ion-change="($event) => (wsTransformMode = $event.detail.value)"
        >
          <ion-list-header>
            <ion-label>WS 数据接收模式 {{ wsTransformMode }}</ion-label>
          </ion-list-header>
          <ion-row>
            <ion-col size="4">
              <ion-item>
                <ion-radio label-placement="start" value="hex16">十六进制</ion-radio>
              </ion-item>
            </ion-col>
            <ion-col size="4">
              <ion-item>
                <ion-radio label-placement="start" value="default">字符串</ion-radio>
              </ion-item>
            </ion-col>
          </ion-row>
        </ion-radio-group>
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

      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-list-header>WS 发送：</ion-list-header>
            <ion-text>
              <pre>{{ wsSend }}</pre>
            </ion-text>
          </ion-col>

          <ion-col>
            <ion-list-header>WS 接收：</ion-list-header>
            <ion-text>
              <pre>{{ wsRes }}</pre>
            </ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <!-- 测试连接 input group  -->
    <!-- demo 连接 ws 测试 停止按钮 -->
  </ion-page>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import {
  IonPage,
  IonContent,
  IonButton,
  IonText,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonListHeader,
  IonRadioGroup,
  IonRadio,
  IonLabel,
  IonItem
} from '@ionic/vue'
import WebSocketService from '@/utils/websocketService'
import messageService from '@/utils/messageService'
import { blobToHexString, stringToHexArrayBuffer } from '@/utils/tools'

const testResults = ref('')
const wsRes = ref('')
const wsSend = ref('')
const ws = ref<WebSocketService | null>(null)
const wsTransformMode = ref<'default' | 'hex16'>('hex16')
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
const closeWs = () => {
  if (ws.value) {
    ws.value.close()
    nextTick(() => {
      ws.value = null
    })
  }
}
const initWs = () => {
  if (!inputModel.url) {
    messageService.error('Please enter a valid URL')
    return
  }
  messageService.toast(`Initializing WebSocket...     ${inputModel.url}`)
  ws.value = new WebSocketService<Blob, ArrayBuffer>(`ws://${inputModel.url}`, {
    json: false
  })

  ws.value.on('reconnect', ({ attempt }) => {
    messageService.toast('WebSocket reconnecting...' + attempt)
  })
  ws.value.on('open', () => {
    console.log('WebSocket connection opened')
    messageService.success('WebSocket connection opened')
  })
  ws.value.on('message', async (data: any) => {
    console.log('WebSocket message received:', data)

    if (typeof data === 'string') {
      wsRes.value += `Received: ${data}\n`
    } else if (data instanceof ArrayBuffer) {
      const decoded = new TextDecoder().decode(data)
      wsRes.value += `Received (ArrayBuffer): ${decoded}\n`
    } else {
      console.log('Received data is of unknown type', data instanceof Blob)
      const hex = await blobToHexString(data)
      wsRes.value += `Received (Blob): ${hex}\n`
      messageService.toast('WebSocket message received(string): ' + hex)
    }
  })

  ws.value.on('error', (err: any) => {
    messageService.error('WebSocket connection err', err)
  })

  ws.value.on('close', () => {
    messageService.toast('Websocket closed')
  })
  ws.value.connect()
}

const sendWs = () => {
  const inputData = inputModel.send
  const hexData = {
    arrayBuffer: new ArrayBuffer(0),
    hexString: ''
  }
  if (wsTransformMode.value === 'hex16') {
    const sendHexObj = stringToHexArrayBuffer(inputData)
    hexData.arrayBuffer = sendHexObj.arrayBuffer
    hexData.hexString = sendHexObj.hexString
  }
  const sendData = wsTransformMode.value === 'hex16' ? hexData.arrayBuffer : inputData
  console.log('Sending data via WebSocket:', sendData)

  wsSend.value += `Send Msg :${
    wsTransformMode.value === 'hex16' ? hexData.hexString : inputData
  } \n`
  if (ws.value && ws.value.isConnected()) {
    ws.value?.send(sendData)
  } else {
    messageService.error('WebSocket is not connected')
  }
}
</script>
