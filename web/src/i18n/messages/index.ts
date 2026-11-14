/**
 * Namespace registry — merge every <lang>/<ns>.ts fragment here.
 *
 * One file per namespace (roughly per page/feature area) exists so parallel
 * translation batches never write to the same file. Add imports in pairs
 * (en + id) when a new namespace lands.
 */

import type { Lang } from "../config";
import enAuthLogin from "./en/auth-login";
import enAuthSetup from "./en/auth-setup";
import enCommon from "./en/common";
import enComponentsAgentEditor from "./en/components-agent-editor";
import enComponentsApprovalRecords from "./en/components-approval-records";
import enFunctionAssets from "./en/function-assets";
import enFunctionChat from "./en/function-chat";
import enFunctionCommands from "./en/function-commands";
import enFunctionDashboard from "./en/function-dashboard";
import enFunctionFindings from "./en/function-findings";
import enFunctionFindingsDetail from "./en/function-findings-detail";
import enFunctionFindingsFindingsTable from "./en/function-findings-findings-table";
import enFunctionFindingsLineage from "./en/function-findings-lineage";
import enFunctionLlmRecords from "./en/function-llm-records";
import enFunctionSync from "./en/function-sync";
import enFunctionTasks from "./en/function-tasks";
import enFunctionTasksDetailOverviewTab from "./en/function-tasks-detail-overview-tab";
import enFunctionTasksDetailSessionsTab from "./en/function-tasks-detail-sessions-tab";
import enFunctionTraffic from "./en/function-traffic";
import enLibApi from "./en/lib-api";
import enMainChrome from "./en/main-chrome";
import enMockData from "./en/mock-data";
import enMockHandler from "./en/mock-handler";
import enNav from "./en/nav";
import enStatus from "./en/status";
import enSystemAgents from "./en/system-agents";
import enSystemIntercept from "./en/system-intercept";
import enSystemInterceptAssets from "./en/system-intercept-assets";
import enSystemLlm from "./en/system-llm";
import enSystemLlmRetry from "./en/system-llm-retry";
import enSystemLogs from "./en/system-logs";
import enSystemMcp from "./en/system-mcp";
import enSystemNotify from "./en/system-notify";
import enSystemSettings from "./en/system-settings";
import enSystemSettingsUpdateCard from "./en/system-settings-update-card";
import enSystemSkills from "./en/system-skills";
import enSystemTools from "./en/system-tools";
import idAuthLogin from "./id/auth-login";
import idAuthSetup from "./id/auth-setup";
import idCommon from "./id/common";
import idComponentsAgentEditor from "./id/components-agent-editor";
import idComponentsApprovalRecords from "./id/components-approval-records";
import idFunctionAssets from "./id/function-assets";
import idFunctionChat from "./id/function-chat";
import idFunctionCommands from "./id/function-commands";
import idFunctionDashboard from "./id/function-dashboard";
import idFunctionFindings from "./id/function-findings";
import idFunctionFindingsDetail from "./id/function-findings-detail";
import idFunctionFindingsFindingsTable from "./id/function-findings-findings-table";
import idFunctionFindingsLineage from "./id/function-findings-lineage";
import idFunctionLlmRecords from "./id/function-llm-records";
import idFunctionSync from "./id/function-sync";
import idFunctionTasks from "./id/function-tasks";
import idFunctionTasksDetailOverviewTab from "./id/function-tasks-detail-overview-tab";
import idFunctionTasksDetailSessionsTab from "./id/function-tasks-detail-sessions-tab";
import idFunctionTraffic from "./id/function-traffic";
import idLibApi from "./id/lib-api";
import idMainChrome from "./id/main-chrome";
import idMockData from "./id/mock-data";
import idMockHandler from "./id/mock-handler";
import idNav from "./id/nav";
import idStatus from "./id/status";
import idSystemAgents from "./id/system-agents";
import idSystemIntercept from "./id/system-intercept";
import idSystemInterceptAssets from "./id/system-intercept-assets";
import idSystemLlm from "./id/system-llm";
import idSystemLlmRetry from "./id/system-llm-retry";
import idSystemLogs from "./id/system-logs";
import idSystemMcp from "./id/system-mcp";
import idSystemNotify from "./id/system-notify";
import idSystemSettings from "./id/system-settings";
import idSystemSettingsUpdateCard from "./id/system-settings-update-card";
import idSystemSkills from "./id/system-skills";
import idSystemTools from "./id/system-tools";

/** Explicit Record type so translate() can index with an arbitrary string key. */
export const messages: Record<Lang, Record<string, string>> = {
  en: {
    ...enAuthLogin,
    ...enAuthSetup,
    ...enCommon,
    ...enComponentsAgentEditor,
    ...enComponentsApprovalRecords,
    ...enFunctionSync,
    ...enFunctionTasks,
    ...enFunctionTraffic,
    ...enFunctionTasksDetailOverviewTab,
    ...enFunctionTasksDetailSessionsTab,
    ...enFunctionAssets,
    ...enFunctionChat,
    ...enFunctionDashboard,
    ...enLibApi,
    ...enMainChrome,
    ...enMockData,
    ...enMockHandler,
    ...enNav,
    ...enStatus,
    ...enSystemIntercept,
    ...enSystemInterceptAssets,
    ...enSystemLlm,
    ...enSystemLlmRetry,
    ...enSystemMcp,
    ...enSystemAgents,
    ...enSystemLogs,
    ...enSystemTools,
    ...enFunctionCommands,
    ...enFunctionFindings,
    ...enFunctionFindingsDetail,
    ...enFunctionFindingsFindingsTable,
    ...enFunctionFindingsLineage,
    ...enFunctionLlmRecords,
    ...enSystemSettings,
    ...enSystemSettingsUpdateCard,
    ...enSystemSkills,
    ...enSystemNotify,
  },
  id: {
    ...idAuthLogin,
    ...idAuthSetup,
    ...idCommon,
    ...idComponentsAgentEditor,
    ...idComponentsApprovalRecords,
    ...idFunctionSync,
    ...idFunctionTasks,
    ...idFunctionTraffic,
    ...idFunctionTasksDetailOverviewTab,
    ...idFunctionTasksDetailSessionsTab,
    ...idFunctionAssets,
    ...idFunctionChat,
    ...idFunctionDashboard,
    ...idLibApi,
    ...idMainChrome,
    ...idMockData,
    ...idMockHandler,
    ...idNav,
    ...idStatus,
    ...idSystemIntercept,
    ...idSystemInterceptAssets,
    ...idSystemLlm,
    ...idSystemLlmRetry,
    ...idSystemMcp,
    ...idSystemTools,
    ...idSystemAgents,
    ...idSystemLogs,
    ...idFunctionCommands,
    ...idFunctionFindings,
    ...idFunctionFindingsDetail,
    ...idFunctionFindingsFindingsTable,
    ...idFunctionFindingsLineage,
    ...idFunctionLlmRecords,
    ...idSystemSettings,
    ...idSystemSettingsUpdateCard,
    ...idSystemSkills,
    ...idSystemNotify,
  },
};
