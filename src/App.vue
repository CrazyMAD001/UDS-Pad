<template>
  <ion-app class="main-app">
    <ion-header>
      <ion-toolbar>
        <ion-title>UDS-PAD</ion-title>
        <ion-button slot="end" fill="clear" @click="goOut">
          <ion-icon size="large" style="margin-right: 8px" :icon="logInOutline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-router-outlet></ion-router-outlet>
    </ion-content>
  </ion-app>
</template>

<script setup lang="ts">
import { useIonRouter } from '@ionic/vue'
import {
  IonApp,
  IonHeader,
  IonButton,
  IonTitle,
  IonToolbar,
  IonContent,
  IonRouterOutlet,
  IonIcon
} from '@ionic/vue'
import { logInOutline } from 'ionicons/icons'

const ionRouter = useIonRouter()

const goOut = () => {
  ionRouter.push('/home')
}
</script>

<style scoped>
.main-app {
  margin-top: 16px;
  height: calc(100% - 16px);
}
</style>
