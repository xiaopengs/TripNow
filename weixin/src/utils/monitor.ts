// 全局错误监控
class ErrorMonitor {
  private static instance: ErrorMonitor

  static getInstance() {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor()
    }
    return ErrorMonitor.instance
  }

  init() {
    // 监听全局错误
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleError)
      window.addEventListener('unhandledrejection', this.handlePromiseError)
    }
  }

  private handleError = (event: ErrorEvent) => {
    const error = {
      type: 'js_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString()
    }

    this.reportError(error)
  }

  private handlePromiseError = (event: PromiseRejectionEvent) => {
    const error = {
      type: 'promise_error',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
      timestamp: new Date().toISOString()
    }

    this.reportError(error)
  }

  private reportError(error: any) {
    // 开发环境打印错误
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reported:', error)
    }

    // 生产环境上报错误（暂用本地存储）
    try {
      const errors = Taro.getStorageSync('tripnow_errors') || []
      errors.push(error)
      
      // 只保留最近50条错误
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50)
      }
      
      Taro.setStorageSync('tripnow_errors', errors)
    } catch (e) {
      console.error('Failed to save error:', e)
    }
  }

  // 手动上报错误
  report(message: string, extra?: any) {
    this.reportError({
      type: 'manual',
      message,
      extra,
      timestamp: new Date().toISOString()
    })
  }
}

// 性能监控
class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private startTime: number = 0

  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 开始计时
  startMeasure(name: string) {
    this.startTime = Date.now()
    console.log(`[Performance] Start: ${name}`)
  }

  // 结束计时
  endMeasure(name: string) {
    const duration = Date.now() - this.startTime
    console.log(`[Performance] End: ${name} - ${duration}ms`)

    // 上报性能数据
    this.reportPerformance(name, duration)
  }

  // 测量函数执行时间
  measure<T>(name: string, fn: () => T): T {
    const start = Date.now()
    const result = fn()
    const duration = Date.now() - start

    console.log(`[Performance] ${name}: ${duration}ms`)
    this.reportPerformance(name, duration)

    return result
  }

  // 异步函数测量
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now()
    const result = await fn()
    const duration = Date.now() - start

    console.log(`[Performance] ${name}: ${duration}ms`)
    this.reportPerformance(name, duration)

    return result
  }

  private reportPerformance(name: string, duration: number) {
    // 存储性能数据
    try {
      const perfData = Taro.getStorageSync('tripnow_performance') || []
      perfData.push({
        name,
        duration,
        timestamp: new Date().toISOString()
      })

      // 只保留最近100条
      if (perfData.length > 100) {
        perfData.splice(0, perfData.length - 100)
      }

      Taro.setStorageSync('tripnow_performance', perfData)
    } catch (e) {
      console.error('Failed to save performance data:', e)
    }
  }
}

// 导出单例
export const errorMonitor = ErrorMonitor.getInstance()
export const performanceMonitor = PerformanceMonitor.getInstance()

// 初始化监控
export const initMonitor = () => {
  errorMonitor.init()
  
  // 监听页面加载性能
  if (typeof performance !== 'undefined') {
    setTimeout(() => {
      const timing = performance.timing
      const loadTime = timing.loadEventEnd - timing.navigationStart
      console.log(`[Performance] Page Load Time: ${loadTime}ms`)
      performanceMonitor.reportPerformance('page_load', loadTime)
    }, 0)
  }
}
