export type MainCategory = '인사' | '총무' | '법무' | '재무' | '지원사업' | '경영진비서';

export interface Task {
  date: string;
  mainCategory: MainCategory;
  subCategory: string;
  detail: string;
}
