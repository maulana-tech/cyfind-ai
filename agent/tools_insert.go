package agent

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/url"
	"strconv"
	"strings"

	"github.com/Autumn-27/cyfind/db"
	actool "github.com/Autumn-27/norma/tool"
)

// assetInterceptCandidates extracts the domain/IP/URL candidate strings of one asset input to be inserted, for asset-interception matching.
// A URL's host is split out and classified, so that service/endpoint assets carrying "only a URL" can also be matched by domain/IP rules.
func assetInterceptCandidates(item assetInputItem) (domains, ips, urls []string) {
	add := func(dst *[]string, s string) {
		if s = strings.TrimSpace(s); s != "" {
			*dst = append(*dst, s)
		}
	}
	add(&domains, item.Domain)
	for _, d := range item.BoundDomains {
		add(&domains, d)
	}
	add(&ips, item.IP)
	add(&ips, item.ServiceIP)
	add(&urls, item.URL)
	if item.URL != "" {
		if u, err := url.Parse(item.URL); err == nil {
			if h := u.Hostname(); h != "" {
				if net.ParseIP(h) != nil {
					add(&ips, h)
				} else {
					add(&domains, h)
				}
			}
		}
	}
	return domains, ips, urls
}

// assetInputLabel returns a short identifier for an asset to be inserted, used in the interception explanation message.
func assetInputLabel(item assetInputItem) string {
	typ := strings.TrimSpace(item.Type)
	var target string
	switch {
	case strings.TrimSpace(item.Domain) != "":
		target = strings.TrimSpace(item.Domain)
	case strings.TrimSpace(item.URL) != "":
		target = strings.TrimSpace(item.URL)
	case strings.TrimSpace(item.IP) != "":
		target = strings.TrimSpace(item.IP)
	case strings.TrimSpace(item.ServiceIP) != "":
		target = strings.TrimSpace(item.ServiceIP)
	default:
		target = "(unknown)"
	}
	if typ != "" {
		return fmt.Sprintf("[%s] %s", typ, target)
	}
	return target
}

// =====================================================================
// Unified asset insertion tools
// =====================================================================

// SetAssetStore wires the asset store and company store onto this ToolSet
// so the insert_assets, add_company_scope, and list_assets tools are active.
func (t *ToolSet) SetAssetStore(as *db.AssetStore, cs *db.CompanyStore) {
	t.as = as
	t.cs = cs
}

// assetInputItem is one element of the insert_assets "assets" array.
type assetInputItem struct {
	Type string `json:"type"` // root_domain|ip|subdomain|app|service|endpoint

	// ---- root_domain / subdomain ----
	Domain      string   `json:"domain"`
	ICP         string   `json:"icp"`
	RecordType  string   `json:"record_type"`
	RecordValue []string `json:"record_value"`

	// ---- ip ----
	IP           string           `json:"ip"`
	BoundDomains []string         `json:"bound_domains"`
	OpenPorts    []db.PortService `json:"open_ports"`

	// ---- app ----
	AppName     string `json:"app_name"`
	BundleID    string `json:"bundle_id"`
	Category    string `json:"category"`
	Description string `json:"description"`
	AppICP      string `json:"app_icp"`
	CompanyID   *int64 `json:"company_id"` // explicit company link (app only; others auto-attribute via scope)

	// ---- service (http) ----
	URL           string           `json:"url"`
	Technologies  []string         `json:"technologies"`
	StatusCode    *int             `json:"status_code"`
	ContentLength *int64           `json:"content_length"`
	PageTitle     string           `json:"page_title"`
	FaviconMMH3   string           `json:"favicon_mmh3"`
	Auth          []map[string]any `json:"auth"`
	ServiceName   string           `json:"service_name"`
	ServiceIP     string           `json:"service_ip"` // optional enrichment IP

	// ---- service (other) ----
	Port  int    `json:"port"`
	Proto string `json:"proto"`

	// ---- endpoint ----
	Method string           `json:"method"`
	Params []map[string]any `json:"params"`
}

