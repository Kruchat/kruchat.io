use bcrypt::verify;
use rusqlite::params;
use tauri::State;

use crate::{
    db::DbState,
    error::{AppError, Result},
    models::{LoginRequest, LoginResponse, RoleDto, UserDto},
};

#[tauri::command]
pub fn login(state: State<'_, DbState>, payload: LoginRequest) -> Result<LoginResponse> {
    let conn = state.connection();
    let mut stmt = conn.prepare(
        "SELECT u.id, u.email, u.passwordHash, u.displayName, r.id, r.name \
         FROM User u JOIN Role r ON u.roleId = r.id WHERE LOWER(u.email) = LOWER(?1)",
    )?;

    let row = stmt
        .query_row(params![payload.email], |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, i64>(4)?,
                row.get::<_, String>(5)?,
            ))
        })
        .map_err(|_| AppError::Unauthorized)?;

    let password_matches = verify(payload.password, &row.2)
        .map_err(|err| AppError::Other(format!("failed to verify password: {err}")))?;

    if !password_matches {
        return Err(AppError::Unauthorized);
    }

    let role = RoleDto {
        id: row.4,
        name: row.5,
    };

    let user = UserDto {
        id: row.0,
        email: row.1,
        display_name: row.3,
        role,
    };

    Ok(LoginResponse {
        token: format!("local-{}", user.id),
        user,
    })
}
