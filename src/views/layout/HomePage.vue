<!--
  功能：功能描述
  时间：2025年11月02日 22:13:48
-->
<template>
  <ion-page>
    <ion-content>
      <div class="main-container">
        <ion-button @click="goMain">开始</ion-button>
        <ion-button @click="showFile">打开文件</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { IonPage, IonContent, IonButton, modalController } from '@ionic/vue'
import { useIonRouter } from '@ionic/vue'
import FileReader from '@/views/components/fileReader/index.vue'
import messageService from '@/utils/messageService'
import { getRaw, setRaw } from '@/store/useConfig'
const ionRouter = useIonRouter()
const goMain = () => {
  ionRouter.push('/main')
}
const showFile = async () => {
  const modal = await modalController.create({
    component: FileReader
  })

  modal.present()

  const { data, role } = await modal.onWillDismiss()

  if (role === 'onFileRead') {
    messageService.toast('配置文件读取成功!', data)
    console.log('文件内容:', data)

    await setRaw('configFile', JSON.stringify(data))
    goMain()
  }
}
</script>
<style scoped>
.main-container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
</style>