// insertAssets is the unified insert_assets agent tool.
func (t *ToolSet) insertAssets() actool.CoreTool {
	return writeTool(
		"insert_assets",
		"Batch-register newly discovered assets; a single call may mix multiple types (see the type enum).\n"+
			"Required fields per type: root_domain->domain; ip->ip (must be IPv4/IPv6, not a hostname); subdomain->domain; app->app_name; service(HTTP)->url; service(non-HTTP)->service_name+port (at least one of ip/domain); endpoint->url+method. For the other fields, see each field's description.\n"+
			"auth/technologies/params are append-merged, not overwriting existing values.\n"+
			"Returns: {results:[{index,id,type}], errors:[{index,error}]}",
		obj(map[string]any{
			// task_id is not exposed to the model: which task a worker belongs to is assigned authoritatively by the program via SetTaskID (see handler).
			"assets": map[string]any{
				"type":        "array",
				"description": "an array of assets; each element corresponds to one asset record",
				"items": obj(map[string]any{
					"type": map[string]any{
						"type":        "string",
						"enum":        []string{"root_domain", "ip", "subdomain", "app", "service", "endpoint"},
						"description": "asset type",
					},
					// root_domain / subdomain
					"domain":      str("the root domain or subdomain (required for root_domain/subdomain)"),
					"icp":         str("ICP filing number (optional)"),
					"record_type": str("DNS record type: A/AAAA/CNAME/MX, etc. (optional for subdomain)"),
					"record_value": map[string]any{
						"type":        "array",
						"items":       map[string]any{"type": "string"},
						"description": "the DNS record values list (optional for subdomain, e.g. [\"1.2.3.4\",\"2.3.4.5\"])",
					},
					// ip
					"ip": str("the IP address; must be an IPv4/IPv6 address, not a hostname (for a hostname use the domain field with type=subdomain); required for the ip type; optional for service/endpoint types, used to associate an IP"),
					"bound_domains": map[string]any{
						"type":        "array",
						"items":       map[string]any{"type": "string"},
						"description": "the list of domains bound to this IP (optional for the ip type)",
					},
					"open_ports": map[string]any{
						"type":        "array",
						"description": "the list of open ports (optional for the ip type)",
						"items": obj(map[string]any{
							"port":    intp("port number"),
							"service": str("service name, e.g. http/ssh/mysql (optional)"),
						}, "port"),
					},
					// app
					"app_name":    str("application name (required for the app type)"),
					"bundle_id":   str("Bundle ID (optional for the app type)"),
					"category":    str("application category (optional)"),
					"description": str("application description (optional)"),
					"app_icp":     str("application ICP filing (optional)"),
					"company_id":  intp("owning company id (optional for the app type; an app cannot be auto-attributed by scope and must be specified explicitly; the id is returned by add_company_scope)"),
					// service (http)
					"url":         str("the full URL including scheme and port (required for an HTTP service; service_type is set to http automatically)"),
					"status_code": intp("HTTP response status code, e.g. 200/301/403/404 (optional)"),
					"content_length": map[string]any{
						"type":        "integer",
						"description": "HTTP response body size in bytes (optional)",
					},
					"page_title":   str("the page <title> content (optional)"),
					"favicon_mmh3": str("favicon MMH3 hash (optional)"),
					"technologies": map[string]any{
						"type":        "array",
						"items":       map[string]any{"type": "string"},
						"description": "the fingerprint/tech-stack list, e.g. [\"Nginx\",\"Vue\",\"Bootstrap\"] (optional)",
					},
					"auth": map[string]any{
						"type":        "array",
						"description": "the list of discovered credentials; each entry has fields like type/username/password (optional, append not overwrite)",
						"items":       map[string]any{"type": "object"},
					},
					// service (other, non-HTTP)
					"service_name": str("service name, e.g. ssh/mysql/redis (required for a non-HTTP service)"),
					"port":         intp("port number (required for a non-HTTP service)"),
					// endpoint
					"method": str("HTTP method: GET/POST/PUT/PATCH/DELETE, etc. (required for endpoint)"),
					"params": map[string]any{
						"type":        "array",
						"description": "the request-parameter list; each entry has location(query/body/header/path)/name/value/type (optional, append not overwrite)",
						"items":       map[string]any{"type": "object"},
					},
				}, "type"),
			},
		}, "assets"),
		func(_ context.Context, in json.RawMessage) (actool.Result, error) {
			if t.as == nil {
				return actool.Errorf("insert_assets is not enabled: AssetStore is not initialized"), nil
			}
			var a struct {
				Assets []assetInputItem `json:"assets"`
			}
			if err := json.Unmarshal(in, &a); err != nil {
				return actool.Errorf("invalid input: " + err.Error()), nil
			}
			// task_id is assigned authoritatively by the program (worker: SetTaskID), not accepted from the model — to avoid the model omitting/mis-passing it
			// and leaving an asset unassigned or assigned to the wrong task. Callers with no task context (auto/pentest/chat) have t.taskID=0.
			taskID := t.taskID

			type result struct {
				Index int    `json:"index"`
				ID    int64  `json:"id"`
				Type  string `json:"type"`
			}
			type errEntry struct {
				Index int    `json:"index"`
				Error string `json:"error"`
			}

			var results []result
			var errs []errEntry

			// Asset-gate rules are loaded once; on a read failure the judgment is skipped (insertion is not blocked).
			// Interception rules = global union task-level block; allow rules = task-level allow.
			blockRules, _ := t.as.ListAssetInterceptRules()
			var allowRules []db.AssetInterceptRule
			if t.taskID > 0 {
				if tb, ta, err := t.as.TaskInterceptRulesSplit(t.taskID); err == nil {
					blockRules = append(blockRules, tb...)
					allowRules = ta
				}
			}

			for i, item := range a.Assets {
				// Asset gate: block first then allow; a rejected asset is forbidden from insertion (skips Upsert and subsequent side effects).
				domains, ips, urls := assetInterceptCandidates(item)
				if d := db.EvaluateAssetGate(blockRules, allowRules, domains, ips, urls); !d.Allowed {
					errs = append(errs, errEntry{
						Index: i,
						Error: fmt.Sprintf("asset %s %s, insertion forbidden", assetInputLabel(item), d.Reason),
					})
					continue
				}

				typ := strings.TrimSpace(item.Type)
				var id int64
				var err error

				switch typ {
				case "root_domain":
					id, err = t.as.UpsertRootDomain(db.UpsertRootDomainReq{
						Domain: item.Domain,
						ICP:    item.ICP,
						TaskID: taskID,
					})

				case "ip":
					id, err = t.as.UpsertIP(db.UpsertIPReq{
						IP:           item.IP,
						BoundDomains: item.BoundDomains,
						OpenPorts:    item.OpenPorts,
						TaskID:       taskID,
					})

				case "subdomain":
					id, err = t.as.UpsertSubdomain(db.UpsertSubdomainReq{
						Domain:      item.Domain,
						RecordType:  item.RecordType,
						RecordValue: item.RecordValue,
						ICP:         item.ICP,
						TaskID:      taskID,
					})

				case "app":
					id, err = t.as.UpsertApp(db.UpsertAppReq{
						Name:        item.AppName,
						BundleID:    item.BundleID,
						Category:    item.Category,
						Description: item.Description,
						ICP:         item.AppICP,
						CompanyID:   item.CompanyID,
						TaskID:      taskID,
					})

				case "service":
					// distinguish HTTP vs other by presence of url
					if item.URL != "" {
						// agent may send "ip" or "service_ip" for the enrichment IP; accept both
						svcIP := item.ServiceIP
						if svcIP == "" {
							svcIP = item.IP
						}
						id, err = t.as.UpsertHTTPService(db.UpsertHTTPServiceReq{
							URL:           item.URL,
							Technologies:  item.Technologies,
							StatusCode:    item.StatusCode,
							ContentLength: item.ContentLength,
							PageTitle:     item.PageTitle,
							FaviconMMH3:   item.FaviconMMH3,
							Auth:          item.Auth,
							IP:            svcIP,
							TaskID:        taskID,
						})
					} else {
						id, err = t.as.UpsertOtherService(db.UpsertOtherServiceReq{
							Domain:      item.Domain,
							IP:          item.IP,
							Port:        item.Port,
							ServiceName: item.ServiceName,
							Auth:        item.Auth,
							TaskID:      taskID,
						})
					}

				case "endpoint":
					id, err = t.as.UpsertEndpoint(db.UpsertEndpointReq{
						URL:    item.URL,
						Method: item.Method,
						Params: item.Params,
						IP:     item.ServiceIP,
						TaskID: taskID,
					})

				default:
					errs = append(errs, errEntry{Index: i, Error: "unknown type: " + typ})
					continue
				}

				if err != nil {
					errs = append(errs, errEntry{Index: i, Error: err.Error()})
					continue
				}
				results = append(results, result{Index: i, ID: id, Type: typ})
				t.writes.Assets++
				t.anchorOwner(id)
				if taskID > 0 {
					var sourceNodeID *int64
					if t.ownerNode > 0 {
						nodeID := t.ownerNode
						sourceNodeID = &nodeID
					}
					summary := "registered by the Agent via insert_assets"
					if t.ownerNode > 0 {
						summary = fmt.Sprintf("registered by Worker intent #%d via insert_assets", t.ownerNode)
					}
					_ = t.as.SetTaskAssetSource(taskID, id, "agent", summary, sourceNodeID)
				}
				// Auto-add to the test scope (source='auto'): only for the item the worker explicitly inserted at top level, by its
				// type, adding a conservative scope; side-effect-derived assets do not go through here, so the scope is not blindly widened. A no-op when taskID=0.
				// Unrelated to the coverage switch: task_scope is the task's scope boundary (the filter basis for list/queries),
				// and the coverage switch only decides whether to use it as the denominator for metrics, not whether to accumulate the scope itself.
				{
					svcIP := item.ServiceIP
					if svcIP == "" {
						svcIP = item.IP
					}
					_ = t.as.AddAutoScope(taskID, typ, item.Domain, item.URL, svcIP)
				}
			}

			return jsonResult(map[string]any{
				"results": results,
				"errors":  errs,
			})
		},
	)
}

