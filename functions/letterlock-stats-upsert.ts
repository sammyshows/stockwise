const client = require("../database/client.ts")

const handler = async (event, context) => {
  const eventBody = JSON.parse(event.body)

  const userId = eventBody.settings.id

  // We will cast this to json in the query below, so it must be a string.
  let levelHistoryJson = eventBody.levelHistory
  if (typeof eventBody.levelHistory === 'string') {
      levelHistoryJson = JSON.parse(eventBody.levelHistory)
  }

  // Upsert into letterlock_user_stats
  await client`
    INSERT INTO letterlock_user_stats (user_id, ads_watched_for_lives, ads_watched_for_moves, zero_lives_tally, level_history, device_os, device_model, letterlock_version, platform)
    VALUES (${userId}, ${eventBody.stats.adsWatchedForLives}, ${eventBody.stats.adsWatchedForMoves}, ${eventBody.stats.zeroLivesTally}, ${levelHistoryJson}::jsonb, ${eventBody.deviceOS}, ${eventBody.deviceModel}, ${eventBody.letterlockVersion || eventBody.stockwiseVersion}, ${eventBody.platform || 'unknown'})
    ON CONFLICT (user_id)
    DO UPDATE SET
        ads_watched_for_lives = EXCLUDED.ads_watched_for_lives,
        ads_watched_for_moves = EXCLUDED.ads_watched_for_moves,
        zero_lives_tally = EXCLUDED.zero_lives_tally,
        level_history = EXCLUDED.level_history,
        device_os = EXCLUDED.device_os,
        device_model = EXCLUDED.device_model,
        stockwise_version = EXCLUDED.stockwise_version,
        platform = EXCLUDED.platform`

  // Upsert into letterlock_settings
  await client`
    INSERT INTO letterlock_settings (user_id, notifications, sound, vibrations)
    VALUES (${userId}, ${eventBody.settings.notifications}, ${eventBody.settings.sound}, ${eventBody.settings.vibrations})
    ON CONFLICT (user_id)
    DO UPDATE SET
        notifications = EXCLUDED.notifications,
        sound = EXCLUDED.sound,
        vibrations = EXCLUDED.vibrations`

  // Insert into letterlock_ads_watched
  for (const ad of eventBody.adsWatched) {
    await client`
      INSERT INTO letterlock_ads_watched (user_id, streak, ad_type, current_level_id, level_attempts, level_successes)
      VALUES (${userId}, ${ad.levelStreak}, ${ad.adType}, ${ad.levelId}, ${ad.levelAttemptTally}, ${ad.levelSuccessTally})`
  }

  return {
    headers: { 'Access-Control-Allow-Origin': '*' },
    statusCode: 200
  }
}

export { handler }
