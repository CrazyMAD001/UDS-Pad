<template>
  <ion-list lines="none">
    <menu-node
      :items="menus"
      :level="0"
      parent-path=""
      :is-open="isOpen"
      :toggle="toggle"
      :selected-path="selectedPath"
      @select="onSelect"
    />
  </ion-list>
</template>

<script>
import { IonList, IonItem, IonLabel, IonIcon } from '@ionic/vue'
import { chevronDownOutline, chevronForwardOutline } from 'ionicons/icons'

const MenuNode = {
  name: 'MenuNode',
  props: {
    items: { type: Array, required: true },
    level: { type: Number, default: 0 },
    parentPath: { type: String, default: '' },
    isOpen: { type: Function, required: true },
    toggle: { type: Function, required: true },
    selectedPath: { type: String, default: null }
  },
  components: { IonItem, IonLabel, IonIcon },
  emits: ['select'],
  data() {
    return { chevronDownOutline, chevronForwardOutline }
  },
  methods: {
    makePath(index) {
      return this.parentPath === '' ? String(index) : `${this.parentPath}-${index}`
    },
    handleClick(item, path) {
      if (item.children && item.children.length) {
        this.toggle(path)
      } else {
        this.$emit('select', item, path)
      }
    }
  },
  template: `
        <div>
            <ion-item
                v-for="(item, idx) in items"
                :key="makePath(idx)"
                :class="{ 'mm-active': selectedPath === makePath(idx) }"
                button
                @click="handleClick(item, makePath(idx))"
            >
                <ion-label :style="{ paddingLeft: (level * 16) + 'px' }">
                    {{ item.label }}
                </ion-label>

                <ion-icon
                    v-if="item.children && item.children.length"
                    slot="end"
                    :icon="isOpen(makePath(idx)) ? chevronDownOutline : chevronForwardOutline"
                />
            </ion-item>

            <menu-node
                v-for="(item, idx) in items"
                v-if="item.children && item.children.length && isOpen(makePath(idx))"
                :key="makePath(idx) + '-child'"
                :items="item.children"
                :level="level + 1"
                :parent-path="makePath(idx)"
                :is-open="isOpen"
                :toggle="toggle"
                :selected-path="selectedPath"
                @select="$emit('select', $event, $eventPath)"
            />
        </div>
    `
}

export default {
  name: 'ListMenu',
  components: { IonList, MenuNode },
  props: {
    // menus: array of { id?, label: string, children?: [...] }
    menus: { type: Array, required: true }
  },
  data() {
    return {
      openPaths: new Set(),
      selectedPath: null
    }
  },
  methods: {
    toggle(path) {
      if (this.openPaths.has(path)) this.openPaths.delete(path)
      else this.openPaths.add(path)
      // force updates by replacing Set reference (Vue reactivity)
      this.openPaths = new Set(this.openPaths)
    },
    isOpen(path) {
      return this.openPaths.has(path)
    },
    onSelect(item, path) {
      // item: the selected menu object, path: its generated path string like "0-1-2"
      this.selectedPath = path
      this.$emit('select', item)
    }
  }
}
</script>

<style scoped>
.mm-active {
  --background: rgba(0, 122, 255, 0.08);
}
ion-item {
  --inner-padding-end: 12px;
  --inner-padding-start: 12px;
}
</style>