// onchainInputItem is one element of the insert_onchain "items" array, for any
// chain family. The model submits raw observations; the program computes the
// dedup discriminator (onchain_key) and the parent/child hierarchy from
// address+chain, exactly as it does for the host-centric kinds.
type onchainInputItem struct {
	Family  string `json:"family"`  // evm|solana|move|zk (optional; inferred from chain, else evm)
	Type    string `json:"type"`    // a kind valid for the family
	Chain   string `json:"chain"`   // chain label; defaults per family
	Address string `json:"address"` // the unit's address (parent for non-top-level kinds)
	Name    string `json:"name"`    // display name
	Note    string `json:"note"`    // free-text observation (optional)
	Key     string `json:"key"`     // explicit dedup discriminator (optional; overrides the per-kind default)

	// ---- evm: function / storage_var / role / external_dep / contract ----
	Signature      string   `json:"signature"`
	Selector       string   `json:"selector"`
	Visibility     string   `json:"visibility"`
	Mutability     string   `json:"mutability"`
	Modifiers      []string `json:"modifiers"`
	Slot           string   `json:"slot"`
	VarType        string   `json:"var_type"`
	RoleID         string   `json:"role_id"`
	Target         string   `json:"target"`   // callee / dependency address (external_dep, cpi_target)
	DepKind        string   `json:"dep_kind"` // token|oracle|protocol|library
	SourceVerified bool     `json:"source_verified"`
	Compiler       string   `json:"compiler"`

	// ---- solana ----
	Discriminator string `json:"discriminator"` // instruction discriminator
	Seeds         string `json:"seeds"`         // pda seed signature

	// ---- move ----
	Abilities []string `json:"abilities"` // resource/function abilities (copy/drop/store/key)
}

func firstNonEmptyStr(vs ...string) string {
	for _, v := range vs {
		if s := strings.TrimSpace(v); s != "" {
			return s
		}
	}
	return ""
}

// toUpsertReq turns one raw item into an UpsertOnchainAssetReq, resolving the
// chain family, computing the dedup key, and packing kind-specific detail into
// Extra. An explicit item.Key always overrides the per-kind default.
func (item onchainInputItem) toUpsertReq(taskID int64) (db.UpsertOnchainAssetReq, error) {
	typ := strings.TrimSpace(item.Type)
	family := db.OnchainFamily(item.Family, item.Chain)
	req := db.UpsertOnchainAssetReq{
		Family:  family,
		Type:    typ,
		Chain:   item.Chain,
		Address: item.Address,
		Name:    item.Name,
		Key:     strings.TrimSpace(item.Key),
		TaskID:  taskID,
		Extra:   map[string]any{},
	}
	if n := strings.TrimSpace(item.Note); n != "" {
		req.Extra["note"] = n
	}
	// needKey marks a member kind: if no discriminator could be derived, error.
	needKey := func(label string) error {
		if req.Key == "" {
			return fmt.Errorf("%s needs %s (or an explicit key)", typ, label)
		}
		return nil
	}

	switch family {
	case "evm":
		switch typ {
		case "contract":
			req.Extra["source_verified"] = item.SourceVerified
			if c := strings.TrimSpace(item.Compiler); c != "" {
				req.Extra["compiler"] = c
			}
		case "function":
			if req.Key == "" {
				req.Key = firstNonEmptyStr(item.Selector, item.Signature, item.Name)
			}
			if err := needKey("a selector, signature or name"); err != nil {
				return req, err
			}
			putIf(req.Extra, "signature", item.Signature)
			putIf(req.Extra, "selector", item.Selector)
			putIf(req.Extra, "visibility", item.Visibility)
			putIf(req.Extra, "mutability", item.Mutability)
			if len(item.Modifiers) > 0 {
				req.Extra["modifiers"] = item.Modifiers
			}
		case "storage_var":
			if req.Key == "" {
				req.Key = firstNonEmptyStr(item.Slot, item.Name)
			}
			if err := needKey("a slot or name"); err != nil {
				return req, err
			}
			putIf(req.Extra, "slot", item.Slot)
			putIf(req.Extra, "var_type", item.VarType)
			putIf(req.Extra, "visibility", item.Visibility)
		case "role":
			if req.Key == "" {
				req.Key = firstNonEmptyStr(item.RoleID, item.Name)
			}
			if err := needKey("a role_id or name"); err != nil {
				return req, err
			}
			putIf(req.Extra, "role_id", item.RoleID)
		case "external_dep":
			if req.Key == "" {
				req.Key = strings.ToLower(strings.TrimSpace(item.Target))
			}
			if err := needKey("a target address"); err != nil {
				return req, err
			}
			req.Extra["target"] = req.Key
			putIf(req.Extra, "dep_kind", item.DepKind)
		default:
			return req, fmt.Errorf("unknown evm kind %q", typ)
		}
	case "solana":
		switch typ {
		case "program":
			req.Extra["source_verified"] = item.SourceVerified
		case "instruction":
			if req.Key == "" {
				req.Key = firstNonEmptyStr(item.Discriminator, item.Name)
			}
			if err := needKey("a discriminator or name"); err != nil {
				return req, err
			}
			putIf(req.Extra, "discriminator", item.Discriminator)
		case "account":
			if req.Key == "" {
				req.Key = strings.TrimSpace(item.Name)
			}
			if err := needKey("a name"); err != nil {
				return req, err
			}
		case "pda":
			if req.Key == "" {
				req.Key = firstNonEmptyStr(item.Seeds, item.Name)
			}
			if err := needKey("seeds or a name"); err != nil {
				return req, err
			}
			putIf(req.Extra, "seeds", item.Seeds)
		case "cpi_target":
			if req.Key == "" {
				req.Key = strings.ToLower(strings.TrimSpace(item.Target))
			}
			if err := needKey("a target program id"); err != nil {
				return req, err
			}
			req.Extra["target"] = req.Key
		default:
			return req, fmt.Errorf("unknown solana kind %q", typ)
		}
	case "move":
		switch typ {
		case "module":
			putIf(req.Extra, "compiler", item.Compiler)
		case "move_function":
			if req.Key == "" {
				req.Key = firstNonEmptyStr(item.Signature, item.Name)
			}
			if err := needKey("a signature or name"); err != nil {
				return req, err
			}
			putIf(req.Extra, "signature", item.Signature)
			putIf(req.Extra, "visibility", item.Visibility)
			if len(item.Abilities) > 0 {
				req.Extra["abilities"] = item.Abilities
			}
		case "resource":
			if req.Key == "" {
				req.Key = strings.TrimSpace(item.Name)
			}
			if err := needKey("a name"); err != nil {
				return req, err
			}
			if len(item.Abilities) > 0 {
				req.Extra["abilities"] = item.Abilities
			}
		case "capability":
			if req.Key == "" {
				req.Key = strings.TrimSpace(item.Name)
			}
			if err := needKey("a name"); err != nil {
				return req, err
			}
		default:
			return req, fmt.Errorf("unknown move kind %q", typ)
		}
	case "zk":
		switch typ {
		case "circuit":
			// top-level; key stays ""
		case "signal":
			if req.Key == "" {
				req.Key = strings.TrimSpace(item.Name)
			}
			if err := needKey("a name"); err != nil {
				return req, err
			}
		default:
			return req, fmt.Errorf("unknown zk kind %q", typ)
		}
	default:
		return req, fmt.Errorf("unknown chain family %q (use evm|solana|move|zk)", family)
	}
	return req, nil
}

