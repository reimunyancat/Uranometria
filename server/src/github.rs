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
}
