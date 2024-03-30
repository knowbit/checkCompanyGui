import { Page } from "puppeteer";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios-https-proxy-fix";
import { TProxy } from "../interfaceSett";
import { PuppeteerPage } from "./puppeteerPage";


export async function waitForSelector(page: Page, select: string, ms: number): Promise<boolean> {
  try {
    await page.waitForSelector(select, { timeout: ms })
    return true;
  } catch {
    return false;
  }
}

export async function getPdf(page: Page) {
  // Извлекаем текст из PDF документа
  const text = await page.evaluate(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const elements = document.querySelectorAll('span'); // Здесь нужно указать селектор, соответствующий тексту в PDF
        let result = '';
        elements.forEach((element) => {
          result += element.textContent + ' ';
        });
        resolve(result);
      }, 1000);
    });
  });
  return text
}

export class PageFetch {
  constructor(private page: Page) { }
  async request(url: string, option?: RequestInit): Promise<string> {
    try {
      const res = await this.page.evaluate((url, option) => {
        return new Promise((resolve, reject) => {
          fetch(url, option)
            .then(elem => {
              if (elem.ok) { return elem.text() }
              throw new Error('Fetch page failed!');
            }).then(elem => { resolve(elem) })
            .catch(err => { reject(err) })
        });
      }, url, option) as string;
      return res;
    } catch (error) {
      throw error;
    }
  }
}

export class ProxyRefresh {
  constructor(
    private proxy: TProxy,
    private ms: number = 5000) { }

  async switch() {
    try {
      if (this.proxy !== null && this.proxy.changeIp !== null) {
        await fetch(this.proxy.changeIp, {
          signal: AbortSignal.timeout(this.ms)
        })
      }
    } catch (error) {
      throw error;
    }
  }
}

//TKa8r4:5zkard
// const proxy: TProxy = {
//   host: 'https://5.8.14.128:9422',
//   userName: 'TKa8r4',
//   password: '5zkard',
//   changeIp: 'http://httpbin.org/ip'
// };

// (async () => {
//   const puppeteerPage = new PuppeteerPage(proxy);
//   await puppeteerPage.init({ 'headless': true });
//   await puppeteerPage.goto("https://egrul.nalog.ru/");
//   // await puppeteerPage.goto("http://httpbin.org/ip");
//   const pageFetch = new PageFetch(puppeteerPage.page);
//   const result = '773301001';

//   const res = await pageFetch.request("https://egrul.nalog.ru/"
//     // const res = await pageFetch.request("https://httpbin.org/ip"
//     , {
//       "credentials": "include",
//       "headers": {
//         "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
//         "Accept": "application/json, text/javascript, */*; q=0.01",
//         "Accept-Language": "en-US,en;q=0.5",
//         "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
//         "X-Requested-With": "XMLHttpRequest",
//         "Sec-Fetch-Dest": "empty",
//         "Sec-Fetch-Mode": "cors",
//         "Sec-Fetch-Site": "same-origin"
//       },
//       "referrer": "https://egrul.nalog.ru/index.html",
//       "body": `vyp3CaptchaToken=&page=&query=${result}&region=&PreventChromeAutocomplete=`,
//       "method": "POST",
//       "mode": "cors"
//     }
//   );
//   console.log(JSON.parse(res));
// })()

export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => { resolve() }, ms)
  })
}

export class TypeInput {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async typeText(select: string, text: string): Promise<void> {
    try {
      await this.page.type(select, text);
    } catch (error) {
      throw error;
    }
  }

  async clearAndTypeText(select: string, text: string): Promise<void> {
    try {
      await this.selectTextClear(select);
      await this.page.type(select, text);
    } catch (error) {
      throw error;
    }
  }

  async selectTextClear(select: string): Promise<void> {
    try {
      let searchInput = await this.page.$(select);
      if (searchInput) {
        await searchInput.click({ clickCount: 3 });
        await searchInput.press('Backspace');
      } else {
        throw 'The "searchInput" is null';
      }
    } catch (error) {
      throw error
    }
  }

  async pressBackspace(select: string, numBacks: number, timeInterval?: number) {
    try {
      let searchInput = await this.page.$(select);
      if (searchInput) {
        await searchInput.click({ clickCount: 1 });
        for (let i = 0; i < numBacks; i++) {
          await searchInput.press('Backspace');
          if (timeInterval) { await waitFor(timeInterval) }
        }
      } else {
        throw 'The "searchInput" is null';
      }
    } catch (error) {
      throw error
    }
  }

}

// export class RequestData {
//   private proxy: {
//     host: string,
//     port: number,
//     auth: {
//       username: string,
//       password: string
//     }
//   } | undefined = undefined;

//   constructor(public proxy_: TProxy) {
//     if (proxy_ === null) { return }
//     this.proxy = {
//       host: proxy_.host,
//       port: proxy_.port,
//       auth: {
//         username: proxy_.userName,
//         password: proxy_.password
//       }
//     }
//   }

//   async fetch(
//     url: string,
//     option: AxiosRequestConfig = { method: 'get' }
//   ): Promise<AxiosResponse<any>> {
//     try {
//       option.proxy = this.proxy;
//       const res = await axios(url, option);
//       // console.log(typeof res.data)
//       return res;
//     } catch (error) {
//       throw error;
//     }
//   }

//   async refreshProxy(waitMs: number) {
//     try {
//       if (this.proxy_ === null) { return }
//       await fetch(this.proxy_.changeIp, {
//         signal: AbortSignal.timeout(waitMs)
//       });
//     } catch (error) {
//       throw error;
//     }
//   }
// }

// const proxy: TProxy = {
//   port: 9422,
//   host: '5.8.14.128',
//   userName: 'TKa8r4',
//   password: '5zkArD',
//   changeIp: 'http://httpbin.org/ip'
// }

// const requestData = new RequestData(proxy);

// (async () => {
//   const html = await requestData.fetch('http://httpbin.org/ip');
//   console.log(html)
// })();

// requestData.fetch('http://httpbin.org/ip');

