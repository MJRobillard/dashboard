import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

interface OccupancyData {
  timestamp: string;
  percent_filled: number;
}

interface AggregatedData {
  weekday: string;
  time_str: string;
  minutes: number;
  avg_fill: number;
}

interface ProcessedData {
  heatmap: {
    weekdays: string[];
    times: string[];
    values: number[][];
  };
  timeline: AggregatedData[];
}

function isOpen(timestamp: Date): boolean {
  const wd = timestamp.getDay(); // 0 = Sunday, 6 = Saturday
  const t = timestamp.getHours() * 60 + timestamp.getMinutes(); // minutes since midnight
  
  if (wd === 6) { // Saturday
    return t >= 8 * 60 && t < 18 * 60;
  }
  if (wd === 0) { // Sunday
    return t >= 8 * 60 && t < 23 * 60;
  }
  return t >= 7 * 60 && t < 23 * 60; // Weekdays
}

function processData(data: OccupancyData[]): ProcessedData {
  const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Parse dates and filter to open hours
  const parsedData = data
    .map(row => {
      const timestamp = new Date(row.timestamp);
      return {
        timestamp,
        percent_filled: row.percent_filled,
        weekday: timestamp.toLocaleDateString('en-US', { weekday: 'long' }),
        time_str: `${String(timestamp.getHours()).padStart(2, '0')}:${String(Math.floor(timestamp.getMinutes() / 15) * 15).padStart(2, '0')}`,
        minutes: timestamp.getHours() * 60 + timestamp.getMinutes()
      };
    })
    .filter(row => isOpen(row.timestamp))
    .filter(row => !isNaN(row.percent_filled));

  // Aggregate by weekday and 15-minute intervals
  const aggMap = new Map<string, { sum: number; count: number }>();
  
  parsedData.forEach(row => {
    const key = `${row.weekday}|${row.time_str}|${row.minutes}`;
    const existing = aggMap.get(key) || { sum: 0, count: 0 };
    aggMap.set(key, {
      sum: existing.sum + row.percent_filled,
      count: existing.count + 1
    });
  });

  // Convert to array format
  const aggregated: AggregatedData[] = Array.from(aggMap.entries()).map(([key, value]) => {
    const [weekday, time_str, minutes] = key.split('|');
    return {
      weekday,
      time_str,
      minutes: parseInt(minutes),
      avg_fill: value.sum / value.count
    };
  });

  // Create pivot table for heatmap
  const timesSet = new Set<string>();
  const weekdayDataMap = new Map<string, Map<string, number>>();
  
  weekdayOrder.forEach(day => weekdayDataMap.set(day, new Map()));
  
  aggregated.forEach(row => {
    timesSet.add(row.time_str);
    const dayMap = weekdayDataMap.get(row.weekday);
    if (dayMap) {
      dayMap.set(row.time_str, row.avg_fill);
    }
  });

  // Sort times
  const sortedTimes = Array.from(timesSet).sort((a, b) => {
    const [h1, m1] = a.split(':').map(Number);
    const [h2, m2] = b.split(':').map(Number);
    return h1 * 60 + m1 - (h2 * 60 + m2);
  });

  // Build heatmap values
  const heatmapValues = weekdayOrder.map(weekday => {
    const dayMap = weekdayDataMap.get(weekday) || new Map();
    return sortedTimes.map(time => (dayMap.get(time) || 0) * 100);
  });

  return {
    heatmap: {
      weekdays: weekdayOrder,
      times: sortedTimes,
      values: heatmapValues
    },
    timeline: aggregated.sort((a, b) => {
      const weekdayOrderA = weekdayOrder.indexOf(a.weekday);
      const weekdayOrderB = weekdayOrder.indexOf(b.weekday);
      if (weekdayOrderA !== weekdayOrderB) {
        return weekdayOrderA - weekdayOrderB;
      }
      return a.minutes - b.minutes;
    })
  };
}

export async function GET(request: NextRequest) {
  try {
    const csvPath = path.join(process.cwd(), 'RSF_Analysis', 'scraped_data2.csv');
    
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json(
        { error: 'CSV file not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as any[];

    const occupancyData: OccupancyData[] = records
      .map(row => {
        // Handle both ' percent_filled' (with space) and 'percent_filled' formats
        const percentFilledStr = row[' percent_filled']?.trim() || row.percent_filled?.trim() || '0';
        const timestampStr = row.Timestamp?.trim() || row['Timestamp']?.trim() || row.timestamp?.trim();
        
        return {
          timestamp: timestampStr,
          percent_filled: parseFloat(percentFilledStr)
        };
      })
      .filter(row => !isNaN(row.percent_filled) && row.timestamp && row.timestamp.length > 0);

    if (occupancyData.length === 0) {
      return NextResponse.json(
        { error: 'No valid data found in CSV' },
        { status: 400 }
      );
    }

    const processedData = processData(occupancyData);

    return NextResponse.json({
      success: true,
      data: processedData
    });
  } catch (error) {
    console.error('Error processing RSF occupancy data:', error);
    return NextResponse.json(
      { error: 'Failed to process occupancy data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

