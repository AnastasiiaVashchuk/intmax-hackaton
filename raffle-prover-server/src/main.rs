use serde::{Serialize, Deserialize};

mod circuit;
mod server;

#[derive(Debug, Deserialize)]
struct InputData {}

#[derive(Debug, Serialize)]
struct ProofResponse {
    proof: String,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    server::start_server().await
}