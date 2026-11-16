import { createServerFn } from "@tanstack/react-start";
import { getDeskState as getDeskStateServer, unlockDesk as unlockDeskServer } from "./desk.server";

export const getDeskState = createServerFn({ method: "GET" }).handler(async () => {
  return getDeskStateServer();
});

export const unlockDesk = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; code: string }) => data)
  .handler(async ({ data }) => {
    return unlockDeskServer(data);
  });
