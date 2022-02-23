import * as i from 'types';

import { client } from 'services';

import { UpdateNotesModel } from 'models';

export const updateNotes: i.UpdateNotes = async ({
  userid,
  notes,
}) => {
  try {
    UpdateNotesModel.parse({ userid, notes });
  } catch (e: any) {
    return { status: 400, error: e.issues[0].message, data: undefined, success: true };
  };

  try {
      const updatedNotes = await client.$transaction(
          notes.map((note) =>
            client.note.update({
              where: {
                  weekid_weekDay_notePosition: {
                      weekid: note.weekid,
                      notePosition: note.notePosition,
                      weekDay: note.weekDay,
                  },
              },
              data: {
                  note: note.note,
              },
            }),
          ),
      );
      return { status: 200, error: '', success: true, data: updatedNotes };
  } catch (e: any) {
      return { data: undefined, error: e.message, status: 400, success: false };
  }
};
