import { IResult, IRawResList } from "../../interfaceSett"

export class CreateRsult {
  private result_: IResult[] = [];
  add(raw: IRawResList, minusWord: boolean, price: number, isChecked: boolean): void {
    try {
      if (minusWord) { return }
      if (price === 0 && !isChecked) { return }
      const nameInn = raw.defendant.trim().split('ИНН: ');
      if (nameInn.length < 2) { return }
      const name = nameInn[0].trim();
      const inn = nameInn[1].trim();
      const res: IResult = {
        'Url kad.arbitr': raw.url,
        'Название': name,
        'ИНН': inn,
        'Номер дела': raw.case_number,
        'Сумма иска': String(price),
        'Проверить сумму иска': isChecked ? 'да' : 'нет',
      };
      console.log(res);
      this.result_.push(res);
    } catch (error) {
      console.log(raw)
      throw error;
    }
  }

  get result(): IResult[] {
    return this.result_;
  }
}
