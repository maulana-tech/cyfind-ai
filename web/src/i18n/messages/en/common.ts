/**
 * Shared UI vocabulary (buttons, states, common labels) used across pages.
 * Add entries here only when a string appears in multiple areas; anything
 * page-specific belongs in that page's own namespace file.
 */

const common = {
  Save: "Save",
  Cancel: "Cancel",
  Confirmed: "Confirmed",
  Delete: "Delete",
  Edit: "Edit",
  Search: "Search",
  Retry: "Retry",
  Off: "Off",
  "Loading…": "Loading…",
  Version: "Version",
  "Switch language": "Switch language",
  Confirm: "Confirm",
  Yes: "Yes",
  No: "No",
  All: "All",
  Status: "Status",
  Name: "Name",
  Type: "Type",
  Actions: "Actions",
  Time: "Time",
  Details: "Details",
} satisfies Record<string, string>;

export default common;
