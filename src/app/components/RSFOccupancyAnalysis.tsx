'use client'

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false 
}) as any;

interface ProcessedData {
  heatmap: {
    weekdays: string[];
    times: string[];
    values: number[][];
  };
  timeline: Array<{
    weekday: string;
    time_str: string;
    minutes: number;
    avg_fill: number;
  }>;
}

export const RSFOccupancyAnalysis: React.FC = () => {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeekday, setSelectedWeekday] = useState('Monday');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [heatmapZMax, setHeatmapZMax] = useState(120);
  const [isMobile, setIsMobile] = useState(false);

  const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/rsf-occupancy');
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch data');
        }

        setData(result.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching RSF occupancy data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load occupancy data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-300 mb-4"></div>
          <p className="text-white/75">Loading occupancy data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-red-300/30 shadow-[inset_0_0_15px_rgba(239,68,68,0.05),0_0_25px_rgba(239,68,68,0.1)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="relative z-10 text-center py-8">
          <p className="text-red-300 font-semibold mb-2">Error loading data</p>
          <p className="text-white/75 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Prepare heatmap data
  const heatmapColorscale = 'Cividis' as const; // Plotly built-in
  

  const heatmapData = [{
    z: data.heatmap.values,
    x: data.heatmap.times,
    y: data.heatmap.weekdays,
    type: 'heatmap' as const,
    colorscale: heatmapColorscale,
    zmin: 0,
    zmax: heatmapZMax,
    hovertemplate: 'Weekday: %{y}<br>Time: %{x}<br>% Filled: %{z:.1f}%<extra></extra>',
    showscale: true,
    colorbar: {
      title: '% filled',
      titlefont: { color: '#FDB515' },
      tickfont: { color: '#FFFFFF' }
    }
  }];

  const heatmapLayout = {
    title: {
      text: isMobile ? '% Filled by Day & Time' : 'Average % Filled by Weekday and Time',
      font: { color: '#FDB515', size: isMobile ? 12 : 16 },
      x: 0.5,
      xanchor: 'center'
    },
    margin: isMobile ? { l: 70, r: 10, t: 40, b: 70 } : { l: 80, r: 20, t: 70, b: 100 },
    xaxis: {
      title: { text: 'Time of Day', font: { color: '#FDB515', size: isMobile ? 11 : 12 } },
      tickfont: { color: '#FFFFFF', size: isMobile ? 10 : 12 },
      gridcolor: 'rgba(255, 255, 255, 0.1)',
      // Show fewer ticks on mobile for readability
      tickmode: 'array' as const,
      tickvals: (() => {
        if (!data) return [];
        const times = data.heatmap.times;
        if (isMobile) {
          // Every 3 hours on mobile: 7, 10, 13, 16, 19, 22
          return times.filter(time => {
            const hour = parseInt(time.split(':')[0]);
            return [7, 10, 13, 16, 19, 22].includes(hour) && time.endsWith(':00');
          });
        } else {
          // Every 2 hours on desktop: 7, 9, 11, 13, 15, 17, 19, 21
          return times.filter(time => {
            const hour = parseInt(time.split(':')[0]);
            return [7, 9, 11, 13, 15, 17, 19, 21].includes(hour) && time.endsWith(':00');
          });
        }
      })(),
      ticktext: (() => {
        if (!data) return [];
        const times = data.heatmap.times;
        if (isMobile) {
          return times.filter(time => {
            const hour = parseInt(time.split(':')[0]);
            return [7, 10, 13, 16, 19, 22].includes(hour) && time.endsWith(':00');
          });
        } else {
          return times.filter(time => {
            const hour = parseInt(time.split(':')[0]);
            return [7, 9, 11, 13, 15, 17, 19, 21].includes(hour) && time.endsWith(':00');
          });
        }
      })(),
      tickangle: isMobile ? -45 : -35,
      ticklen: 6,
      tickwidth: 1.5,
      showgrid: true,
      gridwidth: 1,
      tickcolor: '#FDB515',
      titlepad: { t: 15, b: 20 },
      automargin: true
    },
    yaxis: {
      title: { text: 'Weekday', font: { color: '#FDB515', size: isMobile ? 11 : 12 } },
      tickfont: { color: '#FFFFFF', size: isMobile ? 10 : 11 },
      autorange: 'reversed' as const,
      ticklen: 4,
      tickwidth: 1,
      tickcolor: '#FDB515'
    },
    plot_bgcolor: 'rgba(0, 0, 0, 0)',
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    font: { family: 'Inter, sans-serif' },
    colorbar: {
      x: isMobile ? 1.02 : 1.05,
      len: 0.6,
      thickness: isMobile ? 12 : 15,
      title: {
        text: '% filled',
        font: { color: '#FDB515', size: isMobile ? 10 : 11 }
      },
      tickfont: { color: '#FFFFFF', size: isMobile ? 9 : 10 }
    }
  };

  // Prepare timeline data for selected weekday
  const selectedTimelineData = data.timeline.filter(row => row.weekday === selectedWeekday);
  
  const timelineData = weekdayOrder.map(weekday => {
    const dayData = data.timeline.filter(row => row.weekday === weekday);
    return {
      x: dayData.map(d => d.minutes),
      y: dayData.map(d => d.avg_fill * 100),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: weekday,
      line: { width: 2 },
      visible: weekday === selectedWeekday ? true : 'legendonly' as const,
      hovertemplate: `${weekday}<br>Time: %{x}<br>% Filled: %{y:.1f}%<extra></extra>`
    };
  });

  const timelineLayout = {
    title: {
      text: isMobile ? `${selectedWeekday} Timeline` : `Average Occupancy Timeline - ${selectedWeekday}`,
      font: { color: '#FDB515', size: isMobile ? 12 : 16 },
      x: 0.5,
      xanchor: 'center'
    },
    margin: isMobile ? { l: 60, r: 10, t: 40, b: 70 } : { l: 70, r: 20, t: 70, b: 100 },
    xaxis: {
      title: { text: 'Time of Day', font: { color: '#FDB515', size: isMobile ? 11 : 12 } },
      tickmode: 'array' as const,
      tickvals: isMobile 
        ? Array.from({ length: 6 }, (_, i) => (7 + i * 3) * 60).filter(m => m <= 22 * 60) // Every 3 hours starting at 7 AM
        : Array.from({ length: 13 }, (_, i) => i * 120), // Every 2 hours
      ticktext: isMobile
        ? Array.from({ length: 6 }, (_, i) => {
            const hour = 7 + i * 3;
            return hour <= 22 ? `${hour}:00` : '';
          }).filter(Boolean)
        : Array.from({ length: 13 }, (_, i) => `${String(i * 2).padStart(2, '0')}:00`),
      tickfont: { color: '#FFFFFF', size: isMobile ? 11 : 12 },
      gridcolor: 'rgba(255, 255, 255, 0.1)',
      tickangle: isMobile ? -45 : -35,
      ticklen: 6,
      tickwidth: 1.5,
      showgrid: true,
      gridwidth: 1,
      tickcolor: '#FDB515',
      titlepad: { t: 15, b: 20 },
      automargin: true
    },
    yaxis: {
      title: { text: '% Filled', font: { color: '#FDB515', size: isMobile ? 11 : 12 } },
      range: [0, heatmapZMax],
      tickformat: 'd',
      tickfont: { color: '#FFFFFF', size: isMobile ? 10 : 11 },
      gridcolor: 'rgba(255, 255, 255, 0.1)',
      ticklen: 4,
      tickwidth: 1,
      tickcolor: '#FDB515'
    },
    plot_bgcolor: 'rgba(0, 0, 0, 0)',
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    font: { family: 'Inter, sans-serif' },
    legend: {
      font: { color: '#FDB515', size: isMobile ? 9 : 11 },
      bgcolor: 'rgba(0, 0, 0, 0.5)',
      x: isMobile ? 0 : 1.02,
      y: isMobile ? -0.2 : 1,
      orientation: isMobile ? 'h' : 'v'
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-4 md:p-6 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        {/* Header - Stack on mobile, side-by-side on desktop */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-3">
          <div className="flex-1">
            <h3 className="text-yellow-300 text-lg md:text-xl font-bold mb-1 md:mb-2">
              {isMobile ? 'RSF Occupancy' : 'RSF Gym Occupancy Analysis'}
            </h3>
            <p className="text-white/75 text-xs md:text-sm">
              {isMobile ? 'Historical patterns' : 'Historical occupancy patterns by weekday and time'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="p-2 bg-yellow-300/10 hover:bg-yellow-300/20 rounded-lg text-yellow-300 transition-colors"
              title={showHeatmap ? 'Hide heatmap' : 'Show heatmap'}
            >
              {showHeatmap ? <EyeIcon className="w-4 h-4 md:w-5 md:h-5" /> : <EyeSlashIcon className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
          </div>
        </div>

        {/* Controls - Stack on mobile */}
        <div className="mb-4 flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-4 items-stretch md:items-center">
          <div className="flex items-center gap-2">
            <label className="text-white/75 text-xs md:text-sm whitespace-nowrap">Max %:</label>
            <input
              type="number"
              min="60"
              max="200"
              step="5"
              value={heatmapZMax}
              onChange={(e) => setHeatmapZMax(Number(e.target.value))}
              className="w-20 px-2 py-1 bg-blue-900/50 border border-yellow-300/30 rounded text-xs md:text-sm text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-white/75 text-xs md:text-sm whitespace-nowrap">Weekday:</label>
            <select
              value={selectedWeekday}
              onChange={(e) => setSelectedWeekday(e.target.value)}
              className="flex-1 md:flex-none px-2 md:px-3 py-1 bg-blue-900/50 border border-yellow-300/30 rounded text-xs md:text-sm text-white focus:outline-none focus:border-yellow-300"
            >
              {weekdayOrder.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Heatmap - Horizontal scroll on mobile for better readability */}
        {showHeatmap && (
          <div className="mb-4 md:mb-6 overflow-x-auto">
            <div className={`${isMobile ? 'h-[300px] min-w-[600px]' : 'h-[400px]'} w-full`}>
              <Plot
                data={heatmapData}
                layout={heatmapLayout}
                config={{ 
                  displayModeBar: false,
                  responsive: true,
                  scrollZoom: false,
                  doubleClick: false
                }}
                style={{ width: '100%', height: '100%', minWidth: isMobile ? '600px' : 'auto' }}
                useResizeHandler={true}
              />
            </div>
          </div>
        )}

        {/* Timeline - Horizontal scroll on mobile */}
        {showTimeline && (
          <div className={`${isMobile ? 'h-[300px] overflow-x-auto' : 'h-[400px]'} w-full`}>
            <Plot
              data={timelineData}
              layout={timelineLayout}
              config={{ 
                displayModeBar: false,
                responsive: true,
                scrollZoom: false,
                doubleClick: false
              }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

