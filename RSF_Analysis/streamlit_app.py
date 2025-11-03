import pandas as pd
import plotly.express as px
import streamlit as st
from datetime import time


@st.cache_data
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


def prepare_aggregates(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, list[str]]:
    weekday_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    df = df.copy()
    df["weekday"] = pd.Categorical(df["Timestamp"].dt.day_name(), categories=weekday_order, ordered=True)
    df["time_str"] = df["Timestamp"].dt.floor("15min").dt.strftime("%H:%M")
    df["minutes"] = (pd.to_timedelta(df["time_str"] + ":00").dt.total_seconds() // 60).astype(int)

    agg = (
        df.groupby(["weekday", "time_str", "minutes"], observed=True)["percent_filled"].mean().rename("avg_fill").reset_index()
    )

    pivot = (
        agg.pivot(index="weekday", columns="time_str", values="avg_fill").loc[weekday_order]
    )

    return agg, pivot, weekday_order


def main() -> None:
    st.set_page_config(page_title="RSF Gym Occupancy", layout="wide")
    st.title("RSF Gym Occupancy Dashboard")

    with st.sidebar:
        st.header("Settings")
        data_path = st.text_input("CSV path", value="scraped_data2.csv")
        filter_open = st.toggle("Filter to open hours", value=True)
        zmax = st.slider("Heatmap upper bound (% filled)", min_value=60, max_value=140, value=120, step=5)

    df = load_data(data_path)
    if filter_open:
        df = df[df["Timestamp"].apply(is_open)].reset_index(drop=True)

    if df.empty:
        st.warning("No data after filtering. Check your CSV path or filters.")
        return

    agg, pivot, weekday_order = prepare_aggregates(df)

    # Heatmap
    st.subheader("Heatmap: Average % filled by weekday and time of day")
    fig_hm = px.imshow(
        pivot.values * 100,
        x=pivot.columns,
        y=pivot.index,
        color_continuous_scale="YlGnBu",
        zmin=0,
        zmax=zmax,
        labels={"color": "% filled"},
        aspect="auto",
    )
    st.plotly_chart(fig_hm, use_container_width=True)

    # Timeline by weekday
    st.subheader("Timeline by weekday")
    sel = st.selectbox("Weekday", weekday_order, index=0)
    line_df = agg[agg["weekday"] == sel]
    fig_ln = px.line(
        line_df,
        x="minutes",
        y="avg_fill",
        labels={"minutes": "Time of day", "avg_fill": "% filled"},
        range_y=[0, zmax / 100.0],
    )
    fig_ln.update_xaxes(
        tickmode="array",
        tickvals=list(range(0, 24 * 60 + 1, 120)),
        ticktext=[f"{h:02d}:00" for h in range(0, 25, 2)],
    )
    fig_ln.update_yaxes(tickformat=".0%")
    st.plotly_chart(fig_ln, use_container_width=True)


if __name__ == "__main__":
    main()