// putIf sets m[k] to the trimmed value only when it is non-empty.
func putIf(m map[string]any, k, v string) {
	if s := strings.TrimSpace(v); s != "" {
		m[k] = s
	}
}

// noteOnchainAsset records provenance for a freshly upserted on-chain asset:
// bump the write counter, anchor it to the owning node, and stamp the task
// asset source — mirroring insertAssets. Auto-scope is intentionally skipped:
// on-chain assets have no domain/IP host to widen a task's scope with.
func (t *ToolSet) noteOnchainAsset(id, taskID int64, via string) {
	t.writes.Assets++
	t.anchorOwner(id)
	if taskID > 0 {
		var sourceNodeID *int64
		if t.ownerNode > 0 {
			n := t.ownerNode
			sourceNodeID = &n
		}
		summary := "registered by the Agent via " + via
		if t.ownerNode > 0 {
			summary = fmt.Sprintf("registered by Worker intent #%d via %s", t.ownerNode, via)
		}
		_ = t.as.SetTaskAssetSource(taskID, id, "agent", summary, sourceNodeID)
	}
}

// insertOnchain is the on-chain analog of insert_assets: batch-register
// smart-contract assets into the asset graph, for ANY chain family (evm / solana
// / move / zk). Recon-only — it records FACTS about the protocol under review and
// never exploits anything.
func (t *ToolSet) insertOnchain() actool.CoreTool {
	return writeTool(
		"insert_onchain",
		"Batch-register on-chain assets discovered while mapping a smart-contract target, in any chain family (evm/solana/move/zk); a single call may mix kinds of one family.\n"+
			"family is optional — it is inferred from chain (solana→solana, sui/aptos→move) and defaults to evm. Parent/child is program-computed from address+chain: a member references its unit's address (evm contract / solana program / move module), so insert the unit first, then its members with the same address.\n"+
			"Kinds by family: evm=contract|function|storage_var|role|external_dep; solana=program|instruction|account|pda|cpi_target; move=module|move_function|resource|capability; zk=circuit|signal. (Register invariants with record_invariant.)\n"+
			"Each member needs a discriminator or you can pass an explicit `key`: evm function→selector|signature|name, storage_var→slot|name, role→role_id|name, external_dep→target; solana instruction→discriminator|name, account→name, pda→seeds|name, cpi_target→target; move move_function→signature|name, resource|capability→name; zk signal→name.\n"+
			"Dedup is automatic. Recon/mapping only — it does not run or prove anything; confirmed issues still go through report_finding with a PoC.\n"+
			"Returns: {results:[{index,id,type}], errors:[{index,error}]}",
		obj(map[string]any{
			"items": map[string]any{
				"type":        "array",
				"description": "on-chain assets to register; one element per record",
				"items": obj(map[string]any{
					"family": map[string]any{
						"type":        "string",
						"enum":        []string{"evm", "solana", "move", "zk"},
						"description": "chain family (optional; inferred from chain, else evm)",
					},
					"type": map[string]any{
						"type": "string",
						"enum": []string{
							"contract", "function", "storage_var", "role", "external_dep",
							"program", "instruction", "account", "pda", "cpi_target",
							"module", "move_function", "resource", "capability",
							"circuit", "signal",
						},
						"description": "asset kind (must be valid for the family)",
					},
					"chain":   str("chain label, e.g. ethereum/arbitrum/base/solana/sui/aptos (optional; defaults per family)"),
					"address": str("the unit's address (evm contract / solana program id / move addr::module / zk circuit id); for member kinds this is the PARENT unit's address"),
					"name":    str("display name of the asset (optional but recommended)"),
					"note":    str("a short free-text observation about this asset (optional)"),
					"key":     str("explicit dedup discriminator (optional; overrides the per-kind default below)"),
					// evm
					"signature":  str("full signature, e.g. transfer(address,uint256) (evm function / move move_function)"),
					"selector":   str("4-byte selector, e.g. 0xa9059cbb (evm function)"),
					"visibility": str("visibility: public/external/internal/private (evm/move function, storage_var)"),
					"mutability": str("state mutability: payable/nonpayable/view/pure (evm function)"),
					"modifiers": map[string]any{
						"type":        "array",
						"items":       map[string]any{"type": "string"},
						"description": "modifiers guarding the function, e.g. [\"onlyOwner\",\"nonReentrant\"] (evm function)",
					},
					"slot":            str("storage slot of the variable (evm storage_var)"),
					"var_type":        str("type of the variable, e.g. mapping(address=>uint256) (evm storage_var)"),
					"role_id":         str("the role identifier, e.g. DEFAULT_ADMIN_ROLE (evm role)"),
					"target":          str("the callee/dependency address this unit calls into (evm external_dep / solana cpi_target)"),
					"dep_kind":        str("dependency kind: token/oracle/protocol/library (evm external_dep)"),
					"source_verified": map[string]any{"type": "boolean", "description": "whether verified source was available (evm contract / solana program)"},
					"compiler":        str("compiler/toolchain version (evm contract / move module)"),
					// solana
					"discriminator": str("instruction discriminator (solana instruction)"),
					"seeds":         str("PDA seed signature (solana pda)"),
					// move
					"abilities": map[string]any{
						"type":        "array",
						"items":       map[string]any{"type": "string"},
						"description": "Move abilities: copy/drop/store/key (move resource / move_function)",
					},
				}, "type"),
			},
		}, "items"),
		func(_ context.Context, in json.RawMessage) (actool.Result, error) {
			if t.as == nil {
				return actool.Errorf("insert_onchain is not enabled: AssetStore is not initialized"), nil
			}
			var a struct {
				Items []onchainInputItem `json:"items"`
			}
			if err := json.Unmarshal(in, &a); err != nil {
				return actool.Errorf("invalid input: " + err.Error()), nil
			}
			taskID := t.taskID

			type result struct {
				Index int    `json:"index"`
				ID    int64  `json:"id"`
				Type  string `json:"type"`
			}
			type errEntry struct {
				Index int    `json:"index"`
				Error string `json:"error"`
			}
			var results []result
			var errs []errEntry

			for i, item := range a.Items {
				req, err := item.toUpsertReq(taskID)
				if err != nil {
					errs = append(errs, errEntry{Index: i, Error: err.Error()})
					continue
				}
				id, err := t.as.UpsertOnchainAsset(req)
				if err != nil {
					errs = append(errs, errEntry{Index: i, Error: err.Error()})
					continue
				}
				results = append(results, result{Index: i, ID: id, Type: req.Type})
				t.noteOnchainAsset(id, taskID, "insert_onchain")
			}
			return jsonResult(map[string]any{"results": results, "errors": errs})
		},
	)
}

