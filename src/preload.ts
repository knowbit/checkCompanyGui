import { ICheckboxType, IContactSources, TFormOwnershipType, ISettengs, IResult, TProxy } from './interfaceSett';
import { Arbitr } from './parsers/arbitr/main';
import { Nalogru } from './parsers/nalogru/main';
import { Sbisru } from './parsers/sbisru/main';
import { VbankCenterru } from './parsers/vbankcenterru/main';
import { Companiumru } from './parsers/companiumru/main';
import { stringify } from 'csv-stringify/sync';
import { writeFileSync } from 'node:fs';
import { PuppeteerPage } from './parsers/puppeteerPage';
import { PageFetch, ProxyRefresh } from './parsers/moduls';

import { result__ } from './parsers/nalogru/obj';
import { checkProxy } from './checkProxy';
let result = result__;


window.addEventListener('DOMContentLoaded', () => {

  const check_ip = document.getElementById('check_ip');
  check_ip?.addEventListener('click', () => {
    const proxy = getProxy();
    checkProxy(proxy)
      .then(mess => {
        alert(mess);
      })
      .catch(error => {
        console.log(error)
      })
  })

  const stop = document.getElementById('stop');
  const staus = document.getElementById('staus') as HTMLElement;
  const start = document.getElementById('start');

  let isCloseParsers: boolean;

  start?.addEventListener('click', async () => {

    if (staus.innerText === 'Остановлен ...') {
      staus.innerText = 'Работает ...';
      isCloseParsers = true;
    } else { return }

    const settengs: ISettengs = {
      boxTypeCount: getCheckBoxType(),
      dateList: getDateList(),
      miniPrice: getMinPrice(),
      contactSources: getContactSources(),
      minusWord: getMinusWord(),
      court: getCourt(),
      formOwnershipType: getFormOwnershipList(),
      proxy: getProxy()
    }

    const puppeteerPage = new PuppeteerPage(settengs.proxy);
    const proxyRefresh = new ProxyRefresh(settengs.proxy);

    async function stopParser() {
      staus.innerText = 'Остановлен ...';
      await puppeteerPage.browserClose();
      isCloseParsers = true;
    }

    try {
      stop?.addEventListener('click', async () => {
        await stopParser();
      })

      console.log(JSON.stringify(settengs))

      await puppeteerPage.init();
      const arbitrParser = new Arbitr(puppeteerPage, proxyRefresh);
      let result = await arbitrParser.prarser(settengs, addLog);

      await puppeteerPage.browserClose();

      if (settengs.contactSources.nalog_ru && isCloseParsers) { // await puppeteerPage.init();
        await puppeteerPage.init({ headless: true });
        const pageFetch = new PageFetch(puppeteerPage.page)
        const nalogru = new Nalogru(pageFetch, puppeteerPage, proxyRefresh);
        const result_ = await nalogru.getData(result, addLog);
        if (result_) {
          result = result_;
          console.log(result);
        }
        await puppeteerPage.browserClose();
      }

      if (settengs.contactSources.sbis_ru && isCloseParsers) {
        // await puppeteerPage.init();
        await puppeteerPage.init({ headless: true });
        const pageFetch = new PageFetch(puppeteerPage.page)
        const sbisru = new Sbisru(pageFetch, puppeteerPage, proxyRefresh);

        const result_ = await sbisru.getData(result, addLog);
        if (result_) {
          result = result_;
          console.log(result)
        }
        await puppeteerPage.browserClose();
      }

      if (settengs.contactSources.vbankcenter_ru && isCloseParsers) {
        // await puppeteerPage.init();
        await puppeteerPage.init({ headless: true });
        const vbankCenterru = new VbankCenterru(puppeteerPage, proxyRefresh);
        const result_ = await vbankCenterru.getData(result, addLog);
        if (result_) {
          result = result_;
          console.log(result)
        }
        await puppeteerPage.browserClose();
      }

      if (settengs.contactSources.companium_ru && isCloseParsers) {
        // await puppeteerPage.init();
        await puppeteerPage.init({ headless: true });
        const pageFetch = new PageFetch(puppeteerPage.page)
        const companiumru = new Companiumru(pageFetch, puppeteerPage, proxyRefresh);
        const result_ = await companiumru.getData(result, addLog);
        if (result_) {
          result = result_;
          console.log(result)
        }
        await puppeteerPage.browserClose();
      }

      const csv = createFile(result);
      writeFileSync(createFileName(), csv)
      await stopParser();
    } catch (error) {
      await stopParser();
      addLog('Процесс завершился ошибкой')
    }

  })

});


function getProxy(): TProxy {
  const proxyHost = document.getElementById('proxyHost') as HTMLInputElement;
  const userNamePassword = document.getElementById('userNamePassword') as HTMLInputElement;
  const changeIp = document.getElementById('changeIp') as HTMLInputElement;

  let host: string | null = null;
  let user: string | null = null;
  let pass: string | null = null;
  let change: string | null = null;

  const host_ = proxyHost.value;
  if (host_) {
    if (host_.length > 5) {
      host = proxyHost.value.trim();
    }
  }

  if (userNamePassword !== null) {
    const usrPass = userNamePassword.value.split(':');
    if (usrPass.length == 2) {
      user = usrPass[0].trim();
      pass = usrPass[1].trim();
    }
  }

  if (changeIp !== null) {
    change = changeIp.value.trim();
  }

  if (host && user && pass && change) {
    return {
      host: host,
      userName: user,
      password: pass,
      changeIp: change,
    };
  }
  return null;
}

