const client = require("../database/client.ts")

const handler = async (event, context) => {
  const eventBody = JSON.parse(event.body)

  const userId = eventBody.userId

  const leaderboardAllTime = await client`
    WITH ranked_users AS (
        SELECT 
            stats.user_id, 
            stats.device_model, 
            (SELECT COUNT(*) FROM jsonb_object_keys(CAST(stats.level_history AS jsonb))) - 1 AS levels_completed_count, 
            stats.updated_at, 
            stats.created_at,
            settings.username, 
            ROW_NUMBER() OVER (ORDER BY ((SELECT COUNT(*) FROM jsonb_object_keys(CAST(stats.level_history AS jsonb))) - 1) DESC) as position
        FROM letterlock_user_stats AS stats
        JOIN letterlock_settings AS settings ON stats.user_id = settings.user_id
        WHERE user_id NOT IN ('81845c27-18fb-4a7b-8fb6-9046c949deb7', '9e5a2c95-4244-4a2a-87bb-3cdb377c67e7')
    )
    SELECT user_id, username, device_model, levels_completed_count, updated_at, created_at, position FROM (
        (SELECT * FROM ranked_users WHERE user_id != (${userId} LIMIT 4)
        UNION ALL
        (SELECT * FROM ranked_users WHERE user_id = ${userId})
    ) as top_users
    ORDER BY levels_completed_count DESC;`;

  return {
    headers: { 'Access-Control-Allow-Origin': '*' },
    statusCode: 200,
    body: JSON.stringify({
      leaderboardAllTime: leaderboardAllTime
    })
  }
}

export { handler }