// recordInvariant registers a protocol invariant as an on-chain asset node. An
// invariant is a property that must always hold ("shares are always fully
// backed", "only owner can upgrade"); registering it gives later intents and
// findings something concrete to anchor to — the on-chain analog of a goal/
// coverage target. It asserts nothing about whether the invariant actually
// holds; breaking one is proven later via report_finding + a PoC.
func (t *ToolSet) recordInvariant() actool.CoreTool {
	return writeTool(
		"record_invariant",
		"Register a protocol invariant (a property that must always hold) for the contract under review, so exploration can target and later prove/refute it.\n"+
			"This records the invariant as a fact/anchor only — it does NOT check it. A broken invariant is still confirmed via report_finding with a reproducible PoC.\n"+
			"Required: address + statement. Dedup is by (address, name|statement).\n"+
			"Returns: {id, address}",
		obj(map[string]any{
			"address":   str("the contract/program/module address the invariant is about (chain determines the family)"),
			"chain":     str("chain label (optional; defaults to ethereum)"),
			"name":      str("a short stable identifier for the invariant, e.g. shares-backed (optional; used for dedup)"),
			"statement": str("the invariant stated as a property, e.g. 'totalAssets() >= totalSupply() at all times'"),
			"severity_if_broken": map[string]any{
				"type":        "string",
				"description": "expected severity if this invariant is broken: info/low/medium/high/critical (optional)",
			},
			"source": str("where the invariant comes from: docs, a comment, or inferred from the code (optional)"),
		}, "address", "statement"),
		func(_ context.Context, in json.RawMessage) (actool.Result, error) {
			if t.as == nil {
				return actool.Errorf("record_invariant is not enabled: AssetStore is not initialized"), nil
			}
			var a struct {
				Address          string `json:"address"`
				Chain            string `json:"chain"`
				Name             string `json:"name"`
				Statement        string `json:"statement"`
				SeverityIfBroken string `json:"severity_if_broken"`
				Source           string `json:"source"`
			}
			if err := json.Unmarshal(in, &a); err != nil {
				return actool.Errorf("invalid input: " + err.Error()), nil
			}
			if strings.TrimSpace(a.Statement) == "" {
				return actool.Errorf("statement is required"), nil
			}
			taskID := t.taskID
			key := strings.TrimSpace(a.Name)
			if key == "" {
				key = strings.TrimSpace(a.Statement)
			}
			extra := map[string]any{"statement": strings.TrimSpace(a.Statement)}
			if v := strings.TrimSpace(a.SeverityIfBroken); v != "" {
				extra["severity_if_broken"] = v
			}
			if v := strings.TrimSpace(a.Source); v != "" {
				extra["source"] = v
			}
			id, err := t.as.UpsertOnchainAsset(db.UpsertOnchainAssetReq{
				Type:    "invariant",
				Chain:   a.Chain,
				Address: a.Address,
				Key:     key,
				Name:    strings.TrimSpace(a.Name),
				Extra:   extra,
				TaskID:  taskID,
			})
			if err != nil {
				return actool.Errorf(err.Error()), nil
			}
			t.noteOnchainAsset(id, taskID, "record_invariant")
			return jsonResult(map[string]any{"id": id, "address": strings.ToLower(strings.TrimSpace(a.Address))})
		},
	)
}

