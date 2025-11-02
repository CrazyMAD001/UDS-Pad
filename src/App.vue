<template>
  <ion-app>
    <ion-header>
      <ion-toolbar>
        <ion-title>UDS-PAD</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-router-outlet></ion-router-outlet>
    </ion-content>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonHeader, IonTitle, IonToolbar, IonContent, IonRouterOutlet } from '@ionic/vue'
</script>

<style scoped></style>
