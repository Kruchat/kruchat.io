#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod error;
mod models;

use commands::{
    add_comment, create_activity, delete_activity, list_activities, list_goals, login,
    transition_activity_status, update_activity,
};
use db::DbState;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            let db =
                DbState::initialize(&handle).map_err(|err| anyhow::anyhow!(err.to_string()))?;
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            login,
            list_activities,
            create_activity,
            update_activity,
            delete_activity,
            transition_activity_status,
            add_comment,
            list_goals
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
