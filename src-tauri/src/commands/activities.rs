use chrono::{DateTime, Datelike, NaiveDate, NaiveDateTime, TimeZone, Utc};
use rusqlite::{params, Row};
use tauri::State;

use crate::{
    db::DbState,
    error::{AppError, Result},
    models::{
        ActivityCommentDto, ActivityDto, ActivityFilters, ActivityInput, ActivityListResponse,
        ActivityStatusHistoryDto, CommentInput, StatusTransitionInput, UserDto, UserSummaryDto,
    },
};

fn to_utc(naive: NaiveDateTime) -> DateTime<Utc> {
    Utc.from_utc_datetime(&naive)
}

fn get_user_role(conn: &rusqlite::Connection, user_id: i64) -> Result<String> {
    conn.query_row(
        "SELECT r.name FROM User u JOIN Role r ON u.roleId = r.id WHERE u.id = ?1",
        params![user_id],
        |row| row.get::<_, String>(0),
    )
    .map_err(|_| AppError::Unauthorized)
}

#[tauri::command]
pub fn list_activities(
    state: State<'_, DbState>,
    actor_id: i64,
    filters: Option<ActivityFilters>,
) -> Result<ActivityListResponse> {
    let conn = state.connection();
    let actor_role = get_user_role(&conn, actor_id)?;
    let status_filter = filters.as_ref().and_then(|f| f.status.clone());
    let owner_filter = filters
        .as_ref()
        .and_then(|f| f.owner_id)
        .filter(|_| actor_role != "TEACHER");

    let sql = if actor_role == "TEACHER" {
        "SELECT a.id, a.title, a.activityType, a.provider, a.activityDate, a.hours, a.reflection, a.status, \
             owner.id, owner.email, owner.displayName, ownerRole.id, ownerRole.name, \
             reviewer.id, reviewer.email, reviewer.displayName, reviewerRole.id, reviewerRole.name, \
             a.goalId, a.createdAt, a.updatedAt, GROUP_CONCAT(DISTINCT t.name) \
         FROM Activity a \
         JOIN User owner ON owner.id = a.ownerId \
         JOIN Role ownerRole ON ownerRole.id = owner.roleId \
         LEFT JOIN User reviewer ON reviewer.id = a.reviewerId \
         LEFT JOIN Role reviewerRole ON reviewerRole.id = reviewer.roleId \
         LEFT JOIN ActivityTag at ON at.activityId = a.id \
         LEFT JOIN Tag t ON t.id = at.tagId \
         WHERE a.ownerId = ?1 AND (?2 IS NULL OR a.status = ?2) \
         GROUP BY a.id \
         ORDER BY a.activityDate DESC"
            .to_string()
    } else {
        "SELECT a.id, a.title, a.activityType, a.provider, a.activityDate, a.hours, a.reflection, a.status, \
             owner.id, owner.email, owner.displayName, ownerRole.id, ownerRole.name, \
             reviewer.id, reviewer.email, reviewer.displayName, reviewerRole.id, reviewerRole.name, \
             a.goalId, a.createdAt, a.updatedAt, GROUP_CONCAT(DISTINCT t.name) \
         FROM Activity a \
         JOIN User owner ON owner.id = a.ownerId \
         JOIN Role ownerRole ON ownerRole.id = owner.roleId \
         LEFT JOIN User reviewer ON reviewer.id = a.reviewerId \
         LEFT JOIN Role reviewerRole ON reviewerRole.id = reviewer.roleId \
         LEFT JOIN ActivityTag at ON at.activityId = a.id \
         LEFT JOIN Tag t ON t.id = at.tagId \
         WHERE (?1 IS NULL OR a.status = ?1) AND (?2 IS NULL OR a.ownerId = ?2) \
         GROUP BY a.id \
         ORDER BY a.activityDate DESC"
            .to_string()
    };

    let mut stmt = conn.prepare(&sql)?;
    let mut rows = if actor_role == "TEACHER" {
        stmt.query(params![actor_id, status_filter])?
    } else {
        stmt.query(params![status_filter, owner_filter])?
    };

    let mut activities = Vec::new();
    while let Some(row) = rows.next()? {
        activities.push(map_activity_row(&conn, &row)?);
    }

    Ok(ActivityListResponse { activities })
}

