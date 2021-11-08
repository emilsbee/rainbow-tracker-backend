import * as i from "types";

/**
 * Sorts given category types such that unarchived ones come first and then archived ones.
 * @param categoryTypes
 */
export const sortCategoryTypesByArchived = (categoryTypes:i.CategoryType[]):i.CategoryType[] => {
    const returnArr:i.CategoryType[] = [];
    const archivedArr:i.CategoryType[] = [];

    for (let i = 0; i < categoryTypes.length; i++) {
        if (!categoryTypes[i].archived) {
            returnArr.push(categoryTypes[i]);
        } else {
            archivedArr.push(categoryTypes[i]);
        }
    }

    return returnArr.concat(archivedArr);
};

/**
 * Sorts given activity types such that unarchived ones come first and then archived ones.
 * @param activityTypes
 */
export const sortActivityTypesByArchived = (activityTypes:i.ActivityType[]):i.ActivityType[] => {
    const returnArr:i.ActivityType[] = [];
    const archivedArr:i.ActivityType[] = [];

    for (let i = 0; i < activityTypes.length; i++) {
        if (!activityTypes[i].archived) {
            returnArr.push(activityTypes[i]);
        } else {
            archivedArr.push(activityTypes[i]);
        }
    }

    return returnArr.concat(archivedArr);
};
