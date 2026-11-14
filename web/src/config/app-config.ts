import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "CYFIND",
  version: packageJson.version,
  copyright: `© ${currentYear}, CYFIND.`,
  meta: {
    // Static-export metadata is baked into the exported <head>, so it can't
    // follow the client-side language switch — kept in English (UI default).
    title: "CYFIND — Autonomous Pentest Console",
    description: "Console for the LLM-driven autonomous penetration testing system",
  },
};
