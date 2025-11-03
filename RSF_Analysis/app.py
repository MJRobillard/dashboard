import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import time

@st.cache_data
def load_data(path="scraped_data2.csv"):
    df = pd.read_csv(path, parse_dates=["Timestamp"])
    df.columns = df.columns.str.strip()
    df["percent_filled"] = pd.to_numeric(df["percent_filled"], errors="coerce")
    return df.dropna(subset=["percent_filled"]).sort_values("Timestamp").reset_index(drop=True)

def is_open(ts):
    wd, t = ts.weekday(), ts.time()  # Mon=0 ... Sun=6
    if wd == 5:   # Saturday
        return time(8, 0) <= t < time(18, 0)
    if wd == 6:   # Sunday
        return time(8, 0) <= t < time(23, 0)
    return time(7, 0) <= t < time(23, 0)  # Weekdays

df = load_data()
if st.toggle("Filter to open hours", value=True):
    df = df[df["Timestamp"].apply(is_open)]

weekday_order = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
df["weekday"] = pd.Categorical(df["Timestamp"].dt.day_name(), categories=weekday_order, ordered=True)
df["time_str"] = df["Timestamp"].dt.floor("15min").dt.strftime("%H:%M")
df["minutes"] = (pd.to_timedelta(df["time_str"] + ":00").dt.total_seconds() // 60).astype(int)

agg = (df.groupby(["weekday","time_str","minutes"], observed=True)["percent_filled"]
         .mean().rename("avg_fill").reset_index())
pivot = agg.pivot(index="weekday", columns="time_str", values="avg_fill").loc[weekday_order]

st.title("RSF Gym Occupancy Dashboard")

st.subheader("Heatmap: Average % filled")
fig_hm = px.imshow(pivot.values * 100, x=pivot.columns, y=pivot.index,
                   color_continuous_scale="YlGnBu", zmin=0, zmax=120,
                   labels={"color":"% filled"})
st.plotly_chart(fig_hm, use_container_width=True)

st.subheader("Timeline by weekday")
sel = st.selectbox("Weekday", weekday_order)
line_df = agg[agg["weekday"] == sel]
fig_ln = px.line(line_df, x="minutes", y="avg_fill",
                 labels={"minutes":"Time of day", "avg_fill":"% filled"},
                 range_y=[0,1.2])
fig_ln.update_xaxes(tickmode="array",
                    tickvals=list(range(0, 24*60+1, 120)),
                    ticktext=[f"{h:02d}:00" for h in range(0,25,2)])
fig_ln.update_yaxes(tickformat=".0%")
st.plotly_chart(fig_ln, use_container_width=True)