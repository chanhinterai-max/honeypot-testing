// Simplified DB stub for deployment
export async function ensureDbReady() {
  console.log("DB ready (stub)");
}

export async function query(sql: string, params?: any[]) {
  return [];
}
