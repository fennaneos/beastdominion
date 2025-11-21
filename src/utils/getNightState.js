// ============================================================================
// GETNIGHTSTATE.JS — TIMEZONE-BASED NIGHT MODE
// ============================================================================

export default function getNightState() {
  const hour = new Date().getHours();
  // Night time: 8 PM (20:00) to 6 AM (06:00)
  return hour >= 20 || hour < 6;
}

export function getTimeOfDay() {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}