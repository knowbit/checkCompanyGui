import { parse as parseHtml } from 'node-html-parser';

import { Page } from 'puppeteer';

import { IRawResList, ISettengs } from "../../interfaceSett";
import { waitFor, waitForSelector } from '../moduls';
import { SetSettings } from './setSettings';
import { GetPrice } from './getPrice';

export type NextSep = { val: string, isNext: boolean };

export class ParseArbitr {
  private selectSearch = '#b-form-submit > div > button';
  private selectList = '#b-cases > tbody:nth-child(2) > tr';
  private page: Page;
  private setting: ISettengs;

  constructor(page: Page, setting: ISettengs) {
    this.page = page;
    this.setting = setting;
  }

  async getPagePrice(rawUrl: IRawResList): Promise<number> {
    try {
      await waitFor(500);
      try {
        await this.page.goto(rawUrl.url);
      } catch (error) {
        throw 'Error page.goto.'
      }
      if (await waitForSelector(this.page, '.b-sicon', 20000)) {
        const bsicon = await this.page.$$('.b-sicon');
        await waitFor(150);
        for (let el = bsicon.length - 1; el >= 0; el--) {
          try {
            await bsicon[el].click();
            await waitFor(200);
          } catch (error) {
            try {
              await waitFor(150);
              await bsicon[el].click();
              await waitFor(150);
            } catch (error) {
              throw 'Click Error >>>>>>>>>'
            }
            throw error;
          }
        }
      } else {
        throw new Error('.b-sicon timeout')
      }

      await waitFor(300)

      const pgSel = 'li.b-chrono-pagination-pager-item:nth-child(3)';
      const contentTmp = await waitForSelector(this.page, pgSel, 100)
      if (contentTmp) {
        this.page.click(pgSel);
        await waitFor(200);
      }

      let isLoad = await waitForSelector(this.page, '.b-chrono-item', 5000);
      await waitFor(500);
      const content = await this.page.content();
      await waitFor(500);
      const html = parseHtml(content);
      const list = html.querySelectorAll('.b-chrono-item');
      let price: number | null = 0;
      for (let l of list) {
        const getPrece = new GetPrice();
        const text = l.querySelector('.additional-info')?.innerText;
        if (text) {
          const price_ = getPrece.page(text);
          if (price_ !== null) {
            if (price < price_) {
              price = price_;
            }
          }
        }
      }
      return price;
    } catch (error) {
      throw error;
    }
  }

  async filterWords(): Promise<boolean> {
    try {
      const check = async () => {
        if (this.setting.minusWord === null) { return false }
        const html = await this.page.content();
        const list = parseHtml(html).querySelectorAll('.b-chrono-item');
        for (let elem of list) {
          const text = elem.innerText.toLowerCase();
          for (const word of this.setting.minusWord) {
            if (text.includes(word.toLowerCase())) {
              return true;
            }
          }
        }
        return false;
      }
      let resBool = await check();
      if (!resBool) { return resBool }
      const pgSel = 'li.b-chrono-pagination-pager-item:nth-child(2)';
      const contentTmp = await waitForSelector(this.page, pgSel, 100)
      if (contentTmp) {
        this.page.click(pgSel);
        await waitFor(200);
      }
      return await check();
    } catch (error) {
      throw error;
    }
  }

