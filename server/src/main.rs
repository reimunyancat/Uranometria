mod github;

use axum::extract::Path;
use axum::extract::Query;
use axum::{extract::State, routing::get, Json, Router};
use std::collections::HashMap;
use std::sync::Arc;
use tower_http::cors::CorsLayer;

#[derive(Clone)]
struct AppState {
    github: Arc<github::GithubApp>,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt::init();
    let state = AppState {
        github: Arc::new(github::GithubApp::new()),
    };
    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/repos", get(repos))
        .route("/api/galaxy", get(galaxy))
        .route("/api/tree/{owner}/{repo}", get(tree))
        .route("/api/file/:owner/:repo", get(file))
        .route("/api/demo/:user", get(demo))
        .layer(CorsLayer::permissive())
        .with_state(state);
    let port = std::env::var("PORT").unwrap_or_else(|_| "4000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .unwrap();
    tracing::info!("listening on {port}");
    axum::serve(listener, app).await.unwrap();
}

async fn health() -> &'static str {
    "ok"
}

async fn repos(State(state): State<AppState>) -> Json<serde_json::Value> {
    Json(state.github.list_repos().await)
}

async fn galaxy(State(state): State<AppState>) -> Json<serde_json::Value> {
    let repos = state.github.galaxy_repos().await;
    Json(serde_json::json!({ "repos": repos }))
}

async fn tree(
    State(state): State<AppState>,
    Path((owner, repo)): Path<(String, String)>,
) -> Json<serde_json::Value> {
    Json(state.github.repo_tree(&owner, &repo).await)
}

async fn file(
    State(state): State<AppState>,
    Path((owner, repo)): Path<(String, String)>,
    Query(params): Query<HashMap<String, String>>,
) -> String {
    let path = params.get("path").cloned().unwrap_or_default();
    state.github.file_content(&owner, &repo, &path).await
}

async fn demo(State(state): State<AppState>, Path(user): Path<String>) -> Json<serde_json::Value> {
    Json(serde_json::json!({ "repos": state.github.demo_repos(&user).await }))
}
