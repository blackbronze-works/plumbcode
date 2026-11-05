export const GITHUB_POPUP_CHANNEL = "plumbcode-github";

export type GithubPopupMessage =
  | { type: "done" }
  | { type: "error"; error: string };