fn map_activity_row(conn: &rusqlite::Connection, row: &Row<'_>) -> Result<ActivityDto> {
    let id: i64 = row.get(0)?;
    let title: String = row.get(1)?;
    let activity_type: String = row.get(2)?;
    let provider: Option<String> = row.get(3)?;
    let activity_date: NaiveDateTime = row.get(4)?;
    let hours: f64 = row.get(5)?;
    let reflection: Option<String> = row.get(6)?;
    let status: String = row.get(7)?;
    let owner = UserDto {
        id: row.get(8)?,
        email: row.get(9)?,
        display_name: row.get(10)?,
        role: crate::models::RoleDto {
            id: row.get(11)?,
            name: row.get(12)?,
        },
    };

    let reviewer: Option<UserDto> = match row.get::<_, Option<i64>>(13)? {
        Some(reviewer_id) => Some(UserDto {
            id: reviewer_id,
            email: row.get(14)?,
            display_name: row.get(15)?,
            role: crate::models::RoleDto {
                id: row.get(16)?,
                name: row.get(17)?,
            },
        }),
        None => None,
    };

    let goal_id: Option<i64> = row.get(18)?;
    let created_at: NaiveDateTime = row.get(19)?;
    let updated_at: NaiveDateTime = row.get(20)?;
    let tags: Option<String> = row.get(21)?;

    let mut tag_list = Vec::new();
    if let Some(tag_string) = tags {
        tag_list = tag_string
            .split(',')
            .filter(|v| !v.is_empty())
            .map(|v| v.trim().to_string())
            .collect();
    }

    let status_history = fetch_status_history(conn, id)?;
    let comments = fetch_comments(conn, id)?;

    Ok(ActivityDto {
        id,
        title,
        activity_type,
        provider,
        activity_date: activity_date.date(),
        hours,
        reflection,
        status,
        owner,
        reviewer,
        tags: tag_list,
        goal_id,
        created_at: to_utc(created_at),
        updated_at: to_utc(updated_at),
        status_history,
        comments,
    })
}

fn fetch_status_history(
    conn: &rusqlite::Connection,
    activity_id: i64,
) -> Result<Vec<ActivityStatusHistoryDto>> {
    let mut stmt = conn.prepare(
        "SELECT h.id, h.status, h.comment, h.createdAt, u.id, u.displayName, r.name \
         FROM ActivityStatusHistory h \
         LEFT JOIN User u ON u.id = h.changedById \
         LEFT JOIN Role r ON r.id = u.roleId \
         WHERE h.activityId = ?1 ORDER BY h.createdAt ASC",
    )?;
    let mut rows = stmt.query(params![activity_id])?;
    let mut entries = Vec::new();
    while let Some(row) = rows.next()? {
        let id: i64 = row.get(0)?;
        let status: String = row.get(1)?;
        let comment: Option<String> = row.get(2)?;
        let created_at: NaiveDateTime = row.get(3)?;
        let changed_by = match row.get::<_, Option<i64>>(4)? {
            Some(user_id) => Some(UserSummaryDto {
                id: user_id,
                display_name: row.get(5)?,
                role: row.get(6)?,
            }),
            None => None,
        };
        entries.push(ActivityStatusHistoryDto {
            id,
            status,
            comment,
            changed_by,
            created_at: to_utc(created_at),
        });
    }
    Ok(entries)
}

fn fetch_comments(
    conn: &rusqlite::Connection,
    activity_id: i64,
) -> Result<Vec<ActivityCommentDto>> {
    let mut stmt = conn.prepare(
        "SELECT c.id, c.body, c.createdAt, u.id, u.displayName, r.name \
         FROM ActivityComment c \
         JOIN User u ON u.id = c.authorId \
         JOIN Role r ON r.id = u.roleId \
         WHERE c.activityId = ?1 ORDER BY c.createdAt ASC",
    )?;
    let mut rows = stmt.query(params![activity_id])?;
    let mut comments = Vec::new();
    while let Some(row) = rows.next()? {
        let id: i64 = row.get(0)?;
        let body: String = row.get(1)?;
        let created_at: NaiveDateTime = row.get(2)?;
        let author = UserSummaryDto {
            id: row.get(3)?,
            display_name: row.get(4)?,
            role: row.get(5)?,
        };
        comments.push(ActivityCommentDto {
            id,
            body,
            author,
            created_at: to_utc(created_at),
        });
    }
    Ok(comments)
}

