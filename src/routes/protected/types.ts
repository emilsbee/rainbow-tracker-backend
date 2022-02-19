import * as i from "types";
import { category, note, week } from "@prisma/client";

export type CategoryType = {
    categoryid:string,
    userid:string,
    color:string,
    name:string,
    archived:boolean
};

export type ActivityType = {
    activityid:string,
    categoryid:string,
    userid:string,
    long:string,
    short:string,
    archived:boolean
};

export type Note = {
    weekid: string,
    weekDay: number,
    notePosition: number,
    stackid: string,
    userid: string,
    note: string,
    weekDayDate: string
}

export type Category = {
    weekid: string,
    weekDay: number,
    categoryPosition: number,
    userid: string,
    categoryid: string | null,
    activityid: string | null,
    weekDayDate: string
}

export type Week = {
    weekid: string,
    userid: string,
    weekNr: number,
    weekYear: number
}

export type FullWeek = week & { categories: category[][], notes: note[][] }

export type AvailableDate = {
    year: number,
    weeks: number[]
}

export type TotalPerWeekActivityType = i.ActivityType & { count: number }
export type TotalPerWeekCategoryType = i.CategoryType & {count: number }
export type TotalPerWeek = {
    categoryTypes: TotalPerWeekCategoryType[],
    activityTypes: TotalPerWeekActivityType[]
}

export type TotalPerDayCategoryType = {
    categoryid: string | null
    count: number
    weekDay: number
    name: string
}
export type TotalPerDayActivityType = {
    activityid: string | null
    count: number
    weekDay: number
}
export type TotalPerDay = {
    weekDay: number
    categories: i.TotalPerDayCategoryType[]
    activities: i.TotalPerDayActivityType[]
}

export type AvailableMonth = {
    year: number
    month: number // 1-12
    weekNr: number
}

export type TotalPerMonthActivityType = i.ActivityType & { count: number }
export type TotalPerMonthCategoryType = i.CategoryType & {count: number }
export type TotalPerMonth = {
    categoryTypes: TotalPerMonthCategoryType[],
    activityTypes: TotalPerMonthActivityType[]
}

export type TotalPerDaySpecificCategoryType = {
    categoryid: string | null
    count: number
    name: string
    color: string
}
export type TotalPerDaySpecific = {
    weekDay: number
    categories: i.TotalPerDaySpecificCategoryType[]
}
