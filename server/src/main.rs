mod github;

use axum::{extract::State, routing::get, Json, Router};
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
