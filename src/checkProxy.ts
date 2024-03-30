import { TProxy } from "./interfaceSett";
import { PageFetch } from "./parsers/moduls";
import { PuppeteerPage } from "./parsers/puppeteerPage";

export async function checkProxy(proxy: TProxy) {
  try {
    if (!proxy) { return 'Ошибка запроса!' }
    const whoisip = 'https://httpbin.org/ip';
    const puppeteer = new PuppeteerPage(proxy);
    await puppeteer.init({ headless: true });
    await puppeteer.goto(whoisip);
    const pageFetch = new PageFetch(puppeteer.page);
    const proxyRes = await pageFetch.request((whoisip));
    const proxyIp = JSON.parse(proxyRes).origin;
    const originRes = await fetch(whoisip);
    await puppeteer.browserClose();
    if (originRes.ok) {
      return `Ваш IP: ${(await originRes.json()).origin}\nПрокси IP: ${proxyIp}`;
    } else {
      return 'Ошибка запроса!';
    }
  } catch (err) {
    console.log(err)
    return 'Ошибка запроса!';
  }
}

// (async () => {
//   const proxy: TProxy = {
//     host: 'http://5.8.14.128:9422',
//     userName: 'TKa8r4',
//     password: '5zkArD',
//     changeIp: 'sdfsdf'
//   }
//   const res = await checkProxy(proxy);
//   console.log(res);
// })()
