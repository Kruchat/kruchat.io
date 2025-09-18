use rusqlite::params;
use tauri::State;

use crate::{
    db::DbState,
    error::{AppError, Result},
    models::YearlyGoalDto,
};

#[tauri::command]
pub fn list_goals(state: State<'_, DbState>, user_id: i64) -> Result<Vec<YearlyGoalDto>> {
    let conn = state.connection();
    let mut stmt = conn.prepare(
        "SELECT id, year, targetHours, notes FROM YearlyGoal WHERE userId = ?1 ORDER BY year DESC",
    )?;
    let mut rows = stmt.query(params![user_id])?;
    let mut goals = Vec::new();
    while let Some(row) = rows.next()? {
        goals.push(YearlyGoalDto {
            id: row.get(0)?,
            year: row.get(1)?,
            target_hours: row.get(2)?,
            notes: row.get(3)?,
        });
    }
    if goals.is_empty() {
        return Err(AppError::NotFound);
    }
    Ok(goals)
}
