// console.log(process.platform)
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page, WaitForOptions } from 'puppeteer';

export class PuppeteerPage {
  private _page: Page | null = null;
  private _browser: Browser | null = null;

  async browserClose() {
    if (this._browser) {
      return await this._browser.close();
    } else {
      throw `The "this._browser" is null >>>!!!`;
    }
  }

  get browser() {
    if (this._browser) {
      return this._browser;
    } else {
      throw `The "this._browser" is null @@@@@@@`;
    }
  }

  BrowserToNull() {
    if (this._page) {
      this._browser = null;
      this._page = null;
    } else {
      throw `The "this._page" is null`;
    }
  }

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
      const args = puppeteer.defaultArgs().filter(elem => {
        return ![
          '--enable-automation',
          '--headless',
          '--hide-scrollbars',
        ].includes(elem);
      });
      args.push('--no-sandbox');
      args.push('--disable-automation');
      args.push('--enable-gpu');
      this._browser = await puppeteer.launch({
        // product: 'firefox',
        defaultViewport: null,
        headless: headless,
        // ignoreHTTPSErrors: true,
        // userDataDir: '../../session',
        // args: args,
        executablePath: '../chrome/chrome',
        args: [
          '--proxy'
        ]
        // executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`
        // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        // executablePath: './chrome-mac/Chromium.app/Contents/MacOS/Chromium'
      });
      this._page = await this._browser.newPage();
      await this._page.authenticate({
        username: '',
        password: '',
      })
      await this.page.setCacheEnabled(false);
    } catch (error) {
      console.log('puppeteer init')
      throw error;
    }
  }
}

