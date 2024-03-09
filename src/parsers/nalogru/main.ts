import { parse as parseHtml } from 'node-html-parser';
import { IResult } from '../../interfaceSett';
import { waitFor } from '../moduls';
// import { IResList } from '../arbitr/parseArbitr';

// const inn = {
//   date: '15.06.2022',
//   case_number: 'А41-43501/2022',
//   plaintiff: '"Фонд Капитального ремонта общего имущества многоквартирных домов"\n' +
//     'ИНН: 7701169833 ',
//   defendant: 'ООО "ГАЛЕРЕЯ МОЛОКОВО"\nИНН: 5024138783 ',
//   url: 'https://kad.arbitr.ru/Card/395abf9a-d892-44dc-aa19-43083171a433',
//   price: '274129.95'
// }

export class Nalogru {
  async getData(result_: IResult[], log: Function) {
    log('Парсинг egrul.nalog.ru ...');
    const result = Object.assign([], result_);
    try {
      for (let res of result) {
        try {
          await this.parseUrl(res);
          console.log(res);
          await waitFor(2000);
        } catch (error) {
          try {
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
      const restmp = await fetch("https://egrul.nalog.ru/", {
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

      if (restmp.status !== 200) { throw new Error('Status not 200') }

      const tokenJson = await restmp.json();
      if (tokenJson.captchaRequired === false) {
        const time = (new Date()).getTime();
        let url = `https://egrul.nalog.ru/search-result/${tokenJson.t}?r=${time}&_=${time + 1}`;
        const response = await fetch(url, {
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

        if (response.status !== 200) { throw new Error('Status not 200') }
        const data = await response.json();
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

// import { result } from './obj';
// (async () => {
//   function log(text: string) {
//     console.log(text)
//   }
//   const nalogru = new Nalogru();
//   const res = await nalogru.getData(result, log);
// })()