// recordCounterexample records a fuzzer/invariant-test counterexample against a
// registered invariant: it marks the invariant asset (status + the latest
// breaking case, merged into extra) and writes an `observed` fact anchored to
// that invariant so the planner is woken to drive it toward a PoC. A
// counterexample is strong evidence but NOT yet a finding — a finding still
// needs a clean, reproducible PoC exploit (report_finding, the proof phase).
func (t *ToolSet) recordCounterexample() actool.CoreTool {
	return writeTool(
		"record_counterexample",
		"Record a counterexample that a fuzzer or invariant test found breaking a protocol invariant (Web3). It marks the invariant as having a candidate break and writes an 'observed' fact anchored to it, so the planner can dispatch turning it into a clean PoC.\n"+
			"This is a lead, not a finding: a confirmed vulnerability still goes through report_finding with a reproducible exploit. If the invariant was not registered yet, this registers it too.\n"+
			"Required: address + (name|statement) + summary. Give reproduce (seed/test name/command) so the break can be re-run.\n"+
			"Returns: {invariant_id, fact_id}",
		obj(map[string]any{
			"address":   str("the contract/program/module address the invariant is about (chain determines the family)"),
			"chain":     str("chain label (optional; defaults to ethereum)"),
			"name":      str("the invariant's short identifier (its dedup key; use the same name you passed to record_invariant)"),
			"statement": str("the invariant as a property (used as the key when name is omitted, and to register the invariant if it does not exist yet)"),
			"summary":   str("one sentence: what broke and how (e.g. 'totalAssets < totalSupply after a donate+deposit sequence')"),
			"sequence":  str("the breaking call sequence / shrunk trace the fuzzer produced (the counterexample itself)"),
			"reproduce": str("how to re-run it: the failing test name, fuzz seed, or exact command"),
			"severity":  str("candidate severity if this becomes a finding: info/low/medium/high/critical (optional)"),
			"intent_id": idp("the intent id that produced this counterexample (the intent you claimed)"),
		}, "address", "summary"),
		func(_ context.Context, in json.RawMessage) (actool.Result, error) {
			if t.as == nil {
				return actool.Errorf("record_counterexample is not enabled: AssetStore is not initialized"), nil
			}
			if t.ts == nil {
				return actool.Errorf("record_counterexample requires task context (the exploration graph): use it inside a task"), nil
			}
			var a struct {
				Address   string          `json:"address"`
				Chain     string          `json:"chain"`
				Name      string          `json:"name"`
				Statement string          `json:"statement"`
				Summary   string          `json:"summary"`
				Sequence  string          `json:"sequence"`
				Reproduce string          `json:"reproduce"`
				Severity  string          `json:"severity"`
				IntentID  json.RawMessage `json:"intent_id"`
			}
			if err := json.Unmarshal(in, &a); err != nil {
				return actool.Errorf("invalid input: " + err.Error()), nil
			}
			if strings.TrimSpace(a.Summary) == "" {
				return actool.Errorf("summary is required"), nil
			}
			key := strings.TrimSpace(a.Name)
			if key == "" {
				key = strings.TrimSpace(a.Statement)
			}
			if key == "" {
				return actool.Errorf("one of name or statement is required to identify the invariant"), nil
			}
			taskID := t.taskID

			// Mark the invariant (merged into extra via the on-conflict path; also
			// registers it if it was never recorded). We keep only the latest
			// counterexample on the asset — the full history lives in the facts.
			cx := map[string]any{"summary": strings.TrimSpace(a.Summary)}
			if v := strings.TrimSpace(a.Sequence); v != "" {
				cx["sequence"] = v
			}
			if v := strings.TrimSpace(a.Reproduce); v != "" {
				cx["reproduce"] = v
			}
			if v := strings.TrimSpace(a.Severity); v != "" {
				cx["severity"] = v
			}
			extra := map[string]any{"status": "counterexample", "last_counterexample": cx}
			if st := strings.TrimSpace(a.Statement); st != "" {
				extra["statement"] = st
			}
			invID, err := t.as.UpsertOnchainAsset(db.UpsertOnchainAssetReq{
				Type:    "invariant",
				Chain:   a.Chain,
				Address: a.Address,
				Key:     key,
				Name:    strings.TrimSpace(a.Name),
				Extra:   extra,
				TaskID:  taskID,
			})
			if err != nil {
				return actool.Errorf(err.Error()), nil
			}
			t.noteOnchainAsset(invID, taskID, "record_counterexample")

			// Write the counterexample as an observed fact, anchored to the
			// invariant so coverage/planner see which invariant it concerns.
			detail := strings.TrimSpace(a.Sequence)
			if st := strings.TrimSpace(a.Statement); st != "" {
				if detail != "" {
					detail = "invariant: " + st + "\nsequence: " + detail
				} else {
					detail = "invariant: " + st
				}
			}
			factID, err := t.recordOneFact(factItem{
				Summary:    "counterexample: " + strings.TrimSpace(a.Summary),
				Detail:     detail,
				Evidence:   strings.TrimSpace(a.Reproduce),
				Confidence: "observed",
				IntentID:   a.IntentID,
				AssetIDs:   []json.RawMessage{json.RawMessage(strconv.FormatInt(invID, 10))},
			}, 0)
			if err != nil {
				// The invariant mark succeeded; surface the fact error but keep the id.
				return jsonResult(map[string]any{"invariant_id": invID, "fact_error": err.Error()})
			}
			return jsonResult(map[string]any{"invariant_id": invID, "fact_id": factID})
		},
	)
}

// addCompanyScope writes to company_scope table and triggers asset attribution.
func (t *ToolSet) addCompanyScope() actool.CoreTool {
	return writeTool(
		"add_company_scope",
		"Add a domain/IP/CIDR/ICP-filing/company-keyword to a company's asset scope — domains, networks and ICP auto-claim matching assets, while a keyword is only given to the Agent as a scope hint.\n"+
			"The company name is unique: if company does not exist it is created, otherwise reused (the scope is merged in).\n"+
			"scope has one entry per line, auto-recognized by the system: root domain / URL / single IP / CIDR block / ICP filing / company keyword.\n"+
			"Always give a reason explaining the attribution basis (whois/certificate/ASN, etc.).\n"+
			"Guardrails: a bare TLD and over-wide networks are rejected (an IPv4 prefix must be /16-/32, an IPv6 prefix must be /32-/128); illegal lines are skipped and returned in errors.",
		obj(map[string]any{
			"company": str("company name (created if absent, reused if present; the name is unique)"),
			"scope":   str("asset scope, one entry per line: domain / URL / IP / CIDR / ICP filing / company keyword"),
			"reason":  str("the attribution basis (evidence/source); always fill it in"),
			"logo":    str("company logo URL (optional; applies only when creating a company)"),
		}, "company", "scope"),
		func(_ context.Context, in json.RawMessage) (actool.Result, error) {
			if t.cs == nil {
				return actool.Errorf("add_company_scope is not enabled: CompanyStore is not initialized"), nil
			}
			var a struct {
				Company string `json:"company"`
				Scope   string `json:"scope"`
				Reason  string `json:"reason"`
				Logo    string `json:"logo"`
			}
			if err := json.Unmarshal(in, &a); err != nil {
				return actool.Errorf(err.Error()), nil
			}
			if strings.TrimSpace(a.Company) == "" {
				return actool.Errorf("company cannot be empty"), nil
			}
			companyID, _, err := t.cs.UpsertCompany(a.Company, a.Logo)
			if err != nil {
				return actool.Errorf("failed to create/get company: " + err.Error()), nil
			}
			lines := splitLines(a.Scope)
			added, skipped, invalid, errMsgs := t.cs.AddScope(companyID, lines, a.Reason)
			out := map[string]any{
				"company_id": companyID,
				"added":      added,
				"skipped":    skipped,
				"invalid":    invalid,
			}
			if len(errMsgs) > 0 {
				out["errors"] = errMsgs
			}
			return jsonResult(out)
		},
	)
}

