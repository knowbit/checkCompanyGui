import { IResult } from '../../interfaceSett';
import { waitFor } from '../moduls';
import { parse as parseHtml } from 'node-html-parser';
import { PuppeteerPage } from "../puppeteerPage";

export class ZachestnyiBiznesru {
  puppeteerPage = new PuppeteerPage();
  log: Function;
  constructor(log: Function) {
    this.log = log;
  }

  async getData(result_: IResult[]) {
    try {
      this.log('Парсинг zachestnyibiznes.ru ...');
      await this.puppeteerPage.init({ headless: false });
      const result: IResult[] = Object.assign([], result_);
      let i = 0;
      for (let res of result) {
        try {
          await this.parseUrl(res);
          await waitFor(1000);
          console.log(i++, '-------------------------------------');
        } catch (error) {
          try {
            console.log('zachestnyibiznes.ru >>>>>>>>>>>..');
            await waitFor(4000);
            await this.parseUrl(res);
          } catch { continue }
        }
      }
      this.log('Парсинг zachestnyibiznes.ru готов ...');
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

      console.log(`https://zachestnyibiznes.ru/company/ul/${result['ОГРН']}`)
      await this.puppeteerPage.goto(`https://zachestnyibiznes.ru/company/ul/${result['ОГРН']}`)
      await waitFor(500);
      let content = await this.puppeteerPage.page.content();
      let html = parseHtml(content);

      if (html.querySelector('.break-word > span') !== null) {
        await this.puppeteerPage.page.click('.break-word > span');
        await waitFor(500);
      }

      const blocks = [
        'div.row:nth-child(21)', 'div.row:nth-child(22)',
        'div.row:nth-child(23)', 'div.row:nth-child(24)',
        'div.row:nth-child(25)'
      ];

      if (html.querySelector(blocks[0])?.innerText.includes('Телефон')) {
        blocks.pop();
      } else {
        blocks.shift();
      }

      const getCont = async () => {
        const block = blocks.shift();
        console.log(block)
        if (!block) { return '' }
        const more_contacts_select = `${block} > div:nth-child(2) > a:nth-child(3)`;

        if (html.querySelector(more_contacts_select) !== null) {
          await this.puppeteerPage.page.click(more_contacts_select);
          await waitFor(200);
        }

        content = await this.puppeteerPage.page.content();
        html = parseHtml(content);
        const list = html.querySelectorAll(`${block} .break-word`);

        const res: string[] = [];
        for (let l of list) {
          res.push(l.innerText);
        }
        return res.join('; ');
      }

      const phone = await getCont();
      const mail = await getCont();
      const site = await getCont();
      const social = await getCont();

      // console.log(phone)
      // console.log(mail)
      // console.log(site)
      // console.log(social)
      result['ZachestnyiBiznesru Телефон'] = phone;
      result['ZachestnyiBiznesru Эл. почта'] = mail;
      result['ZachestnyiBiznesru Сайт'] = site;
      result['ZachestnyiBiznesru Соц. сети'] = social;

    } catch (error) {
      this.log('Парсинг zachestnyibiznes.ru закончился неудачей ...');
      console.log(error)
      throw error;
    }
  }
}

import { result } from '../nalogru/obj';

// (async () => {
//   function log(text: string) {
//     console.log(text)
//   }
//   const sbisru = new ZachestnyiBiznesru(log);
//   const res = await sbisru.getData(resResult());
// })()

// function log(text: string) {
//   console.log(text)
// }


