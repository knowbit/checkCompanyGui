// import path from 'path';
// import { parse as parseHtml } from 'node-html-parser';
// import fs from 'node:fs/promises';
// import { writeFile, readFile, appendFile } from 'fs/promises';
// import { Browser, Page } from 'puppeteer';
// import { ISettengs } from '../../interfaceSett';
// import { waitFor, waitForSelector } from '../moduls';
// import { PuppeteerPage } from '../puppeteerPage';
// import { SetSettings } from './setSettings';
// import { GetPrice } from './getPrice';

// export type NextSep = { val: string, isNext: boolean };

// export interface IResList {
//   date: string,
//   case_number: string,
//   plaintiff: string,
//   defendant: string,
//   url: string,
//   price?: string,
// };

// const setting: ISettengs = {
//   boxTypeCount: {
//     administrative: false,
//     civil: true,
//     bankruptcy: false
//   },
//   // dateList: ["14012024"],
//   // dateList: ["12052023"],
//   dateList: ["15062022"],
//   miniPrice: "229999",
//   contactSources: {
//     nalog_ru: true,
//     sbis_ru: false,
//     vbankcenter_ru: false
//   },
//   minusWord: ["судебный приказ", "о возвращении", "отказ от иска", "мировое соглашение", "встречный иск"],
//   court: "АС Московской области",
//   formOwnershipType: ["ООО", "ЗАО", "ТСЖ", "ЖСК", "ТД"]
// };

// export class ParseArbitr {
//   private selectSearch = '#b-form-submit > div > button';
//   private selectList = '#b-cases > tbody:nth-child(2) > tr';
//   private page: Page;
//   private setting: ISettengs;

//   constructor(page: Page, setting: ISettengs) {
//     this.page = page;
//     this.setting = setting;
//   }

//   async getPagePrice(rawResutUrls: IResList[]): Promise<IResList[]> {
//     try {
//       const resutUrls: IResList[] = [];
//       for (let i = 0; i < rawResutUrls.length; i++) {
//         await waitFor(1000);
//         await this.page.goto(rawResutUrls[i].url);
//         await waitForSelector(this.page, '.b-sicon', 8000);
//         await this.page.click('.b-sicon');
//         let isLoad = await waitForSelector(this.page, '.b-chrono-item', 5000);
//         await waitFor(500);
//         const content = await this.page.content();
//         await waitFor(500);
//         const html = parseHtml(content);
//         const list = html.querySelectorAll('.b-chrono-item');
//         for (let l of list) {
//           const getPrece = new GetPrice();
//           const text = l.querySelector('.additional-info')?.innerText;
//           if (text) {
//             const price = getPrece.page(text);
//             if (price >= Number(setting.miniPrice)) {
//               rawResutUrls[i].price = String(price);
//               resutUrls.push(rawResutUrls[i])
//               console.log(resutUrls.at(-1));
//             }
//           }
//         }
//         console.log('=================================')
//       }
//       return resutUrls;
//     } catch (error) {
//       throw error;
//     }
//   }

//   async getUrls(): Promise<IResList[]> {
//     try {
//       const setSettings = new SetSettings(this.page);
//       const result: IResList[] = [];
//       if (!setting.dateList) { return result }
//       for (let i = 0; i < setting.dateList.length; i++) {
//         if (setting.court) {
//           await setSettings.nameCourt(setting.court);
//         }
//         await setSettings.setData(setting.dateList[i]);
//         await this.page.click(this.selectSearch);
//         let isList = await waitForSelector(this.page, this.selectList, 9000);
//         if (!isList) { continue }
//         await setSettings.typeCourt(setting.boxTypeCount);

//         let nextSelect: NextSep = { val: `a[href="#page1"]`, isNext: true };
//         while (nextSelect.isNext) {
//           isList = await waitForSelector(this.page, this.selectList, 9000);
//           if (!isList) { continue }
//           const res = await this.parseUrls();
//           console.log(res.length, ' >>>>>>>>>')
//           result.push(...res);
//           await waitFor(500);
//           nextSelect = await this.nextSep(nextSelect.val);
//           if (!nextSelect.isNext) { break }
//           console.log(nextSelect)
//           await waitFor(1500);
//           await this.page.click(nextSelect.val);
//         }
//         // console.log(filterUrls(result, setting.formOwnershipType));
//       }
//       return result;
//     } catch (error) {
//       throw error;
//     }
//   }

//   async parseUrls() {
//     const html = await this.page.content();
//     const result: IResList[] = [];
//     const list = parseHtml(html).querySelectorAll(this.selectList);
//     if (list.length === 0) { return result }
//     for (const elem of list) {
//       const td = elem.querySelectorAll('td');
//       const span = td[0].querySelector('span');