// addTaskScope lets the plan agent add test scope to THE CURRENT TASK — the coverage
// denominator and the task's authorization edge. Worker discoveries are auto-scoped
// (precise host) by insertAssets; this tool is for DELIBERATELY WIDENING: pull a whole
// root domain or whole company into scope, or add a specific subdomain / ip.
func (t *ToolSet) addTaskScope() actool.CoreTool {
	return writeTool(
		"add_task_scope",
		"Add a test scope to this task — this is the task's authorization boundary and the denominator of asset test coverage.\n"+
			"kind supports: company (all assets under a company) / root_domain (a whole root domain, including all subdomains) / subdomain (a single exact subdomain) / ip / cidr / icp / keyword.\n"+
			"Note: hosts a worker encounters one by one are automatically added to the scope by the system (exact subdomains); this tool is for proactively widening it — bringing a whole root domain / whole company in, or adding a specific subdomain/IP.\n"+
			"value: for company pass the company name or id (the company must already exist); for root_domain/subdomain pass a domain; for ip/cidr pass an IP or network; for icp/keyword pass an ICP filing number or company keyword.\n"+
			"Always give a reason explaining the basis (for audit). Use the entries array for multiple.",
		obj(map[string]any{
			"entries": map[string]any{"type": "array", "description": "batch: [{kind, value}]. kind in company/root_domain/subdomain/ip/cidr/icp/keyword.", "items": map[string]any{"type": "object"}},
			"kind":    str("[single] company / root_domain / subdomain / ip / cidr / icp / keyword"),
			"value":   str("[single] company name or id / domain / IP / CIDR / ICP / keyword"),
			"reason":  str("the basis for adding it (for audit); always fill it in"),
		}),
		func(_ context.Context, in json.RawMessage) (actool.Result, error) {
			if t.as == nil {
				return actool.Errorf("add_task_scope is not enabled: AssetStore is not initialized"), nil
			}
			if t.taskID <= 0 {
				return actool.Errorf("add_task_scope requires task context (there is no task currently)"), nil
			}
			type scopeEntry struct {
				Kind  string `json:"kind"`
				Value string `json:"value"`
			}
			var a struct {
				Entries    []scopeEntry `json:"entries"`
				scopeEntry              // single mode
				Reason     string       `json:"reason"`
			}
			_ = json.Unmarshal(in, &a)
			items := a.Entries
			if len(items) == 0 {
				items = []scopeEntry{a.scopeEntry}
			}
			var added []map[string]any
			errs := map[string]string{}
			for i, e := range items {
				ts, err := t.as.AddAgentScope(t.taskID, strings.TrimSpace(e.Kind), e.Value, a.Reason, "agent")
				if err != nil {
					errs[strconv.Itoa(i)] = err.Error()
					continue
				}
				added = append(added, map[string]any{"kind": ts.Kind, "domain": ts.Domain, "net": ts.Net, "value": ts.Value, "company_id": ts.CompanyID})
			}
			out := map[string]any{"added": added}
			if len(errs) > 0 {
				out["errors"] = errs
			}
			return jsonResult(out)
		},
	)
}

// listUntestedAssets lets the plan agent pull the current + directly inherited
// scope's not-yet-tested assets on demand (filter by type, paginated).
func (t *ToolSet) listUntestedAssets() actool.CoreTool {
	return readTool(
		"list_untested_assets",
		"Query assets within the scope of this task and directly related tasks that are not yet covered by a fact anchor (related scope is read-only, for you to judge whether to test further, not a substitute for your decision).\n"+
			"Optionally filter by asset type: root_domain/subdomain/service/app/endpoint/ip, or on-chain kinds (evm/solana/move/zk, e.g. contract/program/module/function).\n"+
			"Pagination: page starts at 1, page_size defaults to 10. Returns {assets:[{id,type,label}], total, page, page_size}. Available only in task context.",
		obj(map[string]any{
			"type":      str("asset-type filter (optional): root_domain/subdomain/service/app/endpoint/ip, or on-chain kinds (evm/solana/move/zk, e.g. contract/program/module/function)"),
			"page":      intp("page number, starting at 1 (default 1)"),
			"page_size": intp("page size (default 10)"),
		}),
		func(_ context.Context, in json.RawMessage) (actool.Result, error) {
			if t.as == nil {
				return actool.Errorf("list_untested_assets is not enabled: AssetStore is not initialized"), nil
			}
			if t.taskID <= 0 || t.ts == nil {
				return actool.Errorf("list_untested_assets requires task context"), nil
			}
			var a struct {
				Type     string `json:"type"`
				Page     int    `json:"page"`
				PageSize int    `json:"page_size"`
			}
			_ = json.Unmarshal(in, &a)
			if a.Page <= 0 {
				a.Page = 1
			}
			if a.PageSize <= 0 {
				a.PageSize = 10
			}
			offset := (a.Page - 1) * a.PageSize
			assets, total, err := t.as.ListUntestedAssetsWithSources(t.taskID, strings.TrimSpace(a.Type), a.PageSize, offset)
			if err != nil {
				return actool.Errorf(err.Error()), nil
			}
			return jsonResult(map[string]any{
				"assets": assets, "total": total, "page": a.Page, "page_size": a.PageSize,
			})
		},
	)
}

// listAssets lets an agent query the asset table.
func (t *ToolSet) listAssets() actool.CoreTool {
	return readTool(
		"list_assets",
		"Query the asset store: search by DSL expression, or fetch directly by id/ids; pagination supported. Returns only assets within the test scope of this task and directly related tasks.\n"+
			"DSL: field=value fuzzy (ILIKE) | field==value exact | field!=value exclude | numeric fields support > >= < <= | a bare word = full-text fuzzy; combine with AND/OR (AND binds tighter), parentheses for grouping. Asset type uses the separate type parameter, not written into the DSL.\n"+
			"When id/ids are not passed, dsl must be non-empty (an unconditional full query is not allowed).\n"+
			"Available fields: domain (root/sub/service domain), root_domain, ip, url, page_title, icp, service_name, app_name, method (e.g. GET/POST), service_type (http|other), record_type (e.g. A/CNAME), technology (array, = fuzzy / == exact), port/status_code/company_id (integers), address/chain/chain_family (on-chain assets).\n"+
			"Examples: status_code>=400 AND technology=shiro ; (port==80 OR port==443) AND technology=nginx",
		obj(map[string]any{
			"dsl":    str(`DSL query expression (syntax/fields in the tool description). Must be non-empty when id/ids are not passed.`),
			"type":   str("asset-type filter: root_domain|ip|subdomain|app|service|endpoint, or the on-chain kinds (evm) contract|function|storage_var|role|external_dep|invariant, (solana) program|instruction|account|pda|cpi_target, (move) module|move_function|resource|capability, (zk) circuit|signal (a separate field, can combine with dsl; type alone is not enough to query, dsl is still required)"),
			"id":     intp("fetch directly by a single asset id (optional, mutually exclusive with dsl/type)"),
			"ids":    map[string]any{"type": "array", "items": map[string]any{"type": "integer"}, "description": "fetch directly by multiple asset ids (optional, mutually exclusive with dsl/type)"},
			"limit":  intp("return limit, default 10 (optional)"),
			"offset": intp("pagination offset, default 0 (optional)"),
		}),
		func(_ context.Context, in json.RawMessage) (actool.Result, error) {
			if t.as == nil {
				return actool.Errorf("list_assets is not enabled: AssetStore is not initialized"), nil
			}
			var a struct {
				DSL    string  `json:"dsl"`
				Type   string  `json:"type"`
				ID     int64   `json:"id"`
				IDs    []int64 `json:"ids"`
				Limit  int     `json:"limit"`
				Offset int     `json:"offset"`
			}
			_ = json.Unmarshal(in, &a)
			if a.Limit <= 0 {
				a.Limit = 10
			}

			var assets []*db.Asset
			var err error
			switch {
			case a.ID > 0:
				assets, err = t.as.GetByIDsInScope(t.taskID, []int64{a.ID})
			case len(a.IDs) > 0:
				assets, err = t.as.GetByIDsInScope(t.taskID, a.IDs)
			case a.DSL != "":
				assets, err = t.as.QueryDSLInScope(a.DSL, a.Type, t.taskID, a.Limit, a.Offset)
			default:
				return actool.Errorf("dsl cannot be empty when id/ids are not passed: an unconditional query of all assets is not allowed, please provide a query condition"), nil
			}
			if err != nil {
				return actool.Errorf("DSL error: " + err.Error()), nil
			}
			return jsonResult(map[string]any{
				"count":  len(assets),
				"assets": assets,
			})
		},
	)
}

