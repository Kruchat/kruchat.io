use std::path::PathBuf;

use chrono::{Datelike, NaiveDate, NaiveDateTime, NaiveTime, Utc};
use parking_lot::Mutex;
use rusqlite::{params, Connection, OpenFlags};
use tauri::AppHandle;

use crate::error::{AppError, Result};

pub struct DbState {
    conn: Mutex<Connection>,
    pub db_path: PathBuf,
}

impl DbState {
    pub fn initialize(app_handle: &AppHandle) -> Result<Self> {
        let app_dir = tauri::api::path::app_data_dir(app_handle.config())
            .ok_or_else(|| AppError::Other("could not determine app data directory".into()))?;
        std::fs::create_dir_all(&app_dir)?;
        let db_path = app_dir.join("activities.db");
        let flags = OpenFlags::SQLITE_OPEN_READ_WRITE
            | OpenFlags::SQLITE_OPEN_CREATE
            | OpenFlags::SQLITE_OPEN_FULL_MUTEX;
        let mut conn = Connection::open_with_flags(&db_path, flags)?;
        conn.pragma_update(None, "foreign_keys", "ON")?;

        std::env::set_var(
            "DATABASE_URL",
            format!("file:{}", db_path.to_string_lossy()),
        );

        let version: i64 = conn.pragma_query_value(None, "user_version", |row| row.get(0))?;
        if version == 0 {
            run_migrations(&mut conn)?;
            conn.pragma_update(None, "user_version", &1)?;
            seed_defaults(&mut conn)?;
        }

        Ok(Self {
            conn: Mutex::new(conn),
            db_path,
        })
    }

    pub fn connection(&self) -> parking_lot::MutexGuard<'_, Connection> {
        self.conn.lock()
    }
}

fn run_migrations(conn: &mut Connection) -> Result<()> {
    let migration_sql = include_str!("../prisma/migrations/20240101000000_init/migration.sql");
    conn.execute_batch(migration_sql)?;
    Ok(())
}