// function resResult(): IResult[] {
//   return [{
//     "Url kad.arbitr": "https://kad.arbitr.ru/Card/7746605c-bccb-48a3-a8dc-3d993953fea3",
//     "Название": "ООО \"ЛАУНЖ КОМПАНИ\"",
//     "ИНН": "7716929029",
//     "Номер дела": "А40-4023/2024",
//     "Сумма иска": "2340000",
//     "Проверить сумму иска": "нет",
//     "type": "ul",
//     "Директор": "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР: Гасиев Тимур Хаджимуратович",
//     "КПП": "772801001",
//     "ОГРН": "1197746027621",
//     "Дата присвоения ОГРН": "23.01.2019",
//     "Адрес": "117321, РОССИЯ, Г. МОСКВА, ВН.ТЕР.Г. МУНИЦИПАЛЬНЫЙ ОКРУГ ТЕПЛЫЙ СТАН, ПРОФСОЮЗНАЯ УЛ., Д. 142, К. 1, СТР. 1, ЭТАЖ 2 КОМ. 1-26,28"
//   },
//   {
//     "Url kad.arbitr": "https://kad.arbitr.ru/Card/b2c11ff0-3696-441c-b142-a732961aa474",
//     "Название": "ООО \"СМАРТ СИТИ\"",
//     "ИНН": "9701032688",
//     "Номер дела": "А40-4022/2024",
//     "Сумма иска": "9485448",
//     "Проверить сумму иска": "нет",
//     "type": "ul",
//     "Директор": "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР: Стеблин Андрей Евгеньевич",
//     "КПП": "772301001",
//     "ОГРН": "1167746181173",
//     "Дата присвоения ОГРН": "18.02.2016",
//     "Адрес": "109316, ГОРОД МОСКВА, ВОЛГОГРАДСКИЙ ПРОСПЕКТ, ДОМ 42, КОРПУС 24, КОМНАТА 4 ЭТАЖ 1"
//   },
//   {
//     "Url kad.arbitr": "https://kad.arbitr.ru/Card/b78756ba-09cf-4086-94ae-4c363d2d1fc7",
//     "Название": "ООО \"СФЕРА\"",
//     "ИНН": "5003096500",
//     "Номер дела": "А40-4020/2024",
//     "Сумма иска": "2466859.05",
//     "Проверить сумму иска": "нет",
//     "type": "ul",
//     "Директор": "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР: Козлов Дмитрий Анатольевич",
//     "КПП": "775101001",
//     "ОГРН": "1115003008010",
//     "Дата присвоения ОГРН": "22.09.2011",
//     "Адрес": "108813, РОССИЯ, Г. МОСКВА, ВН.ТЕР.Г. ПОСЕЛЕНИЕ МОСКОВСКИЙ, МОСКОВСКИЙ Г., РАДУЖНАЯ УЛ., Д. 33"
//   },
//   {
//     "Url kad.arbitr": "https://kad.arbitr.ru/Card/0178e5ab-5c98-4f74-a8ea-ca4c876621fb",
//     "Название": "ООО \"ФАРВЕРК\"",
//     "ИНН": "7734444130",
//     "Номер дела": "А40-4016/2024",
//     "Сумма иска": "163099788.06",
//     "Проверить сумму иска": "нет",
//     "type": "ul",
//     "Директор": "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР: Идрисова Алена Мусаевна",
//     "КПП": "200401001",
//     "ОГРН": "1217700301631",
//     "Дата присвоения ОГРН": "24.06.2021",
//     "Адрес": "366019, РОССИЯ, ЧЕЧЕНСКАЯ РЕСП, ГРОЗНЕНСКИЙ М.Р-Н, ПОБЕДИНСКОЕ С.П., РАДУЖНОЕ С, ФИНСКИЙ ПЕР, Д. 6"
//   },
//   {
//     "Url kad.arbitr": "https://kad.arbitr.ru/Card/34d9104a-d58b-4790-a8aa-3d074c47cbf7",
//     "Название": "ООО \"БИЗНЕС ЛОГИСТИКА\"",
//     "ИНН": "9723022838",
//     "Номер дела": "А40-4014/2024",
//     "Сумма иска": "1049890.19",
//     "Проверить сумму иска": "нет",
//     "type": "ul",
//     "Директор": "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР: Бондаренко Андрей Александрович",
//     "КПП": "771401001",
//     "ОГРН": "1177746305538",
//     "Дата присвоения ОГРН": "28.03.2017",
//     "Адрес": "125319, ГОРОД МОСКВА, ЧЕРНЯХОВСКОГО УЛИЦА, ДОМ 16, ПОМЕЩЕНИЕ 2, КОМ.25, ЭТ.6"
//   },
//   {
//     "Url kad.arbitr": "https://kad.arbitr.ru/Card/0658489f-c17b-4c36-ab78-b673e8160a26",
//     "Название": "ООО \"ЦИСК\"",
//     "ИНН": "7719805550",
//     "Номер дела": "А40-4013/2024",
//     "Сумма иска": "515813.33",
//     "Проверить сумму иска": "нет",
//     "type": "ul",
//     "Директор": "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР: Слабых Дмитрий Игоревич",
//     "КПП": "771901001",
//     "ОГРН": "1127746169715",
//     "Дата присвоения ОГРН": "13.03.2012",
//     "Адрес": "105425, ГОРОД МОСКВА, СИРЕНЕВЫЙ БУЛЬВАР, 12, 1"
//   },
//   {
//     "Url kad.arbitr": "https://kad.arbitr.ru/Card/1e56fabb-a108-48e5-890e-fdf66a47fee2",
//     "Название": "ООО \"ПРО КРЫМ ГРУПП\"",
//     "ИНН": "9102247645",
//     "Номер дела": "А40-4010/2024",
//     "Сумма иска": "16926739.72",
//     "Проверить сумму иска": "нет",
//     "type": "ul",
//     "Директор": "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР: Шалафан Денис Андреевич",
//     "КПП": "910201001",
//     "ОГРН": "1189112034352",
//     "Дата присвоения ОГРН": "29.08.2018",
//     "Адрес": "295051, РЕСПУБЛИКА КРЫМ, СИМФЕРОПОЛЬ ГОРОД, МАЯКОВСКОГО УЛИЦА, ДОМ 12, ОФИС 22"
//   },
//   {
//     "Url kad.arbitr": "https://kad.arbitr.ru/Card/f190ee79-053f-4660-bc7f-337742272106",
//     "Название": "ООО \"ИСК \"АЛЬТАИР\"",
//     "ИНН": "7721842430",
//     "Номер дела": "А40-4009/2024",
//     "Сумма иска": "2560907.75",
//     "Проверить сумму иска": "нет",
//     "type": "ul",
//     "Директор": "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР: Ручкин Владимир Сергеевич",
//     "КПП": "772701001",
//     "ОГРН": "1147746924599",
//     "Дата присвоения ОГРН": "14.08.2014",
//     "Адрес": "117303, РОССИЯ, Г. МОСКВА, ВН.ТЕР.Г. МУНИЦИПАЛЬНЫЙ ОКРУГ ЗЮЗИНО, МАЛАЯ ЮШУНЬСКАЯ УЛ., Д. 1, К. 1, ПОМЕЩ. 1/Ц"
//   },
//   ]
// }
