use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RoleDto {
    pub id: i64,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UserDto {
    pub id: i64,
    pub email: String,
    pub display_name: String,
    pub role: RoleDto,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ActivityDto {
    pub id: i64,
    pub title: String,
    pub activity_type: String,
    pub provider: Option<String>,
    pub activity_date: NaiveDate,
    pub hours: f64,
    pub reflection: Option<String>,
    pub status: String,
    pub owner: UserDto,
    pub reviewer: Option<UserDto>,
    pub tags: Vec<String>,
    pub goal_id: Option<i64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub status_history: Vec<ActivityStatusHistoryDto>,
    pub comments: Vec<ActivityCommentDto>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ActivityStatusHistoryDto {
    pub id: i64,
    pub status: String,
    pub comment: Option<String>,
    pub changed_by: Option<UserSummaryDto>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ActivityCommentDto {
    pub id: i64,
    pub body: String,
    pub author: UserSummaryDto,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UserSummaryDto {
    pub id: i64,
    pub display_name: String,
    pub role: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginResponse {
    pub token: String,
    pub user: UserDto,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityInput {
    pub title: String,
    pub activity_type: String,
    pub provider: Option<String>,
    pub activity_date: NaiveDate,
    pub hours: f64,
    pub reflection: Option<String>,
    pub tags: Vec<String>,
    pub goal_id: Option<i64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityUpdateInput {
    pub id: i64,
    #[serde(flatten)]
    pub payload: ActivityInput,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusTransitionInput {
    pub activity_id: i64,
    pub status: String,
    pub comment: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommentInput {
    pub activity_id: i64,
    pub body: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct YearlyGoalDto {
    pub id: i64,
    pub year: i64,
    pub target_hours: f64,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityFilters {
    pub status: Option<String>,
    pub owner_id: Option<i64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityListResponse {
    pub activities: Vec<ActivityDto>,
}
