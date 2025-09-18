use std::fmt::Display;

use serde::Serialize;
use tauri::InvokeError;

pub type Result<T> = std::result::Result<T, AppError>;

#[derive(thiserror::Error, Debug)]
pub enum AppError {
    #[error("database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
    #[error("validation error: {0}")]
    Validation(String),
    #[error("not found")]
    NotFound,
    #[error("unauthorized")]
    Unauthorized,
    #[error("internal error: {0}")]
    Other(String),
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub message: String,
}

impl From<AppError> for InvokeError {
    fn from(value: AppError) -> Self {
        InvokeError::from_serde(ErrorResponse {
            message: value.to_string(),
        })
        .unwrap_or_else(|_| InvokeError::from_anyhow(anyhow::anyhow!(value.to_string())))
    }
}

impl AppError {
    pub fn validation<T: Display>(msg: T) -> Self {
        AppError::Validation(msg.to_string())
    }
}
