export interface ICheckboxType {
  administrative: boolean;
  civil: boolean;
  bankruptcy: boolean;
}

export interface IContactSources {
  nalog_ru: boolean;
  sbis_ru: boolean;
  vbankcenter_ru: boolean;
  companium_ru: boolean;

}

export type TFormOwnershipType =
  'ООО' | 'ЗАО' | 'ТСЖ' | 'ЖСК' | 'ТД' | 'ПАО' | 'ОА' | 'ОАО' | 'ИП' | 'НАО' | 'НКО' | 'ОСК';

export type TProxy = {
  host: string;
  userName: string;
  password: string;
  changeIp: string;
} | null

export interface ISettengs {
  boxTypeCount: ICheckboxType;
  contactSources: IContactSources;
  formOwnershipType: TFormOwnershipType[] | null;
  dateList: string[] | null;
  minusWord: string[] | null;
  miniPrice: string | null;
  court: string | null;
  proxy: TProxy | null;
}

export interface IRawResList {
  date: string,
  case_number: string,
  plaintiff: string,
  defendant: string,
  url: string,
  price?: string,
};

export interface IResult {
  "Url kad.arbitr": string;
  "type"?: "fl" | "ul";
  "Номер дела": string;
  "ИНН": string;
  "Название"?: string;
  "ОГРН"?: string;
  "ОГРНИП"?: string;
  "КПП"?: string;
  "Дата присвоения ОГРН"?: string;
  "Дата присвоения ОГРНИП"?: string;
  "Директор"?: string;
  "Проверить сумму иска": "да" | "нет";
  "Адрес"?: string;
  "Сумма иска"?: string;
  "Телефон"?: string;
  "Sbisru Эл. почта"?: string;
  "Sbisru Телефон"?: string;
  "VbankCenterru Эл. почта"?: string;
  "VbankCenterru Телефон"?: string;
  "ZachestnyiBiznesru Телефон"?: string;
  "ZachestnyiBiznesru Эл. почта"?: string;
  "ZachestnyiBiznesru Соц. сети"?: string;
  "ZachestnyiBiznesru Сайт"?: string;
  "Companiumru Телефон"?: string;
  "Companiumru Эл. почта"?: string;
  "Companiumru Сайт"?: string;
}
