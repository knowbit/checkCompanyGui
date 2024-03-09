import { Page } from "puppeteer";

export async function waitForSelector(page: Page, select: string, ms: number): Promise<boolean> {
  try {
    await page.waitForSelector(select, { timeout: ms })
    return true;
  } catch {
    return false;
  }
}

export async function getPdf(page: Page) {
  // Извлекаем текст из PDF документа
  const text = await page.evaluate(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const elements = document.querySelectorAll('span'); // Здесь нужно указать селектор, соответствующий тексту в PDF
        let result = '';
        elements.forEach((element) => {
          result += element.textContent + ' ';
        });
        resolve(result);
      }, 1000); // Небольшая задержка для полной загрузки PDF
    });
  });
  console.log(text);
  console.log('.>>>>>>>>>>>>');
  return text
}

// export async function pageFetch(page: Page, url: string) {
//     const res = await page.evaluate((url) => {
//       return new Promise((resolve, reject) => {
//         fetch('https://kad.arbitr.ru/Kad/PdfDocument/506bcb3b-a7da-41f8-8045-897a99d8f1ef/2a385123-5121-4eb1-9083-e75f438494f2/SIP-98-2023_20230214_Opredelenie.pdf')
//           // fetch(url)
//           .then(res => {
//             res.text().then((t) => {
//               resolve(t);
//             })
//           })
//           .catch(error => {
//             reject(error)
//           })
//       })
//     }, url)
//     // console.log(res)
//     return res;
//   }

export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => { resolve() }, ms)
  })
}

export class TypeInput {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async typeText(select: string, text: string): Promise<void> {
    try {
      await this.page.type(select, text);
    } catch (error) {
      throw error;
    }
  }

  async clearAndTypeText(select: string, text: string): Promise<void> {
    try {
      await this.selectTextClear(select);
      await this.page.type(select, text);
    } catch (error) {
      throw error;
    }
  }

  async selectTextClear(select: string): Promise<void> {
    try {
      let searchInput = await this.page.$(select);
      if (searchInput) {
        await searchInput.click({ clickCount: 3 });
        await searchInput.press('Backspace');
      } else {
        throw 'The "searchInput" is null';
      }
    } catch (error) {
      throw error
    }
  }

  async pressBackspace(select: string, numBacks: number, timeInterval?: number) {
    try {
      let searchInput = await this.page.$(select);
      if (searchInput) {
        await searchInput.click({ clickCount: 1 });
        for (let i = 0; i < numBacks; i++) {
          await searchInput.press('Backspace');
          if (timeInterval) { await waitFor(timeInterval) }
        }
      } else {
        throw 'The "searchInput" is null';
      }
    } catch (error) {
      throw error
    }
  }

}
