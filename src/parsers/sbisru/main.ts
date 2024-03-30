import { IResult } from '../../interfaceSett';
import { PageFetch, ProxyRefresh, waitFor } from '../moduls';
import { parse as parseHtml } from 'node-html-parser';
import { PuppeteerPage } from '../puppeteerPage';


export class Sbisru {
  constructor(
    private pageFetch: PageFetch,
    private puppeteerPage: PuppeteerPage,
    private proxyRefresh: ProxyRefresh
  ) {
  }

  async getData(result_: IResult[], log: Function) {
    log('Парсинг sbis.ru ...');
    const result: IResult[] = Object.assign([], result_);
    let i = 0;
    try {
      await this.puppeteerPage.goto('https://sbis.ru/');

      for (let res of result) {
        try {
          await this.parseUrl(res);

          console.log(i++, '-------------------------------------');
          await waitFor(2000);
        } catch (error) {
          try {
            await this.proxyRefresh.switch();
            await this.puppeteerPage.browserClose();
            await this.puppeteerPage.init();
            await this.puppeteerPage.goto('https://sbis.ru/');
            console.log('Sbisru >>>>>>>>>>>..');
            await waitFor(2000);
            await this.parseUrl(res);
          } catch { continue }
        }
      }
      log('Парсинг sbis.ru готов ...');
      return result;
    } catch (error) {
      log('Парсинг sbis.ru закончился неудачей ...');
      throw error;
    }
  }

  async parseUrl(result: IResult) {
    try {
      const kpp = result['КПП'] ? `/${result['КПП']}` : '';
      const response = await this.pageFetch.request(`https://sbis.ru/contragents/${result['ИНН']}${kpp}`, {
        "credentials": "include",
        "headers": {
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1"
        },
        "method": "GET",
        "mode": "cors"
      });

      const html = parseHtml(response);

      let phone_ = html.querySelector('div.cCard__Contacts-Value.ws-ellipsis');
      let phone = '';
      if (phone_) {
        phone = phone_.innerText;
      }


      const mail_ = html.querySelector('a.cCard__Contacts-site-element.ws-ellipsis');
      let mail = '';
      if (mail_) {
        if (mail_.getAttribute('title')) {
          mail = mail_.getAttribute('title') as string;
        }
      }

      console.log(phone);
      console.log(mail);

      result['Sbisru Телефон'] = phone;
      result['Sbisru Эл. почта'] = mail;

      console.log(result);
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
//   const sbisru = new Sbisru();
//   const res = await sbisru.getData(result, log);
// })()