  isCheckedSum(price: number): boolean {
    try {
      if (price > 0) { return false }
      const isPdf = this.page.$('a.b-case-result-text');
      if (isPdf !== null) {
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  async getUrls(): Promise<IRawResList[]> {
    try {
      const setSettings = new SetSettings(this.page);
      const result: IRawResList[] = [];
      if (!this.setting.dateList) { return result }
      // await setSettings.typeProperty(this.setting.formOwnershipType);

      for (let i = 0; i < this.setting.dateList.length; i++) {
        if (this.setting.court) {
          await setSettings.nameCourt(this.setting.court);
        }
        await setSettings.setData(this.setting.dateList[i]);
        await this.page.click(this.selectSearch);
        let isList = await waitForSelector(this.page, this.selectList, 9000);
        if (!isList) { continue }
        await waitFor(1000);
        await setSettings.typeCourt(this.setting.boxTypeCount);
        await waitFor(500);
        isList = await waitForSelector(this.page, this.selectList, 9000);
        if (!isList) { continue }
        let nextSelect: NextSep = { val: `a[href="#page1"]`, isNext: true };
        while (nextSelect.isNext) {
          isList = await waitForSelector(this.page, this.selectList, 9000);
          await waitFor(2000);
          if (!isList) { continue }
          const res = await this.parseUrls();
          console.log(res.length, ' >>>>>>>>>')
          result.push(...res);
          await waitFor(500);
          nextSelect = await this.nextSep(nextSelect.val);
          if (!nextSelect.isNext) { break }
          console.log(nextSelect)
          await waitFor(1500);
          await this.page.click(nextSelect.val);
        }
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async parseUrls() {
    const html = await this.page.content();
    const result: IRawResList[] = [];
    const list = parseHtml(html).querySelectorAll(this.selectList);
    if (list.length === 0) { return result }
    for (const elem of list) {
      const td = elem.querySelectorAll('td');
      const span = td[0].querySelector('span');

      const date = span?.innerText.trim();
      const url = td[0].querySelector('a')?.getAttribute('href')?.trim();
      const case_number = td[0].querySelector('a')?.innerText.trim();

      let plaintiff = td[2].querySelector('span > span > strong')?.innerText.trim();
      let plaintiffINN = td[2].querySelector('span > span > div')?.innerText.trim();

      let defendant = td[3].querySelector('span > span > strong')?.innerText.trim();
      let defendantINN = td[3].querySelector('span > span > div')?.innerText.trim();

      if (!plaintiff || !defendant || !date || !url || !case_number) { continue }

      if (plaintiffINN && (plaintiffINN.includes('ИНН') || plaintiffINN.includes('ОГРН'))) {
        plaintiff += `\n${plaintiffINN} `
      }
      if (defendantINN && (defendantINN.includes('ИНН') || defendantINN.includes('ОГРН'))) {
        defendant += `\n${defendantINN} `
      }
      const res = {
        date: date,
        case_number: case_number,
        plaintiff: plaintiff,
        defendant: defendant,
        url: url
      };
      result.push(res)
    }
    return result;
  }

  async nextSep(currentSelect: string): Promise<NextSep> {
    try {
      const resultDefault: NextSep = { val: '', isNext: false };
      const rawHtml = await this.page.content();
      const html = parseHtml(rawHtml);
      const A = html.querySelectorAll('#pages a');
      let selectNext: string[] = [];
      for (let a of A) {
        const href = a.getAttribute('href');
        if (href?.includes('#page')) {
          selectNext.push(href.replace('#page', ''))
        }
      }

      selectNext = [...(new Set(selectNext))]
      selectNext.sort((a, b) => Number(a) - Number(b));
      selectNext = selectNext.map(elem => `a[href="#page${elem}"]`);

      let len = selectNext.length - 1;
      let inof = selectNext.indexOf(currentSelect);
      if (inof > -1 && inof < len) {
        resultDefault.val = selectNext[inof + 1]
        resultDefault.isNext = true;
        return resultDefault;
      }
      return resultDefault;
    } catch (error) {
      throw error;
    }
  }

}


// function compileFile(str: string) {
//   try {
//     let arr = str.split('\n');
//     arr = arr.filter((line: string) => {
//       if (line.length > 7) {
//         return true;
//       }
//       return false;
//     });

//     const result = arr.map((line: string) => {
//       let str = line.trim().replace('\t', ' ');
//       const arrStr = str.split(' ');
//       const res = arrStr[arrStr.length - 1].trim();
//       return res;
//     });
//     return result;
//   } catch (error) {
//     throw error;
//   }
// }

// function createCsv(rawData) {
//   try {
//     const data = [['Дата', 'Номер дела', 'Истец', 'Ответчик', 'URL']];
//     const tmp = [];

//     for (let elem of rawData) {
//       if (!tmp.includes(elem.case_number)) {
//         data.push([elem.date, elem.case_number, elem.plaintiff, elem.defendant, elem.url]);
//         tmp.push(elem.case_number);
//       }
//     }
//     return (() => {
//       let result = '';
//       for (let t = 0; t < data.length; t++) {
//         for (let i = 0; i < data[t].length; i++) {
//           const re = new RegExp('"', 'g')
//           data[t][i] = data[t][i].replace(re, '""')
//           if (data[t][i].includes('\n') || data[t][i].includes(',')) {
//             data[t][i] = `"${data[t][i]}"`;
//           }
//         }
//         result += `${data[t].join(',')} \n`;
//       }
//       return result;
//     })()
//   } catch (error) {
//     throw error;
//   }
// }


// if (serverProxy && loginProxy && passwdProxy) {
//   args.push(`--proxy-server=${serverProxy}`);
// }
// if (serverProxy && loginProxy && passwdProxy) {
//   await page.authenticate({ loginProxy, passwdProxy });
//   await page1.authenticate({ loginProxy, passwdProxy });
// }
