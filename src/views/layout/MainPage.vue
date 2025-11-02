<!--
  功能：功能描述
  时间：2025年11月02日 22:04:34
-->
<template>
  <ion-split-pane content-id="main-content">
    <ion-menu content-id="main-content" type="overlay">
      <ion-content>
        <ion-list id="inbox-list">
          <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
            <ion-item
              @click="selectedIndex = i"
              router-direction="root"
              :router-link="p.url"
              lines="none"
              :detail="false"
              class="hydrated"
              :class="{ selected: selectedIndex === i }"
            >
              <ion-icon aria-hidden="true" slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
              <ion-label>{{ p.title }}</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>
    <!-- 自定义侧边栏菜单组件 -->
    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-split-pane>
</template>

<script setup lang="ts">
import {
  IonSplitPane,
  IonRouterOutlet,
  IonMenu,
  IonContent,
  IonMenuToggle,
  IonLabel,
  IonList,
  IonIcon,
  IonItem
} from '@ionic/vue'
import {
  archiveOutline,
  archiveSharp,
  heartOutline,
  heartSharp,
  mailOutline,
  mailSharp,
  paperPlaneOutline,
  paperPlaneSharp
} from 'ionicons/icons'
import { ref } from 'vue'

const selectedIndex = ref(0)
const appPages = [
  {
    title: '网络请求',
    url: '/main/networkTest',
    iosIcon: mailOutline,
    mdIcon: mailSharp
  },
  {
    title: '组件测试',
    url: '/main/folder/Outbox',
    iosIcon: paperPlaneOutline,
    mdIcon: paperPlaneSharp
  },
  {
    title: ' 参数读取 ',
    url: '/main/folder/Favorites',
    iosIcon: heartOutline,
    mdIcon: heartSharp
  },
  {
    title: ' 协议读取',
    url: '/main/folder/Archived',
    iosIcon: archiveOutline,
    mdIcon: archiveSharp
  }
]
const path = window.location.pathname.split('folder/')[1]
if (path !== undefined) {
  selectedIndex.value = appPages.findIndex(
    (page) => page.title.toLowerCase() === path.toLowerCase()
  )
}
</script>

<style scoped>
ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-note {
  margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
}

ion-menu.md ion-list#inbox-list {
  border-bottom: 1px solid var(--ion-background-color-step-150, #d7d8da);
}

ion-menu.md ion-list#inbox-list ion-list-header {
  font-size: 22px;
  font-weight: 600;

  min-height: 20px;
}

ion-menu.md ion-list#labels-list ion-list-header {
  font-size: 16px;

  margin-bottom: 18px;

  color: #757575;

  min-height: 26px;
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: #616e7e;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 20px 0 0 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 20px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: #73849a;
}

ion-menu.ios ion-list#labels-list ion-list-header {
  margin-bottom: 8px;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  margin-bottom: 8px;
}

ion-note {
  display: inline-block;
  font-size: 16px;

  color: var(--ion-color-medium-shade);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>
