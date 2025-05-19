import { google } from "googleapis";

export async function insertGoogleTask(
  oauth2Client: any,

  task: { title: string; notes: string | null; due?: string }
) {
  const tasks = google.tasks({ version: "v1", auth: oauth2Client });

  let targetListId;

  if (!targetListId) {
    const res = await tasks.tasklists.list();
    const taskLists = res.data.items;

    if (!taskLists || taskLists.length === 0) {
      throw new Error("No task lists found for the user");
    }

    const defaultList =
      taskLists.find((list) => list.title === "My Tasks") || taskLists[0];
    console.log("Using task list:", defaultList);
    targetListId = defaultList.id!;
  }

  try {
    if (!targetListId) {
      throw new Error("No valid task list ID available");
    }

    const response = await tasks.tasks.insert({
      tasklist: targetListId,
      requestBody: {
        title: task.title,
        notes: task.notes,
        due: task.due,
      },
    });

    console.log("Task created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}
