const username = 'AAYUSHMISHRA0329';
let cached;

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.statusCode = 405;
    response.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  if (cached && Date.now() - cached.time < 15 * 60 * 1000) {
    response.end(JSON.stringify(cached.data));
    return;
  }
  try {
    const year = new Date().getUTCFullYear();
    const upstream = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: `https://leetcode.com/u/${username}/` },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        query: 'query portfolio($username: String!, $year: Int!, $previousYear: Int!) { matchedUser(username: $username) { username submitStatsGlobal { acSubmissionNum { difficulty count } } currentCalendar: userCalendar(year: $year) { submissionCalendar } previousCalendar: userCalendar(year: $previousYear) { submissionCalendar } } }',
        variables: { username, year, previousYear: year - 1 },
      }),
    });
    if (!upstream.ok) throw new Error('LeetCode unavailable');
    const result = await upstream.json();
    const user = result.data?.matchedUser;
    if (result.errors?.length || !user) throw new Error('No profile data');
    const counts = Object.fromEntries(user.submitStatsGlobal.acSubmissionNum.map(item => [item.difficulty.toLowerCase(), item.count]));
    if (!['all', 'easy', 'medium', 'hard'].every(key => Number.isInteger(counts[key]) && counts[key] >= 0)) throw new Error('Invalid statistics');
    const calendars = [user.previousCalendar, user.currentCalendar].map(item => JSON.parse(item.submissionCalendar || '{}'));
    if (calendars.some(item => !item || typeof item !== 'object' || Array.isArray(item))) throw new Error('Invalid calendar');
    const calendar = Object.assign({}, ...calendars);
    const data = { username: user.username, solved: counts, calendar, updatedAt: new Date().toISOString() };
    cached = { time: Date.now(), data };
    response.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
    response.end(JSON.stringify(data));
  } catch {
    response.statusCode = 503;
    response.end(JSON.stringify({ error: 'LeetCode activity is temporarily unavailable.' }));
  }
}
