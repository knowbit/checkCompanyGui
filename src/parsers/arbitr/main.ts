import { IRawResList, IResult, ISettengs, TProxy } from "../../interfaceSett";
import { ProxyRefresh, waitFor } from "../moduls";
import { PuppeteerPage } from "../puppeteerPage";
import { ParseArbitr } from "./parseArbitr";
import { parse as parseHtml } from 'node-html-parser';
import { CreateRsult } from "./createResult";

export class Arbitr {
  constructor(
    private puppeteerPage: PuppeteerPage,
    private proxyRefresh: ProxyRefresh
  ) { }

  async prarser(setting: ISettengs, log: Function) {
    try {
      const isAlertSel = '#js > div.b-promo_notification.b-promo_notification--without_link > div.b-promo_notification-popup_wrapper > div > div > div > div > a.b-promo_notification-popup-close.js-promo_notification-popup-close';
      await this.puppeteerPage.goto('https://kad.arbitr.ru/');

      log('Парсинг kad.arbitr.ru ...');
      let parseArbitr = new ParseArbitr(this.puppeteerPage.page, setting);
      await waitFor(500);
      const isNH = await this.puppeteerPage.page.content();
      if (!!parseHtml(isNH).querySelector(isAlertSel)) {
        await this.puppeteerPage.page.click(isAlertSel);
      }
      let rawResutUrls: IRawResList[] = await parseArbitr.getUrls();
      if (setting.formOwnershipType) {
        rawResutUrls = filterUrls(rawResutUrls, setting.formOwnershipType);
      }
      console.log(rawResutUrls.length, 'Sorted.');

      log(`Найдено ${String(rawResutUrls.length)} подходящих ссылок ...`);
      const createResult = new CreateRsult();

      let browserRestart = 0;

      log(`Обработка найденых ссылок ...`);
      // for (let i = 0; i < rawResutUrls.length; i++) {
      for (let i = 0; i < 10; i++) {
        let err = 0;
        while (true) {
          try {
            if (browserRestart++ > 34) {
              await this.puppeteerPage.browserClose();
              await this.proxyRefresh.switch();
              await this.puppeteerPage.init({ headless: true });
              parseArbitr = new ParseArbitr(this.puppeteerPage.page, setting);
              await waitFor(3000);
              browserRestart = 0;
            }

            const num = await parseArbitr.getPagePrice(rawResutUrls[i]);
            const isWord = await parseArbitr.filterWords();
            const isCheckSum = parseArbitr.isCheckedSum(num);
            console.log(num, 'price');
            console.log(isWord, 'isWord');
            console.log(isCheckSum, 'isCheckSum');
            if ((num >= Number(setting.miniPrice) && !isWord) || isCheckSum) {
              rawResutUrls[i].price = String(num);
              createResult.add(rawResutUrls[i], isWord, num, isCheckSum)
              log(`kad.arbitr.ru ${i}/${rawResutUrls.length}`)
            }
            break
          } catch (error) {
            console.log(error);
            console.log('^^^^^^^^^^^^^^^');
            if (err++ > 9) {
              try {
                await this.puppeteerPage.browserClose();
              } catch { }
              console.log('process.exit() &&&&&&&&&&&&&&&&&&&&')
              await this.proxyRefresh.switch();
              await this.puppeteerPage.init({ headless: true });
              parseArbitr = new ParseArbitr(this.puppeteerPage.page, setting);
              await waitFor(9000);
            }
          }
        }
      }

      const resultCompany: IResult[] = createResult.result;
      console.log(resultCompany);
      console.log(resultCompany.length, ' Result Urls !!!');
      log(`Парсинг kad.arbitr.ru завершён. \n Найдено ${resultCompany.length} шт.  ...`);
      return resultCompany;
    } catch (error) {
      console.log(error)
      throw error;
    }
  }
}

function filterUrls(arr: IRawResList[], formOwnershipType: string[]): IRawResList[] {
  arr = arr.filter(elem => {
    const sp = elem.defendant.split(' ');
    return formOwnershipType.includes(sp[0]);
  })

  return arr.reduce((pow, cur) => {
    for (let el of pow) {
      if (cur.url === el.url) {
        return pow;
      }
    }
    pow.push(cur);
    return pow;
  }, [] as IRawResList[]);
}
