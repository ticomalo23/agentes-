# agentes-

Este repositorio incluye un agente automatizado llamado `catalyst_agent.py`.
El script recopila titulares financieros, reportes de ganancias y eventos
económicos para generar un informe y enviarlo por correo electrónico, además de
guardar un registro en SQLite y exponer un panel web con FastAPI.

## Requisitos

1. Python 3.10+.
2. Instalar dependencias:

   ```bash
   pip install -r requirements.txt
   ```

3. Configurar variables de entorno en un archivo `.env`:

   ```ini
   GMAIL_SENDER=tu_correo@gmail.com
   FMP_API_KEY=tu_api_key_de_financial_modeling_prep
   TE_API_KEY=tu_api_key_de_trading_economics
   ```

4. Configurar credenciales de Gmail API (`credentials.json`). La primera vez que
   se ejecute el script se abrirá el flujo de autenticación y se guardará un
   `token.json`.

## Uso rápido

Generar un informe inmediato (por defecto tipo `premarket`) y enviarlo al correo
configurado:

```bash
python catalyst_agent.py
```

Ejecutar un informe específico y enviarlo a una lista de correos separados por
comas:

```bash
python catalyst_agent.py --run-once midday --emails correo1@example.com,correo2@example.com
```

Iniciar el programador que generará informes tres veces al día (7:45, 12:00 y
16:30 hora de Chicago):

```bash
python catalyst_agent.py --schedule
```

## Panel web

Tras ejecutar el script al menos una vez se almacenará el último reporte en la
base `catalyst.db`. El panel web de FastAPI expone la ruta `/` con el último
reporte. Para iniciarlo:

```bash
uvicorn catalyst_agent:app --reload --port 8000
```

## ¿Qué puedes hacer con esto?

- Automatizar el envío diario de reportes de mercado a tu correo.
- Consultar un panel web sencillo con el último informe generado.
- Mantener un historial de reportes en SQLite para futuras consultas.
