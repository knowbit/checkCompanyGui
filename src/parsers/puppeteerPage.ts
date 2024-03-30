// console.log(process.platform)
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page, WaitForOptions } from 'puppeteer';
import { TProxy } from '../interfaceSett';

export class PuppeteerPage {
  private _page: Page | null = null;
  private _browser: Browser | null = null;

  constructor(private proxy: TProxy) {
  }

  async browserClose() {
    try {
      if (this._browser === null) { return; }
      const pages = await this._browser.pages();
      for (const page of pages) { page.close() }
      await this._browser.close();
      this._page = null;
      this._browser = null;
      // try {
      //   this.BrowserToNull();
      // } catch (error) { }
    } catch (error) {
      throw error;
    }
  }

  get browser() {
    if (this._browser) {
      return this._browser;
    }
    else {
      throw `The "this._browser" is null @@@@@@@`;
    }
  }

  // BrowserToNull() {
  //   if (this._page) {
  //     this._browser = null;
  //     this._page = null;
  //   } else {
  //     throw `The "this._page" is null`;
  //   }
  // }

  get page() {
    if (this._page) {
      return this._page;
    } else {
      throw `The "this._page" is null`;
    }
  }

  async goto(url: string, options?: WaitForOptions) {
    try {
      if (this._page) {
        await this._page.goto(url, options);
      } else {
        throw `The "page" is null`;
      }
    } catch (error) {
      throw error;
    }
  }

  async init(options?: { headless: boolean }): Promise<void> {
    try {
      const headless = options === undefined ? false : options.headless;
      puppeteer.use(StealthPlugin())

      // const args = puppeteer.defaultArgs().filter(elem => {
      //   return ![
      //     '--enable-automation',
      //     '--headless',
      //     '--hide-scrollbars',
      //   ].includes(elem);
      // });
      // args.push('--no-sandbox');
      // args.push('--disable-automation');
      // args.push('--enable-gpu');

      let args: string[] = [];

      if (this.proxy !== null) {
        args = [`--proxy-server=${this.proxy.host}`];
      }

      this._browser = await puppeteer.launch({
        defaultViewport: null,
        headless: headless,
        // ignoreHTTPSErrors: true,
        // userDataDir: '../../session',
        args: args,
        // executablePath: '../chrome/chrome',
        executablePath: '.\\chrome-win\\chrome.exe',
        // executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`
        // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        // executablePath: './chrome-mac/Chromium.app/Contents/MacOS/Chromium' 
      });
      this._page = await this._browser.newPage();

      console.log(this.proxy)

      if (this.proxy !== null) {
        await this._page.authenticate({
          username: this.proxy.userName,
          password: this.proxy.password
        })
      }
      await this.page.setCacheEnabled(false);
    } catch (error) {
      console.log('puppeteer init')
      throw error;
    }
  }
}

