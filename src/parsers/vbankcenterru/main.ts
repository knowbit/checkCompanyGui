import { IResult } from '../../interfaceSett';
import { waitFor } from '../moduls';
// import { TypeInput } from '../moduls';
import { parse as parseHtml } from 'node-html-parser';
import { PuppeteerPage } from "../puppeteerPage";
// .requisites-ul-item > section:nth-child(4) > div:nth-child(2) > button:nth-child(3)
// section.ng-star-inserted:nth-child(4) > div:nth-child(2) > button:nth-child(3)

export class VbankCenterru {
  puppeteerPage = new PuppeteerPage();
  log: Function;
  constructor( log: Function ) {
    this.log = log;
  }

  async getData(result_: IResult[]) {
    try {
      this.log('Парсинг vbankcenter.ru ...');
      await this.puppeteerPage.init({headless: false});
      const result: IResult[] = Object.assign([], result_);
      let i = 0;
      for (let res of result) {
        try {
          await this.parseUrl(res);
          console.log(i++, '-------------------------------------');
          // await waitFor(2000);
        } catch (error) {
          try {
            console.log('Sbisru >>>>>>>>>>>..');
            await waitFor(4000);
            await this.parseUrl(res);
          } catch { continue }
        }
      }
      this.log('Парсинг vbankcenter.ru готов ...');
      return result;
    } catch (error) {
      this.log('Парсинг vbankcenter.ru закончился неудачей ...');
      throw error;
    }
  }

  async parseUrl(result: IResult) {
    try {
      if (!result['ОГРН']) {return}
      await this.puppeteerPage.goto(`https://vbankcenter.ru/contragent/${result['ОГРН']}`)
      await waitFor(500);
      const content = await this.puppeteerPage.page.content();
      let html = parseHtml(content);
      const more_contacts_select = '.requisites-ul-item > section:nth-child(4) > div:nth-child(2) > button:nth-child(3) > span:nth-child(1)';

      if (html.querySelector(more_contacts_select) !== null) {
        await this.puppeteerPage.page.click(more_contacts_select)
        await waitFor(3000)
        // const elem = await this.puppeteerPage.page.$(more_contacts_select)
        // if (elem !== null) { elem.click() }
        // await this.puppeteerPage.page.$(more_contacts_select).then

        console.log('????')
        // console.log(html.querySelector(more_contacts_select) !== null)
      }                                   
      // div.mt-1:nth-child(3)
                                          // .requisites-ul-item > section:nth-child(4) > div:nth-child(2) > div:nth-child(1)
      const list = html.querySelectorAll('.requisites-ul-item > section:nth-child(4) > div:nth-child(2) > div');
      // const list = html.querySelectorAll('div.mt-1');

      console.log(list.length, ' >>>>>>');
      for (let l of list) {
        console.log(l.innerText)
      }
      // .requisites-ul-item > section:nth-child(4) > div:nth-child(2) > div:nth-child(1) > gweb-copy:nth-child(2)
      // .requisites-ul-item > section:nth-child(4) > div:nth-child(2) > div:nth-child(2) > gweb-copy:nth-child(2)
      // div.mt-1:nth-child(3) > a:nth-child(2)
      // div.mt-1:nth-child(4) > a:nth-child(2)
      // .requisites-ul-item > section:nth-child(4)

      // console.log(phone);
      // console.log(mail);

      // result['VbankCenterru Телефон'] = phone;
      // result['VbankCenterru Эл. почта'] = mail;

      console.log(result);
    } catch (error) {
      this.log('Парсинг sbis.ru закончился неудачей ...');
      throw error;
    }
  }
}

// import { result } from '../nalogru/obj';
(async () => {
  function log(text: string) {
    console.log(text)
  }
  const sbisru = new VbankCenterru(log);
  const res = await sbisru.getData(resResult());
})()

function log(text: string) {
  console.log(text)
}

function resResult(): IResult[] {
  return [
    {
      "Url kad.arbitr": "https://kad.arbitr.ru/Card/34d9104a-d58b-4790-a8aa-3d074c47cbf7",
      "Название": "ООО \"БИЗНЕС ЛОГИСТИКА\"",
      "ИНН": "9723022838",
      "Номер дела": "А40-4014/2024",
      "Сумма иска": "1049890.19",
      "Проверить сумму иска": "нет",
      "type": "ul",
      "Директор": "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР: Бондаренко Андрей Александрович",
      "КПП": "771401001",
      "ОГРН": "1167746181173",
      "Дата присвоения ОГРН": "28.03.2017",
      "Адрес": "125319, ГОРОД МОСКВА, ЧЕРНЯХОВСКОГО УЛИЦА, ДОМ 16, ПОМЕЩЕНИЕ 2, КОМ.25, ЭТ.6"
    },
    {
      "Url kad.arbitr": "https://kad.arbitr.ru/Card/0658489f-c17b-4c36-ab78-b673e8160a26",
      "Название": "ООО \"ЦИСК\"",
      "ИНН": "7719805550",
      "Номер дела": "А40-4013/2024",
      "Сумма иска": "515813.33",
      "Проверить сумму иска": "нет",
      "type": "ul",
      "Директор": "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР: Слабых Дмитрий Игоревич",
      "КПП": "771901001",
      "ОГРН": "1127746169715",
      "Дата присвоения ОГРН": "13.03.2012",
      "Адрес": "105425, ГОРОД МОСКВА, СИРЕНЕВЫЙ БУЛЬВАР, 12, 1"
    },
    {
      "Url kad.arbitr": "https://kad.arbitr.ru/Card/1e56fabb-a108-48e5-890e-fdf66a47fee2",
      "Название": "ООО \"ПРО КРЫМ ГРУПП\"",
      "ИНН": "9102247645",
      "Номер дела": "А40-4010/2024",
      "Сумма иска": "16926739.72",
      "Проверить сумму иска": "нет",
      "type": "ul",
      "Директор": "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР: Шалафан Денис Андреевич",
      "КПП": "910201001",
      "ОГРН": "1189112034352",
      "Дата присвоения ОГРН": "29.08.2018",
      "Адрес": "295051, РЕСПУБЛИКА КРЫМ, СИМФЕРОПОЛЬ ГОРОД, МАЯКОВСКОГО УЛИЦА, ДОМ 12, ОФИС 22"
    },
    {
      "Url kad.arbitr": "https://kad.arbitr.ru/Card/f190ee79-053f-4660-bc7f-337742272106",
      "Название": "ООО \"ИСК \"АЛЬТАИР\"",
      "ИНН": "7721842430",
      "Номер дела": "А40-4009/2024",
      "Сумма иска": "2560907.75",
      "Проверить сумму иска": "нет",
      "type": "ul",
      "Директор": "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР: Ручкин Владимир Сергеевич",
      "КПП": "772701001",
      "ОГРН": "1147746924599",
      "Дата присвоения ОГРН": "14.08.2014",
      "Адрес": "117303, РОССИЯ, Г. МОСКВА, ВН.ТЕР.Г. МУНИЦИПАЛЬНЫЙ ОКРУГ ЗЮЗИНО, МАЛАЯ ЮШУНЬСКАЯ УЛ., Д. 1, К. 1, ПОМЕЩ. 1/Ц"
    }
  ]
}
