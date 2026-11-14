package selfupdate

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// Repo is the release source. Hardcoded rather than made configurable: a configurable update source
// would be a remote-code-execution channel for anyone who can change the config, and for a
// penetration-testing platform that hole must not be opened.
const Repo = "Autumn-27/cyfind"

// latestURL is GitHub's "latest official release" interface. It automatically skips prereleases and
// drafts.
const latestURL = "https://api.github.com/repos/" + Repo + "/releases/latest"

// allowedHosts restricts the domains the upgrade path can access. Together with checkRedirect below,
// any hop redirected to a host not on the list fails outright — this is the first gate against DNS
// poisoning / a man-in-the-middle swapping the binary, and the second is the SHA256SUMS comparison.
var allowedHosts = map[string]bool{
	"api.github.com":                       true,
	"github.com":                           true,
	"objects.githubusercontent.com":        true, // the object storage where release assets actually land
	"release-assets.githubusercontent.com": true,
	"raw.githubusercontent.com":            true,
}

// Release is the fields we care about in a GitHub Release.
type Release struct {
	TagName     string    `json:"tag_name"`
	Name        string    `json:"name"`
	Body        string    `json:"body"`
	Draft       bool      `json:"draft"`
	Prerelease  bool      `json:"prerelease"`
	PublishedAt time.Time `json:"published_at"`
	HTMLURL     string    `json:"html_url"`
	Assets      []Asset   `json:"assets"`
}

// Asset is one file attached to a Release.
type Asset struct {
	Name string `json:"name"`
	URL  string `json:"browser_download_url"`
	Size int64  `json:"size"`
}

// NewClient builds an HTTP client that recognizes only GitHub domains. An empty proxy means a direct
// connection.
//
// It deliberately does not reuse the default Transport: the upgrade path must force TLS and verify
// certificates, and must not be affected by an InsecureSkipVerify or the like set elsewhere.
func NewClient(proxy string) *http.Client {
	tr := &http.Transport{
		ForceAttemptHTTP2:   true,
		TLSHandshakeTimeout: 15 * time.Second,
	}
	if p := strings.TrimSpace(proxy); p != "" {
		if pu, err := url.Parse(p); err == nil {
			tr.Proxy = http.ProxyURL(pu)
		}
	}
	return &http.Client{
		Transport: tr,
		Timeout:   30 * time.Minute, // downloading a whole package, must not be killed by a per-request timeout
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 10 {
				return fmt.Errorf("too many redirects")
			}
			return checkURL(req.URL)
		},
	}
}

// checkURL enforces https + the domain allowlist.
func checkURL(u *url.URL) error {
	if u.Scheme != "https" {
		return fmt.Errorf("refusing a non-HTTPS address: %s", u.Scheme+"://"+u.Host)
	}
	if !allowedHosts[strings.ToLower(u.Hostname())] {
		return fmt.Errorf("refusing a non-GitHub domain: %s", u.Hostname())
	}
	return nil
}

// FetchLatest queries the latest official release.
func FetchLatest(ctx context.Context, c *http.Client) (*Release, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, latestURL, nil)
	if err != nil {
		return nil, err
	}
	if err := checkURL(req.URL); err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "cyfind-selfupdate")

	resp, err := c.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to reach GitHub (you can configure a global proxy in system settings): %w", err)
	}
	defer resp.Body.Close()

	switch {
	case resp.StatusCode == http.StatusForbidden, resp.StatusCode == http.StatusTooManyRequests:
		// The unauthenticated GitHub API is 60/hour per IP, which is easy to hit when sharing an
		// egress IP.
		return nil, fmt.Errorf("the GitHub interface is rate-limited (60/hour), please try again later")
	case resp.StatusCode == http.StatusNotFound:
		return nil, fmt.Errorf("the repository %s has not published any official release yet", Repo)
	case resp.StatusCode != http.StatusOK:
		return nil, fmt.Errorf("GitHub returned %d", resp.StatusCode)
	}

	var rel Release
	if err := json.NewDecoder(resp.Body).Decode(&rel); err != nil {
		return nil, fmt.Errorf("failed to parse the Release: %w", err)
	}
	if strings.TrimSpace(rel.TagName) == "" {
		return nil, fmt.Errorf("the Release is missing a tag")
	}
	return &rel, nil
}

// AssetName returns the release-package name for the current platform, consistent with build.sh's
// package_binary: cyfind-<version>-<os>-<arch>.zip (the version has no v prefix).
func AssetName(tag, goos, goarch string) string {
	return fmt.Sprintf("cyfind-%s-%s-%s.zip", strings.TrimPrefix(tag, "v"), goos, goarch)
}

// FindAsset finds an asset in a Release by name.
func (r *Release) FindAsset(name string) (Asset, bool) {
	for _, a := range r.Assets {
		if strings.EqualFold(a.Name, name) {
			return a, true
		}
	}
	return Asset{}, false
}