// listCompanies lets an agent enumerate companies with their scope + asset count.
func (t *ToolSet) listCompanies() actool.CoreTool {
	return readTool(
		"list_companies",
		"List the companies in the asset store with their asset scope and the count of assets attributed to them. Use it to see which companies exist, "+
			"get a company_id (used when insert_assets associates an app, or list_assets filters by company_id). "+
			"Optional search fuzzy-filters by company name (case-insensitive); leave empty to return all.",
		obj(map[string]any{
			"search": str("fuzzy-filter by company name (optional, case-insensitive); leave empty to return all"),
		}),
		func(_ context.Context, in json.RawMessage) (actool.Result, error) {
			if t.cs == nil {
				return actool.Errorf("list_companies is not enabled: CompanyStore is not initialized"), nil
			}
			var a struct {
				Search string `json:"search"`
			}
			_ = json.Unmarshal(in, &a)
			cos, err := t.cs.ListCompanies()
			if err != nil {
				return actool.Errorf("failed to query companies: " + err.Error()), nil
			}
			q := strings.ToLower(strings.TrimSpace(a.Search))
			type companyOut struct {
				ID         int64    `json:"id"`
				Name       string   `json:"name"`
				AssetCount int      `json:"asset_count"`
				Scope      []string `json:"scope"`
			}
			out := make([]companyOut, 0, len(cos))
			for _, c := range cos {
				if q != "" && !strings.Contains(strings.ToLower(c.Name), q) {
					continue
				}
				scope := make([]string, 0, len(c.Scope))
				for _, r := range c.Scope {
					scope = append(scope, r.Raw)
				}
				out = append(out, companyOut{ID: c.ID, Name: c.Name, AssetCount: c.AssetCount, Scope: scope})
			}
			return jsonResult(map[string]any{"count": len(out), "companies": out})
		},
	)
}

// splitLines splits a multi-line string into non-empty trimmed lines.
func splitLines(s string) []string {
	var out []string
	for _, line := range strings.Split(s, "\n") {
		line = strings.TrimSpace(line)
		if line != "" {
			out = append(out, line)
		}
	}
	return out
}

// WorkerTools returns the tool set for a work agent.
func (t *ToolSet) WorkerTools() []actool.CoreTool {
	return []actool.CoreTool{
		// list_findings retained: before reporting a finding, check this task's confirmed findings to avoid reporting the same one twice.
		t.listFindings(),
		t.addFinding(), t.recordFact(),
		// asset management (handlers guard nil store internally)。
		// add_company_scope not given to the worker: defining a company's asset scope is the job of the planner/main/Auto, the worker only executes exploration.
		t.insertAssets(), t.listAssets(),
		// On-chain recon (Web3, multi-chain evm/solana/move/zk): map a target into the asset graph and register the invariants it must uphold.
		t.insertOnchain(), t.recordInvariant(),
		// Invariant & fuzz layer (Web3 phase 2): record a fuzzer/invariant-test counterexample as an observed fact against its invariant.
		t.recordCounterexample(),
		// Cross-work review: a worker can also reuse other works' observations to avoid duplicate work.
		// search_all_worker_traces: no need to know the intent_id first, globally fetch matching steps by keyword;
		// get_worker_trace: once a work is pinned, list its steps / search in place / fetch full content.
		t.searchAllWorkerTraces(), t.getWorkerTrace(),
		// node_detail: once the worker has an intent_id/node id it can fetch that node's full detail (together with the review above).
		t.nodeDetail(),
		// The following tools are still not given to the worker, only to planner/main (reading context and cross-work review are planning jobs,
		// the worker only executes and writes back a single intent): list_facts / list_companies / list_worker_traces.
	}
}

// MainAgentTools returns the human-interface tool set.
func (t *ToolSet) MainAgentTools() []actool.CoreTool {
	return []actool.CoreTool{
		t.graphOverview(), t.listFindings(), t.listFacts(), t.nodeDetail(),
		t.expandDigest(), // cold-digest §6.1
		t.getWorkerOutput(), t.getWorkerTrace(), t.searchAllWorkerTraces(), t.addHint(), t.addIntent(),
		// steer_work: a human can inject a live correction instruction into a running intent (work) (without interrupting or losing progress).
		t.steerWorkTool(),
		// set_goals: a human can add a new final goal to this task at runtime (the planner re-judges completion accordingly).
		t.setGoals(),
		// set_constraints: a human can add/change operation constraints (allow/deny) for this task at runtime, bounding the planner/worker's exploration.
		t.setConstraints(),
		// asset management (handlers guard nil store internally)
		t.insertAssets(), t.addCompanyScope(), t.listAssets(),
		// On-chain recon (Web3, multi-chain): seed a target and its invariants into the asset graph.
		t.insertOnchain(), t.recordInvariant(),
		// Invariant & fuzz layer (Web3 phase 2): register a counterexample found against an invariant.
		t.recordCounterexample(),
		t.addFinding(), t.recordFact(),
		t.addTaskScope(),
		// list_untested_assets: on demand, query untested assets within this task's scope (by type + pagination), and decide for yourself whether to test them.
		t.listUntestedAssets(),
	}
}

// AllDomainTools returns the union of all domain tools across all agent types,
// deduped by name (mainagent order wins). Used by the server to build a registry
// for injecting domain tools into agents (Auto, custom) that don't own a per-task
// ToolSet. The caller provides real stores; tools are callable at taskID=0 scope.
func (t *ToolSet) AllDomainTools() []actool.CoreTool {
	seen := map[string]bool{}
	var out []actool.CoreTool
	all := append(append(t.MainAgentTools(), t.PlannerTools()...), t.WorkerTools()...)
	for _, tool := range all {
		if !seen[tool.Name()] {
			seen[tool.Name()] = true
			out = append(out, tool)
		}
	}
	return out
}
