export type MainCategory = string;

export interface Task {
  date: string;
  mainCategory: MainCategory;
  subCategory: string;
  detail: string;
}