//       const date = span?.innerText.trim();
//       const url = td[0].querySelector('a')?.getAttribute('href')?.trim();
//       const case_number = td[0].querySelector('a')?.innerText.trim();

//       let plaintiff = td[2].querySelector('span > span > strong')?.innerText.trim();
//       let plaintiffINN = td[2].querySelector('span > span > div')?.innerText.trim();

//       let defendant = td[3].querySelector('span > span > strong')?.innerText.trim();
//       let defendantINN = td[3].querySelector('span > span > div')?.innerText.trim();

//       if (!plaintiff || !defendant || !date || !url || !case_number) { continue }

//       if (plaintiffINN && (plaintiffINN.includes('ИНН') || plaintiffINN.includes('ОГРН'))) {
//         plaintiff += `\n${plaintiffINN} `
//       }
//       if (defendantINN && (defendantINN.includes('ИНН') || defendantINN.includes('ОГРН'))) {
//         defendant += `\n${defendantINN} `
//       }
//       const res = {
//         date: date,
//         case_number: case_number,
//         plaintiff: plaintiff,
//         defendant: defendant,
//         url: url
//       };
//       result.push(res)
//     }
//     return result;
//   }

//   async nextSep(currentSelect: string): Promise<NextSep> {
//     try {
//       const resultDefault: NextSep = { val: '', isNext: false };
//       const rawHtml = await this.page.content();
//       const html = parseHtml(rawHtml);
//       const A = html.querySelectorAll('#pages a');
//       let selectNext: string[] = [];
//       for (let a of A) {
//         const href = a.getAttribute('href');
//         if (href?.includes('#page')) {
//           selectNext.push(href.replace('#page', ''))
//         }
//       }

//       selectNext = [...(new Set(selectNext))]
//       selectNext.sort((a, b) => Number(a) - Number(b));
//       selectNext = selectNext.map(elem => `a[href="#page${elem}"]`);

//       let len = selectNext.length - 1;
//       let inof = selectNext.indexOf(currentSelect);
//       if (inof > -1 && inof < len) {
//         resultDefault.val = selectNext[inof + 1]
//         resultDefault.isNext = true;
//         return resultDefault;
//       }
//       return resultDefault;
//     } catch (error) {
//       throw error;
//     }
//   }

// }


// async function startParse(page: Page, arrFirm: string[]) {
//   try {
//     const backup = path.join(process.cwd(), 'static', 'backup');
//     const step = path.join(process.cwd(), 'static', 'step.txt');
//     const data = path.join(process.cwd(), 'static', 'data.json');
//     let result: string[] = [];
//     try {
//       await fs.stat(data)
//       const backArr = (await readFile(data)).toString().split('\n');
//       backArr.forEach(elem => {
//         result.push(JSON.parse(elem));
//       })
//     } catch { }

//     let start = Number((await readFile(step)).toString());
//     console.log('Количество строк:', arrFirm.length)

//     const files = await fs.readdir(backup);
//     for (let f of files) {
//       await fs.rm(`${backup}/${f}`, { recursive: true })
//     }
//     try {
//       await fs.rm(data, { recursive: true })
//     } catch { }
//     console.log('Процесс завершен!');
//     return result;
//   } catch (error) {
//     console.log(error)
//     throw error;
//   }
// }

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

// // function createCsv(rawData) {
// //   try {
// //     const data = [['Дата', 'Номер дела', 'Истец', 'Ответчик', 'URL']];
// //     const tmp = [];

// //     for (let elem of rawData) {
// //       if (!tmp.includes(elem.case_number)) {
// //         data.push([elem.date, elem.case_number, elem.plaintiff, elem.defendant, elem.url]);
// //         tmp.push(elem.case_number);
// //       }
// //     }
// //     return (() => {
// //       let result = '';
// //       for (let t = 0; t < data.length; t++) {
// //         for (let i = 0; i < data[t].length; i++) {
// //           const re = new RegExp('"', 'g')
// //           data[t][i] = data[t][i].replace(re, '""')
// //           if (data[t][i].includes('\n') || data[t][i].includes(',')) {
// //             data[t][i] = `"${data[t][i]}"`;
// //           }
// //         }
// //         result += `${data[t].join(',')} \n`;
// //       }
// //       return result;
// //     })()
// //   } catch (error) {
// //     throw error;
// //   }
// // }


// // if (serverProxy && loginProxy && passwdProxy) {
// //   args.push(`--proxy-server=${serverProxy}`);
// // }
// // if (serverProxy && loginProxy && passwdProxy) {
// //   await page.authenticate({ loginProxy, passwdProxy });
// //   await page1.authenticate({ loginProxy, passwdProxy });
// // }
