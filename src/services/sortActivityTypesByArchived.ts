import { ActivityType } from '@prisma/client';

/**
 * Sorts given activity types such that unarchived ones come first and then archived ones.
 * @param activityTypes
 */
 export const sortActivityTypesByArchived = (activityTypes:ActivityType[]):ActivityType[] => {
    const returnArr:ActivityType[] = [];
    const archivedArr:ActivityType[] = [];

    for (let i = 0; i < activityTypes.length; i++) {
        if (!activityTypes[i].archived) {
            returnArr.push(activityTypes[i]);
        } else {
            archivedArr.push(activityTypes[i]);
        }
    }

    return returnArr.concat(archivedArr);
};
