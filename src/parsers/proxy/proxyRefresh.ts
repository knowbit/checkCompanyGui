import { TProxy } from "../../interfaceSett";

export class ProxyRefresh {
  proxy: TProxy;
  constructor(proxy: TProxy) {
    this.proxy = proxy;
  }
  async refresh(ms: number) {
    try {
      if (this.proxy !== null) {
        await fetch(this.proxy.changeIp, {
          signal: AbortSignal.timeout(ms)
        })
      }
    } catch (error) {
      throw error;
    }
  }
}


