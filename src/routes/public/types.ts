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

export type FullWeek = Week & { categories: Category[][], notes: Note[][] }