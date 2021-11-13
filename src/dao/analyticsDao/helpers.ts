import * as i from "types";

export const findTotalCountForCategory = (categoryTypes: (i.CategoryType & {count: number })[], pickedCategoryid: string):number => {
    let res = 0;

    for (let i = 0; i < categoryTypes.length; i++) {
        if (categoryTypes[i].categoryid === pickedCategoryid) {
            res = categoryTypes[i].count;
        }
    }

    return res;
};

export const findActivityAggregateCount = (activityTypes: i.TotalPerWeek["activityTypes"], pickedCategoryid: string):number => {
    let res = 0;

    res = activityTypes.filter((activityType) => activityType.categoryid === pickedCategoryid).map((activityType) => activityType.count).reduce((prev, current) => prev + current, 0);

    return res;
};
