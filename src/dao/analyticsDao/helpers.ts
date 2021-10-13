// Internal imports
import {TotalPerWeek} from "../analyticsDao";

export const findTotalCountForCategory = (categoryTypes:TotalPerWeek["categoryTypes"], pickedCategoryid: string):number => {
    let res = 0

    for (let i = 0; i < categoryTypes.length; i++) {
        if (categoryTypes[i].categoryid === pickedCategoryid) {
            res = categoryTypes[i].count
        }
    }

    return res
}

export const findActivityAggregateCount = (activityTypes:TotalPerWeek["activityTypes"], pickedCategoryid: string):number => {
    let res = 0

    res = activityTypes.filter(activityType => activityType.categoryid === pickedCategoryid).map(activityType => activityType.count).reduce((prev, current) => prev + current, 0)

    return res
}