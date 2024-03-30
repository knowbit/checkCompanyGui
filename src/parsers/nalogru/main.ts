import { parse as parseHtml } from 'node-html-parser';
import { IResult, TProxy } from '../../interfaceSett';
import { PageFetch, ProxyRefresh, waitFor } from '../moduls';
import { PuppeteerPage } from '../puppeteerPage';

export class Nalogru {
  constructor(
    private pageFetch: PageFetch,
    private puppeteerPage: PuppeteerPage,
    private proxyRefresh: ProxyRefresh
  ) { }

  async getData(result_: IResult[], log: Function) {
    log('Парсинг egrul.nalog.ru ...');
    const result = Object.assign([], result_);
    try {
      await this.puppeteerPage.goto('https://egrul.nalog.ru/')

      for (let res of result) {
        try {
          await this.parseUrl(res);
          console.log(res);
          await waitFor(2000);
        } catch (error) {
          try {
            await this.proxyRefresh.switch();
            await this.puppeteerPage.browserClose();
            await this.puppeteerPage.init();
            await this.puppeteerPage.goto('https://egrul.nalog.ru/')
            console.log('Nalog >>>>>>>>>>>..');
            await waitFor(4000);
            await this.parseUrl(res);
          } catch { continue }
        }
      }
      log('Парсинг egrul.nalog.ru готов ...');
      return result;
    } catch (error) {
      log('Парсинг egrul.nalog.ru закончился неудачей ...');
      console.log(error);
    }
  }

  private async parseUrl(result: IResult): Promise<void> {
    try {
      const restmp = await this.pageFetch.request("https://egrul.nalog.ru/", {
        "credentials": "include",
        "headers": {
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin"
        },
        "referrer": "https://egrul.nalog.ru/index.html",
        "body": `vyp3CaptchaToken=&page=&query=${result['ИНН']}&region=&PreventChromeAutocomplete=`,
        "method": "POST",
        "mode": "cors"
      });

      const tokenJson = JSON.parse(restmp);

      if (tokenJson.captchaRequired === false) {
        const time = (new Date()).getTime();
        let url = `https://egrul.nalog.ru/search-result/${tokenJson.t}?r=${time}&_=${time + 1}`;

        const response = await this.pageFetch.request(url, {
          "credentials": "include",
          "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "X-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
          },
          "referrer": "https://egrul.nalog.ru/index.html",
          "method": "GET",
          "mode": "cors"
        });

        const data = JSON.parse(response);

        console.log(data)

        const rows = data.rows[0];
        if (rows.k === 'ul') {
          result['type'] = 'ul';
          result['Директор'] = rows.g;
          result['ИНН'] = rows.i;
          result['КПП'] = rows.p;
          result['ОГРН'] = rows.o;
          result['Дата присвоения ОГРН'] = rows.r;
          result['Адрес'] = rows.a;
          result['Название'] = rows.c;
        } else if (rows.k === 'fl') {
          result['type'] = 'fl';
          result['Директор'] = rows.n;
          result['ИНН'] = rows.i;
          result['ОГРНИП'] = rows.o;
          result['Дата присвоения ОГРНИП'] = rows.r;
          result['Название'] = `ИП ${rows.n}`;
        }
      }
    } catch (error) {
      throw error;
    }
  };

}

// const result: IResult[] = [{
//   'Url kad.arbitr': "https://kad.arbitr.ru/Card/29c20486-631b-435e-851a-df442b382eee",
//   'ИНН': "760402197964",
//   // 'ИНН': "5047187642",
//   'Название': "ООО \"ЭЛЬМАРКЕТ\"",
//   'Номер дела': "А41-2709/2024",
//   'Проверить сумму иска': "нет",
//   'Сумма иска': "201800",
// }];

// const proxy: TProxy = {
//   host: 'http://5.8.14.128:9422',
//   userName: 'TKa8r4',
//   password: '5zkArD',
//   changeIp: 'http://httpbin.org/ip'
// };

// // import { result } from './obj';

// (async () => {
//   function log(text: string) {
//     console.log(text)
//   }
//   const nalogru = new Nalogru(proxy);
//   const res = await nalogru.getData(result, log);
//   console.log(res)
// })()
