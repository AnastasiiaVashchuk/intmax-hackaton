use actix_web::{post, web, App, HttpServer, Responder, HttpResponse};
use serde::{Serialize, Deserialize};

#[derive(Debug, Deserialize)]
struct InputData {}

#[derive(Debug, Serialize)]
struct ProofResponse {
    proof: String,
}

#[post("/prove")]
async fn prove(
    _data: web::Json<InputData>,
) -> impl Responder {
    let proof_bytes = vec![
        // Simulated proof bytes
        0xf1, 0x92, 0x23, 0x14, 0x05, 0x06, 0x07, 0x08,
        0xa9, 0xbA, 0xcB, 0xfC, 0x4D, 0x0E, 0x0F, 0x11,
        0xa9, 0xbA, 0xcB, 0xfC, 0x4D, 0x0E, 0x0F, 0x11,
        0xa9, 0xbA, 0xcB, 0xfC, 0x4D, 0x0E, 0x0F, 0x11,
        0xa9, 0xbA, 0xcB, 0xfC, 0x4D, 0x0E, 0x0F, 0x11,
        0xa9, 0xbA, 0xcB, 0xfC, 0x4D, 0x0E, 0x0F, 0x11,
        0xa9, 0xbA, 0xcB, 0xfC, 0x4D, 0x0E, 0x0F, 0x11,
    ];

    HttpResponse::Ok().json(ProofResponse { proof: hex::encode(proof_bytes) })
}

pub async fn start_server() -> std::io::Result<()> {
    println!("Server running on http://localhost:8080");
    HttpServer::new(move || {
        App::new()
            .service(prove)
    })
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}