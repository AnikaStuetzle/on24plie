import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { db } from "../db.ts";

const router = new Router();

router.get("/api/progress", (ctx) => {
  try {
    // alle Trainings holen
    const rows = [
      ...db.query("SELECT id, date, duration, intensity FROM sessions"),
    ];

    const sessions = rows.map(([id, date, duration, intensity]) => {
      const dur = Number(duration ?? 0);
      const intRaw = intensity ?? 0;
      const int = Number.isFinite(Number(intRaw)) ? Number(intRaw) : 0;

      return {
        id: Number(id),
        date: String(date),
        duration: dur,
        intensity: int,
      };
    });

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1–12

    let totalMinutesAll = 0;

    let totalMinutesYear = 0;
    let totalSessionsYear = 0;
    let sumIntensityYear = 0;
    let highIntensitySessionsYear = 0;

    let minutesThisMonth = 0;
    let sessionsThisMonth = 0;

    const recentSessions = [...sessions]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);

    for (const s of sessions) {
      if (!Number.isFinite(s.duration)) continue;

      totalMinutesAll += s.duration;

      const year = Number(s.date.slice(0, 4));
      const month = Number(s.date.slice(5, 7));

      if (year === currentYear) {
        totalMinutesYear += s.duration;
        totalSessionsYear += 1;
        sumIntensityYear += s.intensity;
        if (s.intensity >= 4) highIntensitySessionsYear += 1;

        if (month === currentMonth) {
          minutesThisMonth += s.duration;
          sessionsThisMonth += 1;
        }
      }
    }

    const hoursAll = totalMinutesAll / 60;
    const hoursYear = totalMinutesYear / 60;
    const hoursThisMonth = minutesThisMonth / 60;

    const avgDurationYear =
      totalSessionsYear > 0
        ? Math.round((totalMinutesYear / totalSessionsYear) * 10) / 10
        : 0;

    const avgIntensityYear =
      totalSessionsYear > 0
        ? Math.round((sumIntensityYear / totalSessionsYear) * 10) / 10
        : 0;

    ctx.response.body = {
      currentYear,
      totalMinutesYear,
      totalHoursYear: Math.round(hoursYear * 10) / 10,
      totalSessionsYear,
      avgDurationYear,
      totalMinutesAll,
      totalHoursAll: Math.round(hoursAll * 10) / 10,
      sessionsThisMonth,
      minutesThisMonth,
      hoursThisMonth: Math.round(hoursThisMonth * 10) / 10,
      highIntensitySessionsYear,
      avgIntensityYear,
      recentSessions,
    };
  } catch (err) {
    console.error("Fehler in /api/progress:", err);
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Fehler beim Berechnen des Fortschritts.",
    };
  }
});

export default router;
