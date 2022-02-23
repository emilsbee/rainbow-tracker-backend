import { client } from 'services';
import * as i from 'types';

import { UpdateCategoriesModel } from 'models';

export const updateCategories: i.UpdateCategories = async ({
    userid,
    categories,
}) => {
    try {
        UpdateCategoriesModel.parse({ userid, categories });
    } catch (e: any) {
      return { status: 400, error: e.issues[0].message, data: undefined, success: true };
    };

    try {
        const updatedCategories = await client.$transaction(
            categories.map((category) =>
              client.category.update({
                where: {
                    weekid_weekDay_categoryPosition: {
                        weekid: category.weekid,
                        categoryPosition: category.categoryPosition,
                        weekDay: category.weekDay,
                    },
                },
                data: {
                    categoryid: category.categoryid,
                    activityid: category.activityid,
                },
              }),
            ),
        );
        return { status: 200, error: '', success: true, data: updatedCategories };
    } catch (e: any) {
        return { data: undefined, error: e.message, status: 400, success: false };
    }
};
