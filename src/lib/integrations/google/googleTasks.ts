import { google } from "googleapis";

type OAuth2Client = typeof google.prototype.auth.OAuth2.prototype;

export async function getGoogleTasks(oauth2Client: OAuth2Client) {
  const tasksApi = google.tasks({ version: "v1", auth: oauth2Client });

  const taskListsRes = await tasksApi.tasklists.list();
  const taskLists = taskListsRes.data.items || [];

  const result: {
    listId: string;
    title: string;
    tasks: {
      id: string;
      title: string;
      notes?: string;
      status?: string;
      due?: string;
      updated?: string;
    }[];
  }[] = [];

  for (const list of taskLists) {
    const tasksRes = await tasksApi.tasks.list({ tasklist: list.id! });
    const tasks = (tasksRes.data.items || []).map((task) => ({
      id: task.id!,
      title: task.title || "",
      notes: task.notes ?? undefined,
      status: task.status ?? undefined,
      due: task.due ?? undefined,
      updated: task.updated ?? undefined,
    }));

    result.push({
      listId: list.id!,
      title: list.title || "Untitled",
      tasks,
    });
  }

  console.log(result);

  return result;
}
