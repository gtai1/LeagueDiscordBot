import sqlite3 from 'sqlite3';

export default class Database {
	async getPingedGameIds() {
		const db = new sqlite3.Database('./database.db');
		return new Promise((resolve, reject) => {
			let gameIds = [];
			db.each(
				`SELECT * FROM games_pinged;`,
				(err, row) => {
					if (err) {
						reject(err);
					}
					gameIds.push(row.game_id);
				},
				() => {
					resolve(gameIds);
				}
			);
		});
	}

	async addPingedGameIds(pingedGames) {
		const db = new sqlite3.Database('./database.db');
		return new Promise((resolve, reject) => {
			let placeholders = pingedGames.map((x) => '(?)').join(',');
			let sql = 'INSERT INTO games_pinged VALUES ' + placeholders;
			db.run(sql, pingedGames, function (err) {
				if (err) {
					reject(err);
				}
				resolve(true);
			});
		});
	}

	async isGamePinged(gameId) {
		//return bool whether gameId is in table
	}
}
