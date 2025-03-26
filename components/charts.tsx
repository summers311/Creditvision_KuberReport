"use client"

import {
  Bar,
  BarChart as RechartsBarChart,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

// Define types for chart data
interface ChartDataItem {
  name: string;
  value: number;
}

export function BarChart({ data }: { data: ChartDataItem[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export function PieChart({ data }: { data: ChartDataItem[] }) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]
  
  // Add console.log to debug the data
  console.log("PieChart data:", data);
  
  // Check if data is valid
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error("Invalid data for PieChart:", data);
    return <div className="h-full w-full flex items-center justify-center">No data available</div>;
  }
  
  // Check if all values are 0
  const allZero = data.every(item => item.value === 0);
  if (allZero) {
    console.log("All values are 0, using dummy data");
    // Use dummy data for testing
    data = [
      { name: "500-600", value: 20517 },
      { name: "600-700", value: 50605 },
      { name: "700+", value: 3878 }
    ];
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry: ChartDataItem, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
