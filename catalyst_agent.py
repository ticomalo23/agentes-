#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Catalyst Agent — Codex Edition v3.4
-----------------------------------
Incluye:
- Email Gmail API automático (7:45 AM CT)
- Earnings (FMP)
- Calendario económico (TradingEconomics)
- SQLite para estadísticas
- Panel web (FastAPI) para leer el último reporte
"""

import os, csv, json, time, sqlite3, requests, feedparser, argparse
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from email.mime.text import MIMEText
import base64
from dotenv import load_dotenv
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from rich.console import Console
from rich.panel import Panel

console = Console()
load_dotenv()

# ======================
# CONFIGURACIÓN GENERAL
# ======================
TZ = ZoneInfo("America/Chicago")
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]
GMAIL_SENDER = os.getenv("GMAIL_SENDER", "")
FMP_API_KEY = os.getenv("FMP_API_KEY", "")
TE_API_KEY = os.getenv("TE_API_KEY", "")

WEIGHTS_FILE = "keyweights.json"
SENT_DB_PATH = "sent_links.json"
CSV_PATH = "alerts_log.csv"
DB_PATH = "catalyst.db"
REPORTS_DIR = "reports"

DEFAULT_EMAILS = ["quirozkarlos8@gmail.com"]

SCHED_PRE = (7, 45)
SCHED_MID = (12, 0)
SCHED_POST = (16, 30)

# ==========
# UTILIDADES
# ==========
def now_ct(): return datetime.now(TZ)
def fmt_ct(dt): return dt.strftime("%Y-%m-%d %H:%M:%S CT")

def gmail_service():
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())
    return build("gmail", "v1", credentials=creds)

def send_email(subject, body, to_addr):
    svc = gmail_service()
    sender = GMAIL_SENDER or "me"
    msg = MIMEText(body, "plain", "utf-8")
    msg["to"] = to_addr
    msg["from"] = sender
    msg["subject"] = subject
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    svc.users().messages().send(userId="me", body={"raw": raw}).execute()

def email_premarket(body, emails):
    subject = f"Global Catalyst – Premarket ({now_ct().strftime('%Y-%m-%d')})"
    for e in emails:
        try:
            send_email(subject, body, e)
            console.print(f"✅ Email enviado a {e}")
        except Exception as err:
            console.print(f"[red]Error enviando email:[/red] {err}")

# ===========
# BASE DE DATOS
# ===========
def db_init():
    os.makedirs(REPORTS_DIR, exist_ok=True)
    with sqlite3.connect(DB_PATH) as con:
        con.execute("""CREATE TABLE IF NOT EXISTS reports(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts TEXT, kind TEXT, path TEXT, vol TEXT,
            semis_cnt INTEGER, energia_cnt INTEGER, finanzas_cnt INTEGER
        )""")
        con.commit()

def db_log_report(ts, kind, path, vol, sectors):
    with sqlite3.connect(DB_PATH) as con:
        con.execute("""INSERT INTO reports(ts,kind,path,vol,semis_cnt,energia_cnt,finanzas_cnt)
                       VALUES(?,?,?,?,?,?,?)""",
                    (ts, kind, path, vol, sectors.get("semis",0), sectors.get("energia",0), sectors.get("finanzas",0)))
        con.commit()

# ===========
# OBTENER DATOS
# ===========
def fetch_feeds(feed_urls, max_items=30):
    items = []
    for url in feed_urls:
        try:
            feed = feedparser.parse(url)
            for e in feed.entries[:max_items]:
                items.append({
                    "source": feed.feed.get("title", url),
                    "title": e.get("title", ""),
                    "link": e.get("link", ""),
                    "summary": e.get("summary", ""),
                })
        except Exception as ex:
            console.print(f"[red]Error feed:[/red] {url} -> {ex}")
        time.sleep(0.05)
    return items

# RSS fuentes base
FEEDS = [
    "https://www.federalreserve.gov/feeds/press_all.xml",
    "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
    "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC,^IXIC,QQQ,SPY,NVDA,AMD,MSFT,AAPL",
    "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    "https://www.marketwatch.com/feeds/topstories",
    "https://www.reuters.com/markets/asia/rss",
    "https://www.reuters.com/markets/europe/rss",
]

def fetch_earnings_fmp(limit=10):
    if not FMP_API_KEY:
        return ["(Sin FMP_API_KEY)"]
    try:
        url = f"https://financialmodelingprep.com/api/v3/earning_calendar?from={datetime.utcnow().strftime('%Y-%m-%d')}&to={datetime.utcnow().strftime('%Y-%m-%d')}&apikey={FMP_API_KEY}"
        r = requests.get(url, timeout=10)
        data = r.json()[:limit]
        out = []
        for d in data:
            sym = d.get("symbol") or d.get("ticker") or ""
            when = d.get("time", "")
            est = d.get("epsEstimated", "—")
            out.append(f"{sym} ({when or '?'}) EPS est: {est}")
        return out
    except Exception as e:
        return [f"(earnings error: {e})"]

def fetch_econ_te(limit=10):
    if not TE_API_KEY:
        return ["(Sin TE_API_KEY)"]
    try:
        url = f"https://api.tradingeconomics.com/calendar?c={TE_API_KEY}"
        r = requests.get(url, timeout=10)
        data = r.json()
        out = []
        today = datetime.utcnow().strftime("%Y-%m-%d")
        for ev in data:
            if not str(ev.get("Date", "")).startswith(today):
                continue
            event = ev.get("Event", "")
            country = ev.get("Country", "")
            impact = ev.get("Importance", "")
            if impact not in ("2", "3"):
                continue
            out.append(f"{country}: {event}")
        return out[:limit] if out else ["(No hay eventos relevantes hoy)"]
    except Exception as e:
        return [f"(econ error: {e})"]

# ===========
# REPORTE
# ===========
def build_report(kind, scored):
    t0 = now_ct()
    header = f"🌎 Global Catalyst Report — {kind.upper()} — {fmt_ct(t0)}\n"
    header += "Flujo Asia → Europa → U.S.\n\n"

    # Simulación simple de conteo por sector
    sectors = {"semis": 3, "energia": 1, "finanzas": 2}
    vol = "media"

    earnings = fetch_earnings_fmp()
    econ = fetch_econ_te()

    body = header
    body += f"## Volatilidad esperada: {vol.upper()}\n"
    body += f"## Sectores — Semis:{sectors['semis']} Energía:{sectors['energia']} Finanzas:{sectors['finanzas']}\n\n"
    body += "## Calendario Económico (TradingEconomics)\n" + "\n".join(f"• {x}" for x in econ) + "\n\n"
    body += "## Earnings Clave (FMP)\n" + "\n".join(f"• {x}" for x in earnings) + "\n\n"
    body += "## Top Titulares\n" + "\n".join(f"• {it['title']}" for it in scored[:5]) + "\n"
    return body, sectors, vol

def save_report(kind, text):
    os.makedirs(REPORTS_DIR, exist_ok=True)
    fname = f"catalyst_{kind}_{now_ct().strftime('%Y%m%d_%H%M')}.txt"
    path = os.path.join(REPORTS_DIR, fname)
    with open(path, "w", encoding="utf-8") as f: f.write(text)
    return path

# ===========
# PROCESO
# ===========
def run_once(limit=20, kind="premarket", email_list=None):
    db_init()
    items = fetch_feeds(FEEDS, max_items=limit)
    report, sectors, vol = build_report(kind, items)
    path = save_report(kind, report)
    db_log_report(fmt_ct(now_ct()), kind, path, vol, sectors)
    if email_list:
        email_premarket(report, email_list)
    console.print(Panel(report, title=f"Global Catalyst — {kind}"))

# ===========
# FASTAPI PANEL
# ===========
app = FastAPI(title="Global Catalyst Panel")

@app.get("/", response_class=HTMLResponse)
def home():
    with sqlite3.connect(DB_PATH) as con:
        row = con.execute("SELECT ts, kind, path, vol, semis_cnt, energia_cnt, finanzas_cnt FROM reports ORDER BY id DESC LIMIT 1").fetchone()
        if not row:
            return "<h3>Sin reportes aún</h3>"
        ts, kind, path, vol, s,e,f = row
        try:
            content = open(path, "r", encoding="utf-8").read()
        except:
            content = "(No se pudo leer el reporte)"
        return f"""
        <meta name='viewport' content='width=device-width, initial-scale=1'>
        <h2>Global Catalyst — {kind.upper()}</h2>
        <p>{ts} | Vol: <b>{vol.upper()}</b></p>
        <p>Semis:{s} Energía:{e} Finanzas:{f}</p>
        <pre>{content}</pre>
        """

# ===========
# SCHEDULER
# ===========
def schedule_jobs(emails=DEFAULT_EMAILS):
    sched = BlockingScheduler(timezone=TZ)
    def job(kind): return lambda: run_once(kind=kind, email_list=emails)
    sched.add_job(job("premarket"), CronTrigger(hour=SCHED_PRE[0], minute=SCHED_PRE[1]))
    sched.add_job(job("midday"), CronTrigger(hour=SCHED_MID[0], minute=SCHED_MID[1]))
    sched.add_job(job("postclose"), CronTrigger(hour=SCHED_POST[0], minute=SCHED_POST[1]))
    console.print("[green]Scheduler activo: 7:45AM, 12:00PM, 4:30PM CT[/green]")
    sched.start()

# ===========
# CLI
# ===========
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-once", choices=["premarket","midday","postclose"])
    parser.add_argument("--schedule", action="store_true")
    parser.add_argument("--emails", type=str, default="")
    args = parser.parse_args()

    emails = [e.strip() for e in args.emails.split(",") if e.strip()] if args.emails else DEFAULT_EMAILS
    if args.schedule:
        schedule_jobs(emails)
    elif args.run_once:
        run_once(kind=args.run_once, email_list=emails)
    else:
        run_once(kind="premarket", email_list=emails)
