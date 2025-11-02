<!--
  功能：功能描述
  时间：2025年11月02日 22:13:48
-->
<template>
  <ion-content>
    <div class="main-container">
      <ion-button @click="goMain">开始</ion-button>
    </div>
  </ion-content>
</template>
<script setup lang="ts">
import { IonContent, IonButton } from '@ionic/vue'
import { useIonRouter } from '@ionic/vue'

const ionRouter = useIonRouter()
const goMain = () => {
  ionRouter.push('/main')
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
