/* eslint-disable no-async-promise-executor */
import { toastController, loadingController, alertController } from '@ionic/vue'

export class MessageService {
  private loadingEl?: HTMLIonLoadingElement

  // 短提示（Toast）
  async toast(message: string, duration = 2000, position: 'top' | 'bottom' | 'middle' = 'bottom') {
    const toast = await toastController.create({
      message,
      duration,
      position
    })
    await toast.present()
    return toast
  }

  // 成功提示（快捷）
  async success(message: string, duration = 2000) {
    return this.toast(message, duration, 'top')
  }

  // 错误提示
  async error(message: string, duration = 3000) {
    return this.toast(message, duration, 'bottom')
  }

  // 显示加载（保持单例）
  async showLoading(message = '加载中...', spinner: 'crescent' | 'dots' = 'crescent') {
    if (this.loadingEl) {
      try {
        this.loadingEl.message = message
      } catch {
        // ignore
      }
      return this.loadingEl
    }

    this.loadingEl = await loadingController.create({
      message,
      spinner,
      backdropDismiss: false
    })

    // 清理引用，防止内存泄漏（dismiss 后）
    this.loadingEl.addEventListener('ionLoadingDidDismiss', () => {
      this.loadingEl = undefined
    })

    await this.loadingEl.present()
    return this.loadingEl
  }

  // 隐藏加载
  async hideLoading() {
    if (!this.loadingEl) return
    try {
      await this.loadingEl.dismiss()
    } catch {
      // ignore
    } finally {
      this.loadingEl = undefined
    }
  }

  // 简单提示对话框（只有确定）
  async alert(title: string, message?: string, okText = '确定') {
    const alert = await alertController.create({
      header: title,
      message,
      buttons: [okText]
    })
    await alert.present()
    return alert
  }

  // 确认对话框，返回 true/false
  async confirm(
    title: string,
    message?: string,
    okText = '确定',
    cancelText = '取消'
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await alertController.create({
        header: title,
        message,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: okText,
            handler: () => resolve(true)
          }
        ]
      })
      await alert.present()
    })
  }
}

// 导出单例，Vue 组件中可直接引入并使用
const messageService = new MessageService()
export default messageService
