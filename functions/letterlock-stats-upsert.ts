const client = require("../database/client.ts")
import postgres from 'postgres'
const sql = postgres({  })
const handler = async (event, context) => {
  const eventBody = JSON.parse(event.body)

  const userId = eventBody.settings.id;

  // Upsert into letterlock_user_stats
  await client`
    INSERT INTO letterlock_user_stats (user_id, ads_watched_for_lives, ads_watched_for_moves, zero_lives_tally, level_history)
    VALUES (${userId}, ${eventBody.stats.adsWatchedForLives}, ${eventBody.stats.adsWatchedForMoves}, ${eventBody.stats.zeroLivesTally}, ${sql.json(eventBody.levelHistory)})
    ON CONFLICT (user_id)
    DO UPDATE SET
        ads_watched_for_lives = EXCLUDED.ads_watched_for_lives,
        ads_watched_for_moves = EXCLUDED.ads_watched_for_moves,
        zero_lives_tally = EXCLUDED.zero_lives_tally,
        level_history = EXCLUDED.level_history
  `;

  // Upsert into letterlock_settings
  await client`
    INSERT INTO letterlock_settings (user_id, notifications, sound, vibrations)
    VALUES (${userId}, ${eventBody.settings.notifications}, ${eventBody.settings.sound}, ${eventBody.settings.vibrations})
    ON CONFLICT (user_id)
    DO UPDATE SET
        notifications = EXCLUDED.notifications,
        sound = EXCLUDED.sound,
        vibrations = EXCLUDED.vibrations
  `;

  const stuff = await client`SELECT lus.level_history AS best_remaining_moves FROM letterlock_user_stats lus;`

  return {
    headers: { 'Access-Control-Allow-Origin': '*' },
    statusCode: 200
  }
}

export { handler }