#[tauri::command]
pub fn create_activity(
    state: State<'_, DbState>,
    actor_id: i64,
    input: ActivityInput,
) -> Result<ActivityDto> {
    validate_hours(input.hours)?;
    let conn = state.connection();
    let role = get_user_role(&conn, actor_id)?;
    if role != "TEACHER" {
        return Err(AppError::Unauthorized);
    }

    let tx = conn.unchecked_transaction()?;
    tx.execute(
        "INSERT INTO Activity (title, activityType, provider, activityDate, hours, reflection, status, ownerId, goalId) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'DRAFT', ?7, ?8)",
        params![
            input.title,
            input.activity_type,
            input.provider,
            input
                .activity_date
                .and_hms_opt(0, 0, 0)
                .ok_or_else(|| AppError::validation("Invalid activity date."))?,
            input.hours,
            input.reflection,
            actor_id,
            input.goal_id,
        ],
    )?;

    let activity_id = tx.last_insert_rowid();
    update_tags(tx.conn(), activity_id, &input.tags)?;
    tx.execute(
        "INSERT INTO ActivityStatusHistory (activityId, status, comment, changedById) VALUES (?1, 'DRAFT', 'Created draft', ?2)",
        params![activity_id, actor_id],
    )?;
    tx.commit()?;

    let mut stmt = conn.prepare("SELECT a.id, a.title, a.activityType, a.provider, a.activityDate, a.hours, a.reflection, a.status, owner.id, owner.email, owner.displayName, ownerRole.id, ownerRole.name, reviewer.id, reviewer.email, reviewer.displayName, reviewerRole.id, reviewerRole.name, a.goalId, a.createdAt, a.updatedAt, GROUP_CONCAT(DISTINCT t.name) FROM Activity a JOIN User owner ON owner.id = a.ownerId JOIN Role ownerRole ON ownerRole.id = owner.roleId LEFT JOIN User reviewer ON reviewer.id = a.reviewerId LEFT JOIN Role reviewerRole ON reviewerRole.id = reviewer.roleId LEFT JOIN ActivityTag at ON at.activityId = a.id LEFT JOIN Tag t ON t.id = at.tagId WHERE a.id = ?1 GROUP BY a.id")?;
    let activity_row = stmt.query_row(params![activity_id], |row| map_activity_row(&conn, row))?;
    Ok(activity_row)
}

fn update_tags(conn: &rusqlite::Connection, activity_id: i64, tags: &[String]) -> Result<()> {
    conn.execute(
        "DELETE FROM ActivityTag WHERE activityId = ?1",
        params![activity_id],
    )?;
    for tag in tags {
        if tag.trim().is_empty() {
            continue;
        }
        let tag_id = ensure_tag(conn, tag)?;
        conn.execute(
            "INSERT OR IGNORE INTO ActivityTag (activityId, tagId) VALUES (?1, ?2)",
            params![activity_id, tag_id],
        )?;
    }
    Ok(())
}

fn ensure_tag(conn: &rusqlite::Connection, tag: &str) -> Result<i64> {
    conn.execute("INSERT OR IGNORE INTO Tag (name) VALUES (?1)", params![tag])?;
    conn.query_row("SELECT id FROM Tag WHERE name = ?1", params![tag], |row| {
        row.get(0)
    })
    .map_err(Into::into)
}

#[tauri::command]
pub fn update_activity(
    state: State<'_, DbState>,
    actor_id: i64,
    activity_id: i64,
    input: ActivityInput,
) -> Result<ActivityDto> {
    validate_hours(input.hours)?;
    let conn = state.connection();
    let role = get_user_role(&conn, actor_id)?;
    let status: String = conn
        .query_row(
            "SELECT status FROM Activity WHERE id = ?1 AND ownerId = ?2",
            params![activity_id, actor_id],
            |row| row.get(0),
        )
        .map_err(|_| AppError::Unauthorized)?;

    if role == "TEACHER" && status != "DRAFT" {
        return Err(AppError::validation(
            "Activities can only be edited while in DRAFT status.",
        ));
    }

    if role != "TEACHER" && role != "ADMIN" {
        return Err(AppError::Unauthorized);
    }

    conn.execute(
        "UPDATE Activity SET title = ?1, activityType = ?2, provider = ?3, activityDate = ?4, hours = ?5, reflection = ?6, goalId = ?7 WHERE id = ?8",
        params![
            input.title,
            input.activity_type,
            input.provider,
            input
                .activity_date
                .and_hms_opt(0, 0, 0)
                .ok_or_else(|| AppError::validation("Invalid activity date."))?,
            input.hours,
            input.reflection,
            input.goal_id,
            activity_id,
        ],
    )?;

    update_tags(&conn, activity_id, &input.tags)?;
    fetch_activity_by_id(&conn, activity_id)
}

