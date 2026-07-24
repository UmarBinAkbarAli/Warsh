export async function GET() {
  return Response.json({
    service: "Warsh API",
    status: "ok",
    health: "https://api.warsh.app/api/health",
    website: "https://warsh.app",
  });
}
