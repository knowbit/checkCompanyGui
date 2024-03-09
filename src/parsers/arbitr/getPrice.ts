
export class GetPrice {
  page(str: string): number | null {
    try {
      str = str.toUpperCase();
      const key = 'Сумма исковых требований'.toUpperCase();
      let price = '0';
      if (str.includes(key)) {
        let rawPrice = str.split(`${key} `)[1];
        if (rawPrice) {
          const rawArr = rawPrice.split(' ');
          for (let p of rawArr) {
            if (p.length < 3) continue;
            price = rawPrice.replace(',', '.');
          }
        }
      }
      const numPrice = Number(price);
      if (isNaN(numPrice)) {
        return null;
      }
      return numPrice;
    } catch (error) {
      throw error;
    }
  }

  pdf(str: string): number | null {
    try {
      str = str.toUpperCase();
      const key = ' руб.'.toUpperCase();
      const part1 = str.split(key)[0];
      if (!part1) { return 0 }
      const arrStr = part1.split(' ');
      let sum = '';
      for (let i = arrStr.length - 1; i >= 0; i--) {
        const elem = arrStr[i].replace(',', '.').replace(' ', '');
        if (isNaN(Number(elem))) {
          if (sum.length === 0) { continue }
          break;
        }
        sum = elem + sum;
      }
      const numPrice = Number(sum);
      if (isNaN(numPrice)) {
        return null;
      }
      return numPrice;
    } catch (error) {
      throw error;
    }
  }
}
