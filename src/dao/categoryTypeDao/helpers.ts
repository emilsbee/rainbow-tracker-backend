// Internal imports
import {CategoryType} from "../../routes/public/categoryType";
import {ActivityType} from "../../routes/public/activityType";

/**
 * Sorts given category types such that unarchived ones come first and then archived ones.
 * @param categoryTypes
 */
export const sortCategoryTypesByArchived = (categoryTypes:CategoryType[]):CategoryType[] => {
    const returnArr:CategoryType[] = []
    const archivedArr:CategoryType[] = []

    for (let i = 0; i < categoryTypes.length; i++) {
        if (!categoryTypes[i].archived) {
            returnArr.push(categoryTypes[i])
        } else {
            archivedArr.push(categoryTypes[i])
        }
    }

    return returnArr.concat(archivedArr)
}

/**
 * Sorts given activity types such that unarchived ones come first and then archived ones.
 * @param activityTypes
 */
export const sortActivityTypesByArchived = (activityTypes:ActivityType[]):ActivityType[] => {
    const returnArr:ActivityType[] = []
    const archivedArr:ActivityType[] = []

    for (let i = 0; i < activityTypes.length; i++) {
        if (!activityTypes[i].archived) {
            returnArr.push(activityTypes[i])
        } else {
            archivedArr.push(activityTypes[i])
        }
    }

    return returnArr.concat(archivedArr)
}