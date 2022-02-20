import * as i from 'types';
import { ActivityType, Category, CategoryType, Note, Week } from '@prisma/client';

export type FullWeek = Week & { categories: Category[][], notes: Note[][] }

export type AvailableDate = {
    year: number,
    weeks: number[]
}

export type TotalPerWeekActivityType = ActivityType & { count: number }
export type TotalPerWeekCategoryType = CategoryType & {count: number }
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

export type TotalPerMonthActivityType = ActivityType & { count: number }
export type TotalPerMonthCategoryType = CategoryType & {count: number }
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