function createFileName() {
  let ts = Date.now();
  let date_ob = new Date(ts);
  let date = date_ob.getDate();
  let month = date_ob.getMonth() + 1;
  let year = date_ob.getFullYear();
  let hour = date_ob.getHours();
  let minute = date_ob.getMinutes();
  const res_date = `Company_Arbitr_${year}-${month}-${date}-${hour}-${minute}.csv`;
  return res_date;
}

function createFile(result: IResult[]) {
  const keys: string[] = [];
  for (const res of result) {
    for (const key in res) {
      if (key === 'type') { continue }
      if (key === 'type') { continue }
      if (key === 'ИНН') { continue }
      if (key === 'ОГРН') { continue }
      if (key === 'Номер дела') { continue }
      if (key === 'Дата присвоения ОГРНИП') { continue }
      if (key === 'Дата присвоения ОГРН') { continue }
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
  }

  let data = [];
  data.push(keys);

  for (const res of result) {
    const line: string[] = new Array(keys.length);
    for (const key in res) {
      if (key === 'type') { continue }
      const i = keys.indexOf(key);
      line[i] = res[key as never];
    }
    data.push(line);
  }
  return stringify(data);
}

function addLog(text: string) {
  try {
    const log = document.querySelector('.log-scroll');
    if (log) {
      const span = document.createElement('span');
      span.innerText = text;
      const br = document.createElement('br');
      log.append(span)
      log.append(br)
      span.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  } catch (error) {
    console.log(error);
  }
}

function getFormOwnershipList(): TFormOwnershipType[] | null {
  const result: TFormOwnershipType[] = []
  const formOwnershipType = document.getElementsByClassName('formOwnershipType');
  for (const formOwn_ of formOwnershipType) {
    const formOwn = formOwn_ as HTMLInputElement;
    if (formOwn.checked) {
      const span = document.querySelector(`.${formOwn.name}`) as HTMLElement;
      result.push(span.innerText as TFormOwnershipType);
    }
  }
  if (result.length === 0) {
    return null;
  }
  return result;
}

function getCourt(): string | null {
  const res = (document.getElementById('inputText') as HTMLInputElement).value;
  if (res && res.length > 2) {
    console.log(res)
    return res;
  }
  return null;
}

function getMinusWord(): string[] | null {
  const minus_word = document.getElementById('minus_word') as HTMLInputElement;
  let arr_minus: string[] = [];
  const re = new RegExp('  |\n', 'g');
  if (minus_word) {
    const rawText = minus_word.value.split(',');
    arr_minus = rawText.map(elem => {
      while (elem.includes('  ')) {
        elem = elem.replace(re, ' ');
      }
      return elem.trim();
    })
    arr_minus = arr_minus.filter(elem => elem.length);
  }
  if (arr_minus.length > 0) {
    return arr_minus
  }
  return null;
}

function getContactSources(): IContactSources {
  type resultType = 'nalog_ru' | 'sbis_ru' | 'vbankcenter_ru' | 'companium_ru';
  const result = {
    nalog_ru: false,
    sbis_ru: false,
    vbankcenter_ru: false,
    companium_ru: false
  };
  const checkboxGetContact = document
    .getElementsByClassName('checkboxGetContact') as HTMLCollectionOf<HTMLInputElement>;
  for (let ch of checkboxGetContact) {
    result[ch.name as resultType] = ch.checked;
  }
  return result;
}

function getMinPrice(): string | null {
  const mini_price = document.getElementById('min_price') as HTMLInputElement;
  const res = mini_price.value;
  if (res.length > 0) {
    console.log(res)
    return res
  }
  return null;
}

function getCheckBoxType(): ICheckboxType {
  type resultCheckType = 'administrative' | 'civil' | 'bankruptcy';
  const result = {
    administrative: false,
    civil: false,
    bankruptcy: false
  };
  const checkboxType = document.querySelectorAll('.checkboxType');
  for (let ch of checkboxType) {
    const check = ch as HTMLInputElement;
    const key = check.getAttribute('name') as resultCheckType;
    result[key] = check.checked;
  }
  return result;
}

function getDateList(): string[] | null {
  function getNextDate(date_: string, operator?: 'start') {
    const date = new Date(date_);
    const currentDate = date;
    let nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    if (operator) {
      nextDate = new Date(currentDate.getTime());
    }
    const dd = String(nextDate.getDate()).padStart(2, '0');
    const mm = String(nextDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = String(nextDate.getFullYear()).padStart(2, '0');
    return {
      numDate: String(dd) + String(mm) + String(yyyy),
      stringDate: yyyy + '-' + mm + '-' + dd,
    }
  }
  const startDate = (document.querySelector('#startDate') as HTMLInputElement).value;
  const stopDate = (document.querySelector('#stopDate') as HTMLInputElement).value;
  const re = new RegExp('-', 'g');
  const startDateNumber = Number(startDate.replace(re, ''));
  const stopDateNumber = Number(stopDate.replace(re, ''));
  if (startDateNumber > stopDateNumber) { return null }
  const timeDiff = Math.abs(
    (new Date(stopDate)).getTime() - (new Date(startDate)).getTime()
  );
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

  const resultDates = [];
  const { numDate, stringDate } = getNextDate(startDate, 'start');
  resultDates.push(numDate);
  let tmpDate = stringDate;

  for (let i = 0; i < diffDays; i++) {
    const { numDate, stringDate } = getNextDate(tmpDate);
    tmpDate = stringDate;
    resultDates.push(numDate);
  }
  return resultDates;
}

