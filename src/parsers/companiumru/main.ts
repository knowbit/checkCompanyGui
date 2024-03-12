import { IResult } from '../../interfaceSett';
import { waitFor } from '../moduls';
import { parse as parseHtml } from 'node-html-parser';


export class Companiumru {
  log: Function;
  constructor(log: Function) {
    this.log = log;
  }

  async getData(result_: IResult[]) {
    this.log('Парсинг companium.ru ...');
    const result: IResult[] = Object.assign([], result_);
    let i = 0;
    try {
      for (let res of result) {
        try {
          await this.parseUrl(res);
          console.log(i++, '-------------------------------------');
          await waitFor(2000);
        } catch (error) {
          try {
            console.log('companium.ru >>>>>>>>>>>..');
            await waitFor(2000);
            await this.parseUrl(res);
          } catch { continue }
        }
      }
      this.log('Парсинг companium.ru готов ...');
      return result;
    } catch (error) {
      this.log('Парсинг companium.ru закончился неудачей ...');
      throw error;
    }
  }

  async parseUrl(result: IResult) {
    try {
      if (!result['ОГРН'] || result['ОГРН'].length < 5) {
        return;
      }

      const response = await fetch(`https://companium.ru/id/${result['ОГРН']}/contacts`, {
        "credentials": "include",
        "headers": {
          "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "If-None-Match": "W/\"a798d169128b72b5bfb18ba4ba64a072\""
        },
        "method": "GET",
        "mode": "cors"
      });

      if (response.status !== 200) { throw 'Status not 200' }

      const html = parseHtml(await response.text());
      const blcock_phone = html.querySelector('div.col-lg-4:nth-child(1)');
      const phone: string[] = [];
      if (blcock_phone) {
        const list = blcock_phone.querySelectorAll('a.link-dark');
        for (const elem of list) {
          phone.push(elem.innerText.trim())
        };
      }

      const blcock_mail_site = html.querySelector('div.col-lg-4:nth-child(2)');
      const mail: string[] = [];
      const site: string[] = [];
      if (blcock_mail_site) {
        const list = blcock_mail_site.querySelectorAll('a');
        for (const elem of list) {
          if (elem.innerText.includes('@')) {
            mail.push(elem.innerText.trim())
          } else {
            site.push(elem.innerText.trim())
          }
        };
      }

      result['Companiumru Телефон'] = phone.join('; ');
      result['Companiumru Эл. почта'] = mail.join('; ');
      result['Companiumru Сайт'] = site.join('; ');
      console.log(result)
    } catch (error) {
      this.log('Парсинг companium.ru закончился неудачей ...');
      throw error;
    }
  }
}

// import { result } from '../nalogru/obj';
// (async () => {
//   function log(text: string) {
//     console.log(text)
//   }
//   const companiumru = new Companiumru(log);
//   const res = await companiumru.getData(result);
//   console.log(res)
// })()