fn seed_defaults(conn: &mut Connection) -> Result<()> {
    let tx = conn.transaction()?;
    for role in ["TEACHER", "SUPERVISOR", "ADMIN"] {
        tx.execute(
            "INSERT OR IGNORE INTO Role (name) VALUES (?1)",
            params![role],
        )?;
    }

    let teacher_role_id: i64 =
        tx.query_row("SELECT id FROM Role WHERE name = 'TEACHER'", [], |row| {
            row.get(0)
        })?;
    let supervisor_role_id: i64 =
        tx.query_row("SELECT id FROM Role WHERE name = 'SUPERVISOR'", [], |row| {
            row.get(0)
        })?;
    let admin_role_id: i64 =
        tx.query_row("SELECT id FROM Role WHERE name = 'ADMIN'", [], |row| {
            row.get(0)
        })?;

    let hashed_password = bcrypt::hash("password123", 10)
        .map_err(|err| AppError::Other(format!("failed to hash password: {err}")))?;

    tx.execute(
        "INSERT OR IGNORE INTO User (email, passwordHash, displayName, roleId) VALUES (?1, ?2, ?3, ?4)",
        params![
            "teacher@example.com",
            hashed_password.as_str(),
            "Taylor Teacher",
            teacher_role_id,
        ],
    )?;

    tx.execute(
        "INSERT OR IGNORE INTO User (email, passwordHash, displayName, roleId) VALUES (?1, ?2, ?3, ?4)",
        params![
            "supervisor@example.com",
            hashed_password.as_str(),
            "Sam Supervisor",
            supervisor_role_id,
        ],
    )?;

    tx.execute(
        "INSERT OR IGNORE INTO User (email, passwordHash, displayName, roleId) VALUES (?1, ?2, ?3, ?4)",
        params![
            "admin@example.com",
            hashed_password.as_str(),
            "Ada Admin",
            admin_role_id,
        ],
    )?;

    tx.execute(
        "INSERT OR IGNORE INTO RubricConfiguration (id, name, description, weight, active) VALUES (1, ?1, ?2, ?3, 1)",
        params![
            "Impact",
            "How the activity impacts learners or community.",
            0.4f64,
        ],
    )?;

    tx.execute(
        "INSERT OR IGNORE INTO RubricConfiguration (id, name, description, weight, active) VALUES (2, ?1, ?2, ?3, 1)",
        params![
            "Reflection",
            "Quality of reflection submitted by the educator.",
            0.3f64,
        ],
    )?;

    tx.execute(
        "INSERT OR IGNORE INTO RubricConfiguration (id, name, description, weight, active) VALUES (3, ?1, ?2, ?3, 1)",
        params![
            "Evidence",
            "Strength of supporting evidence provided.",
            0.3f64,
        ],
    )?;

    let current_year = chrono::Utc::now().year();
    let teacher_id: i64 = tx.query_row(
        "SELECT id FROM User WHERE email = 'teacher@example.com'",
        [],
        |row| row.get(0),
    )?;

    tx.execute(
        "INSERT OR IGNORE INTO YearlyGoal (userId, year, targetHours, notes) VALUES (?1, ?2, ?3, ?4)",
        params![
            teacher_id,
            current_year,
            40.0f64,
            "Default target for professional development.",
        ],
    )?;

    let supervisor_id: i64 = tx.query_row(
        "SELECT id FROM User WHERE email = 'supervisor@example.com'",
        [],
        |row| row.get(0),
    )?;

    let goal_id: i64 = tx.query_row(
        "SELECT id FROM YearlyGoal WHERE userId = ?1 AND year = ?2",
        params![teacher_id, current_year],
        |row| row.get(0),
    )?;

    tx.execute(
        "INSERT OR IGNORE INTO Activity (id, title, activityType, provider, activityDate, hours, reflection, status, ownerId, reviewerId, goalId) VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            "STEM Workshop",
            "PROFESSIONAL_DEVELOPMENT",
            "Local University",
            NaiveDateTime::new(NaiveDate::from_ymd_opt(current_year, 1, 15).unwrap(), chrono::NaiveTime::from_hms_opt(9, 0, 0).unwrap()),
            4.0f64,
            "Great opportunity to collaborate with peers.",
            "SUBMITTED",
            teacher_id,
            supervisor_id,
            goal_id,
        ],
    )?;

    let activity_exists: i64 = tx.query_row(
        "SELECT COUNT(*) FROM ActivityTag WHERE activityId = 1",
        [],
        |row| row.get(0),
    )?;

    if activity_exists == 0 {
        let stem_tag_id = ensure_tag(&tx, "STEM")?;
        let workshop_tag_id = ensure_tag(&tx, "Workshop")?;
        tx.execute(
            "INSERT OR IGNORE INTO ActivityTag (activityId, tagId) VALUES (1, ?1)",
            params![stem_tag_id],
        )?;
        tx.execute(
            "INSERT OR IGNORE INTO ActivityTag (activityId, tagId) VALUES (1, ?1)",
            params![workshop_tag_id],
        )?;
    }

    let history_count: i64 = tx.query_row(
        "SELECT COUNT(*) FROM ActivityStatusHistory WHERE activityId = 1",
        [],
        |row| row.get(0),
    )?;

    if history_count == 0 {
        let now = Utc::now();
        tx.execute(
            "INSERT INTO ActivityStatusHistory (activityId, status, comment, changedById, createdAt) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                1,
                "DRAFT",
                "Initial draft created.",
                teacher_id,
                now,
            ],
        )?;
        tx.execute(
            "INSERT INTO ActivityStatusHistory (activityId, status, comment, changedById, createdAt) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                1,
                "SUBMITTED",
                "Submitted for review.",
                teacher_id,
                now,
            ],
        )?;
    }

    tx.commit()?;
    Ok(())
}

fn ensure_tag(conn: &Connection, name: &str) -> Result<i64> {
    conn.execute(
        "INSERT OR IGNORE INTO Tag (name) VALUES (?1)",
        params![name],
    )?;
    let id = conn.query_row("SELECT id FROM Tag WHERE name = ?1", params![name], |row| {
        row.get(0)
    })?;
    Ok(id)
}
