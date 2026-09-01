use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

#[derive(Serialize)]
struct Claims {
    iat: u64,
    exp: u64,
    iss: String,
}

pub struct GithubApp {
    app_id: String,
    installation_id: String,
    key: EncodingKey,
    client: reqwest::Client,
}

#[derive(Deserialize)]
struct TokenResponse {
    token: String,
}

#[derive(Serialize)]
pub struct RepoInfo {
    pub name: String,
    pub language: Option<String>,
    pub stars: u64,
    pub fork: bool,
    pub archived: bool,
    pub pushed_at: String,
    pub description: Option<String>,
}

impl GithubApp {
    pub fn new() -> Self {
        let app_id = std::env::var("GITHUB_APP_ID").expect("GITHUB_APP_ID");
        let installation_id =
            std::env::var("GITHUB_INSTALLATION_ID").expect("GITHUB_INSTALLATION_ID");
        let pem_path = std::env::var("GITHUB_PRIVATE_KEY_PATH").expect("GITHUB_PRIVATE_KEY_PATH");
        let pem = std::fs::read(&pem_path).expect("failed to read private key pem");
        let key = EncodingKey::from_rsa_pem(&pem).expect("invalid RSA pem");
        let client = reqwest::Client::builder()
            .user_agent("uranometria-server")
            .build()
            .unwrap();
        Self {
            app_id,
            installation_id,
            key,
            client,
        }
    }

    fn make_jwt(&self) -> String {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let claims = Claims {
            iat: now - 60,
            exp: now + 540,
            iss: self.app_id.clone(),
        };
        encode(&Header::new(Algorithm::RS256), &claims, &self.key).unwrap()
    }

    pub async fn installation_token(&self) -> String {
        let jwt = self.make_jwt();
        let url = format!(
            "https://api.github.com/app/installations/{}/access_tokens",
            self.installation_id
        );
        let res = self
            .client
            .post(url)
            .bearer_auth(jwt)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .send()
            .await
            .unwrap();
        let body: TokenResponse = res.json().await.unwrap();
        body.token
    }

    pub async fn list_repos(&self) -> serde_json::Value {
        let token = self.installation_token().await;
        let res = self
            .client
            .get("https://api.github.com/installation/repositories?per_page=100")
            .bearer_auth(token)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .send()
            .await
            .unwrap();
        res.json().await.unwrap()
    }

    pub async fn galaxy_repos(&self) -> Vec<RepoInfo> {
        let raw = self.list_repos().await;
        raw["repositories"]
            .as_array()
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .map(|r| RepoInfo {
                name: r["name"].as_str().unwrap_or("unknown").to_string(),
                language: r["language"].as_str().map(|s| s.to_string()),
                stars: r["stargazers_count"].as_u64().unwrap_or(0),
                fork: r["fork"].as_bool().unwrap_or(false),
                archived: r["archived"].as_bool().unwrap_or(false),
                pushed_at: r["pushed_at"].as_str().unwrap_or("").to_string(),
                description: r["description"].as_str().map(|s| s.to_string()),
            })
            .collect()
    }

    pub async fn repo_tree(&self, owner: &str, repo: &str) -> serde_json::Value {
        let url = format!("https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1");
        let token = self.installation_token().await;
        let res = self
            .client
            .get(&url)
            .bearer_auth(token)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .send()
            .await
            .unwrap();
        if res.status().is_success() {
            return res.json().await.unwrap();
        }
        let res = self
            .client
            .get(&url)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .send()
            .await
            .unwrap();
        res.json().await.unwrap()
    }

    pub async fn file_content(&self, owner: &str, repo: &str, path: &str) -> String {
        let token = self.installation_token().await;
        let url = format!("https://api.github.com/repos/{owner}/{repo}/contents/{path}");
        let res = self
            .client
            .get(&url)
            .bearer_auth(token)
            .header("Accept", "application/vnd.github.raw")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .send()
            .await
            .unwrap();
        if res.status().is_success() {
            return res.text().await.unwrap();
        }
        let res = self
            .client
            .get(&url)
            .header("Accept", "application/vnd.github.raw")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .send()
            .await
            .unwrap();
        res.text().await.unwrap()
    }
    pub async fn demo_repos(&self, user: &str) -> Vec<RepoInfo> {
        let url = format!("https://api.github.com/users/{user}/repos?per_page=100&sort=pushed");
        let res = self
            .client
            .get(url)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .send()
            .await
            .unwrap();
        let raw: serde_json::Value = res.json().await.unwrap();
        raw.as_array()
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .map(|r| RepoInfo {
                name: r["name"].as_str().unwrap_or("unknown").to_string(),
                language: r["language"].as_str().map(|s| s.to_string()),
                stars: r["stargazers_count"].as_u64().unwrap_or(0),
                fork: r["fork"].as_bool().unwrap_or(false),
                archived: r["archived"].as_bool().unwrap_or(false),
                pushed_at: r["pushed_at"].as_str().unwrap_or("").to_string(),
                description: r["description"].as_str().map(|s| s.to_string()),
            })
            .collect()
    }
}
