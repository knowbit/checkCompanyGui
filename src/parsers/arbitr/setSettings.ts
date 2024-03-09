import { Page } from "puppeteer";
import { ICheckboxType, ISettengs, TFormOwnershipType } from "../../interfaceSett"
import { TypeInput, waitFor } from "../moduls";

export class SetSettings {
  private page: Page;
  private typeInput: TypeInput;

  // date select
  private dateStart = '.from > input:nth-child(3)';
  private dateStop = '.to > input:nth-child(3)';

  private selectTypeProperty = '#sug-participants > div > textarea';
  private selectTypePropertyAdd = 'i.b-icon:nth-child(4)';

  private court = '#caseCourt > div:nth-child(1) > span:nth-child(1) > label:nth-child(1) > input:nth-child(2)';

  constructor(page: Page) {
    this.page = page;
    this.typeInput = new TypeInput(this.page);
  }

  async typeProperty(formOwnershipType: TFormOwnershipType[] | null) {
    if (!formOwnershipType) { return }
    for (const tp of formOwnershipType) {
      await this.typeInput.clearAndTypeText(this.selectTypeProperty, tp);
      await waitFor(500)
      await this.page.click('.b-icon.add');
      await waitFor(200)
    }
    this.typeInput.selectTextClear(this.selectTypeProperty);
  }

  async typeCourt(boxTypeCount: ICheckboxType): Promise<void> {
    const select = {
      administrative: '#filter-cases > li.administrative',
      civil: '#filter-cases > li.civil',
      bankruptcy: '#filter-cases > li.bankruptcy'
    };
    try {
      for (let key in boxTypeCount) {
        const k = key as keyof typeof boxTypeCount;
        if (boxTypeCount[k]) {
          await this.page.click(select[k]);
          return;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async nameCourt(courtText: string) {
    try {
      await this.typeInput.clearAndTypeText(this.court, courtText);
    } catch (error) {
      throw error;
    }
  }

  async setData(date: string) {
    try {
      await this.typeInput.clearAndTypeText(this.dateStart, date);
      await this.typeInput.clearAndTypeText(this.dateStop, date);
    } catch (error) {
      throw error;
    }
  }

}
