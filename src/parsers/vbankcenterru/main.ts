import { IResult } from '../../interfaceSett';
import { waitFor } from '../moduls';
import { parse as parseHtml } from 'node-html-parser';
import { PuppeteerPage } from "../puppeteerPage";


export class VbankCenterru {
  puppeteerPage = new PuppeteerPage();
  log: Function;
  constructor(log: Function) {
    this.log = log;
  }

  async getData(result_: IResult[]) {
    try {
      this.log('Парсинг vbankcenter.ru ...');
      await this.puppeteerPage.init({ headless: false });
      const result: IResult[] = Object.assign([], result_);
      let i = 0;
      for (let res of result) {
        try {
          await this.parseUrl(res);
          await waitFor(500);
          console.log(i++, '-------------------------------------');
        } catch (error) {
          try {
            console.log('vbankcenter.ru >>>>>>>>>>>..');
            await waitFor(4000);
            await this.parseUrl(res);
          } catch { continue }
        }
      }
      this.log('Парсинг vbankcenter.ru готов ...');
      await this.puppeteerPage.browserClose();
      return result;
    } catch (error) {
      await this.puppeteerPage.browserClose();
      this.log('Парсинг vbankcenter.ru закончился неудачей ...');
      throw error;
    }
  }

  async parseUrl(result: IResult) {
    try {
      if (!result['ОГРН']) { return }
      await this.puppeteerPage.goto(`https://vbankcenter.ru/contragent/${result['ОГРН']}`)
      await waitFor(1500);
      let content = await this.puppeteerPage.page.content();
      let html = parseHtml(content);
      const more_contacts_select = '.requisites-ul-item > section:nth-child(4) > div:nth-child(2) > button:nth-child(3) > span:nth-child(1)';

      if (html.querySelector(more_contacts_select) !== null) {
        await this.puppeteerPage.page.click(more_contacts_select)
        await waitFor(500)
      }
      content = await this.puppeteerPage.page.content();
      html = parseHtml(content);
      const list = html.querySelectorAll('.requisites-ul-item > section:nth-child(4) > div:nth-child(2) > div');

      const isPhone = 'Телефон:&nbsp; ';
      const isMail = 'E-mail:&nbsp; ';
      const phone: string[] = [];
      const mail: string[] = [];
      for (let l of list) {
        const elem = l.innerText;
        if (elem.includes(isPhone)) {
          phone.push(elem.replace(isPhone, ''))
        }
        if (elem.includes(isMail)) {
          mail.push(elem.replace(isMail, '').trim())
        }
      }

      result['VbankCenterru Телефон'] = phone.join('; ');
      result['VbankCenterru Эл. почта'] = mail.join('; ');

    } catch (error) {
      throw error;
    }
  }
}

// import { result } from '../nalogru/obj';
// (async () => {
//   function log(text: string) {
//     console.log(text)
//   }
//   const sbisru = new VbankCenterru(log);
//   const res = await sbisru.getData(resResult());
// })()

// function log(text: string) {
//   console.log(text)
// }


