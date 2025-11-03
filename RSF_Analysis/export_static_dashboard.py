import pandas as pd
import plotly.express as px
import plotly.io as pio
from datetime import time


def load_data(path: str = "scraped_data2.csv") -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=["Timestamp"])  # expects header: Timestamp, percent_filled
    df.columns = df.columns.str.strip()
    df["percent_filled"] = pd.to_numeric(df["percent_filled"], errors="coerce")
    df = df.dropna(subset=["percent_filled"]).sort_values("Timestamp").reset_index(drop=True)
    return df


def is_open(ts) -> bool:
    wd = ts.weekday()  # Monday=0 ... Sunday=6
    t = ts.time()
    if wd == 5:  # Saturday
        return time(8, 0) <= t < time(18, 0)
    if wd == 6:  # Sunday
        return time(8, 0) <= t < time(23, 0)
    return time(7, 0) <= t < time(23, 0)  # Weekdays


def build_figures(df: pd.DataFrame):
    weekday_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    df = df.copy()
    df["weekday"] = pd.Categorical(df["Timestamp"].dt.day_name(), categories=weekday_order, ordered=True)
    df["time_str"] = df["Timestamp"].dt.floor("15min").dt.strftime("%H:%M")
    df["minutes"] = (pd.to_timedelta(df["time_str"] + ":00").dt.total_seconds() // 60).astype(int)

    agg = (
        df.groupby(["weekday", "time_str", "minutes"], observed=True)["percent_filled"].mean().rename("avg_fill").reset_index()
    )

    cols_sorted = sorted(agg["time_str"].unique(), key=lambda s: pd.to_timedelta(s + ":00"))
    pivot = (
        agg.pivot(index="weekday", columns="time_str", values="avg_fill").loc[weekday_order, cols_sorted]
    )

    fig_hm = px.imshow(
        pivot.values * 100,
        x=pivot.columns,
        y=pivot.index,
        color_continuous_scale="YlGnBu",
        zmin=0,
        zmax=120,
        labels={"color": "% filled"},
        aspect="auto",
        title="Average % filled by weekday and time of day",
    )

    fig_ln = px.line(
        agg,
        x="minutes",
        y="avg_fill",
        color="weekday",
        category_orders={"weekday": weekday_order},
        labels={"minutes": "Time of day", "avg_fill": "% filled"},
        range_y=[0, 1.2],
        title="Timeline by weekday",
    )
    fig_ln.update_xaxes(
        tickmode="array",
        tickvals=list(range(0, 24 * 60 + 1, 120)),
        ticktext=[f"{h:02d}:00" for h in range(0, 25, 2)],
    )
    fig_ln.update_yaxes(tickformat=".0%")

    return fig_hm, fig_ln


def main():
    df = load_data("scraped_data2.csv")
    df = df[df["Timestamp"].apply(is_open)].reset_index(drop=True)

    if df.empty:
        raise SystemExit("No data after filtering open hours.")

    fig_hm, fig_ln = build_figures(df)

    hm_html = pio.to_html(fig_hm, include_plotlyjs="cdn", full_html=False)
    ln_html = pio.to_html(fig_ln, include_plotlyjs=False, full_html=False)

    full_html = f"""
<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>RSF Gym Occupancy Dashboard</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 0; padding: 16px; }}
    h1 {{ margin: 0 0 8px 0; }}
    .section {{ margin-top: 24px; }}
  </style>
  <link rel=\"preconnect\" href=\"https://cdn.plot.ly\" />
  <link rel=\"dns-prefetch\" href=\"https://cdn.plot.ly\" />
  <script>/* Plotly JS will be included with first figure */</script>
  <meta name=\"description\" content=\"Interactive heatmap and timeline of RSF gym occupancy\" />
  <meta name=\"robots\" content=\"noindex\" />
  <meta name=\"color-scheme\" content=\"light dark\" />
  <meta name=\"theme-color\" content=\"#ffffff\" />
  <meta name=\"apple-mobile-web-app-capable\" content=\"yes\" />
  <meta name=\"mobile-web-app-capable\" content=\"yes\" />
  <meta name=\"format-detection\" content=\"telephone=no\" />
  <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />
  <meta name=\"referrer\" content=\"no-referrer\" />
  <meta http-equiv=\"Cache-Control\" content=\"no-cache, no-store, must-revalidate\" />
  <meta http-equiv=\"Pragma\" content=\"no-cache\" />
  <meta http-equiv=\"Expires\" content=\"0\" />
  <meta name=\"generator\" content=\"export_static_dashboard.py\" />
</head>
<body>
  <h1>RSF Gym Occupancy Dashboard</h1>
  <div class=\"section\">
    <h2>Heatmap: Average % filled</h2>
    {hm_html}
  </div>
  <div class=\"section\">
    <h2>Timeline by weekday</h2>
    {ln_html}
  </div>
</body>
</html>
"""

    output_path = "dashboard.html"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(full_html)

    print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()