fn fetch_activity_by_id(conn: &rusqlite::Connection, activity_id: i64) -> Result<ActivityDto> {
    let mut stmt = conn.prepare(
        "SELECT a.id, a.title, a.activityType, a.provider, a.activityDate, a.hours, a.reflection, a.status, \
            owner.id, owner.email, owner.displayName, ownerRole.id, ownerRole.name, \
            reviewer.id, reviewer.email, reviewer.displayName, reviewerRole.id, reviewerRole.name, \
            a.goalId, a.createdAt, a.updatedAt, GROUP_CONCAT(DISTINCT t.name) \
        FROM Activity a \
        JOIN User owner ON owner.id = a.ownerId \
        JOIN Role ownerRole ON ownerRole.id = owner.roleId \
        LEFT JOIN User reviewer ON reviewer.id = a.reviewerId \
        LEFT JOIN Role reviewerRole ON reviewerRole.id = reviewer.roleId \
        LEFT JOIN ActivityTag at ON at.activityId = a.id \
        LEFT JOIN Tag t ON t.id = at.tagId \
        WHERE a.id = ?1 \
        GROUP BY a.id",
    )?;
    stmt.query_row(params![activity_id], |row| map_activity_row(conn, row))
        .map_err(|_| AppError::NotFound)
}

#[tauri::command]
pub fn delete_activity(state: State<'_, DbState>, actor_id: i64, activity_id: i64) -> Result<()> {
    let conn = state.connection();
    let status: String = conn
        .query_row(
            "SELECT status FROM Activity WHERE id = ?1 AND ownerId = ?2",
            params![activity_id, actor_id],
            |row| row.get(0),
        )
        .map_err(|_| AppError::Unauthorized)?;

    if status != "DRAFT" {
        return Err(AppError::validation(
            "Only draft activities can be deleted by the owner.",
        ));
    }

    conn.execute("DELETE FROM Activity WHERE id = ?1", params![activity_id])?;
    Ok(())
}

#[tauri::command]
pub fn transition_activity_status(
    state: State<'_, DbState>,
    actor_id: i64,
    payload: StatusTransitionInput,
) -> Result<ActivityDto> {
    let conn = state.connection();
    let role = get_user_role(&conn, actor_id)?;
    let current: (String, i64) = conn
        .query_row(
            "SELECT status, ownerId FROM Activity WHERE id = ?1",
            params![payload.activity_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|_| AppError::NotFound)?;

    let next_status = payload.status.to_uppercase();
    match (current.0.as_str(), next_status.as_str()) {
        ("DRAFT", "SUBMITTED") if current.1 == actor_id && role == "TEACHER" => {}
        ("SUBMITTED", "APPROVED") | ("SUBMITTED", "REJECTED") if role != "TEACHER" => {}
        _ => {
            return Err(AppError::validation(
                "Status transition not permitted for the current user.",
            ))
        }
    }

    conn.execute(
        "UPDATE Activity SET status = ?1, reviewerId = CASE WHEN ?1 IN ('APPROVED','REJECTED') THEN ?2 ELSE reviewerId END WHERE id = ?3",
        params![next_status, actor_id, payload.activity_id],
    )?;

    conn.execute(
        "INSERT INTO ActivityStatusHistory (activityId, status, comment, changedById) VALUES (?1, ?2, ?3, ?4)",
        params![
            payload.activity_id,
            next_status,
            payload.comment,
            actor_id,
        ],
    )?;

    fetch_activity_by_id(&conn, payload.activity_id)
}

#[tauri::command]
pub fn add_comment(
    state: State<'_, DbState>,
    actor_id: i64,
    payload: CommentInput,
) -> Result<ActivityDto> {
    let conn = state.connection();
    conn.execute(
        "INSERT INTO ActivityComment (activityId, authorId, body) VALUES (?1, ?2, ?3)",
        params![payload.activity_id, actor_id, payload.body],
    )?;

    fetch_activity_by_id(&conn, payload.activity_id)
}

fn validate_hours(hours: f64) -> Result<()> {
    if hours <= 0.0 {
        return Err(AppError::validation("Hours must be greater than zero."));
    }
    if hours > 24.0 {
        return Err(AppError::validation(
            "Activities longer than 24 hours must be split into multiple entries.",
        ));
    }
    Ok(())
}
