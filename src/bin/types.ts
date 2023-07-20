/** Types
 * 
 * All of the types used in sudsjs are here except for the schema which is in types-schema,
 */


import {Properties} from "./types-schema";

/** Imporsed with slightly different names so can be added to. */
import { Request as request, Response as response, } from "express"

export type Id= number | string;
export type Mode = "list" | "listrow" | "new" | "populate" | "update" | "delete" | "";

export type Request=request & {
  files: any;
  csrfToken: Function;
  session: any;
};

export type LabelsValues = [
  string[],
  string[]
]


export type Dictionary =  {
   [key: string]: string | string[] | number | number[] | object | object[] | boolean | Dictionary 
};


export type Record =  {
  createdAt: number;
  updatedAt: number;
  [key: string]: string | string[] | number | number[] | object | object[] | boolean | Dictionary 
};


export type Response = response;

/** Reports */
export type View = {
  fields?: Properties;
  sortable: boolean;
};

export type ViewData =  {
  output: string;
  footnote?: string;
  heading?: string;
  headerTags?: string;
  pageHeaderTags?: string;
}

export type Search = {
  andor?: string;
  searches: string[][];
  view?: View;
}


export type ReportData = {
  table: string;
  view?: View;
  title?: string;
  searchFields?: string[];
  search?: Search;
  columns?: string[];
  friendlyName?: string;
  addRow?: string;
  open?: string;
  openGroup?: string;
  sort?: string[];
  hideEdit?: boolean;
  hideDetails?: boolean;
  description?: string;
  headingText?: string;
  limit?: number;
  sortable?: boolean;

}

/** Audit trail */
export type Audit = {
  id?: string | number;
  updatedBy: any;        // depends on database
  createdAt: number;
  updatedAt: number;
  tableName: string;
  mode: string;
  row: any;
  data: string;

}

