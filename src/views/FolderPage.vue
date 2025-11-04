<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ $route.params.id }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ $route.params.id }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <ion-grid>
          <ion-row class="aic">
            <ion-col size="auto">
              <ion-label class="form-label-80">TCU 工作时间</ion-label>
            </ion-col>
            <ion-col size="6">
              <ion-input label="测试" label-placement="floating" fill="outline"></ion-input>
            </ion-col>
            <ion-col>
              <ion-button> 读取 </ion-button>
            </ion-col>
          </ion-row>

          <ion-row class="aic">
            <ion-col size="auto">
              <ion-label class="form-label-80">里程</ion-label>
            </ion-col>
            <ion-col size="6">
              <ion-input label="测试" label-placement="floating" fill="outline"></ion-input>
            </ion-col>
            <ion-col>
              <ion-button> 读取 </ion-button>
              <ion-button color="success"> 写入 </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonInput
} from '@ionic/vue'
</script>

<style scoped>
#container {
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
