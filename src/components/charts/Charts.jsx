import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const tooltipStyle = {
  background: "#161a28",
  border: "1px solid #2b3144",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#e7e9ee",
};

const axisStyle = { fill: "#8a90a3", fontSize: 11 };

export function RevenueAreaChart({ data, dataKey = "value", xKey = "label", height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="amberFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5a83c" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#f5a83c" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2433" vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#f5a83c", strokeWidth: 1 }} />
        <Area type="monotone" dataKey={dataKey} stroke="#f5a83c" strokeWidth={2.5} fill="url(#amberFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ComparisonBarChart({ data, bars = [{ key: "value", color: "#f5a83c" }], xKey = "label", height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2433" vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1f2433" }} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: "#8a90a3" }} />}
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} fill={b.color} radius={[6, 6, 0, 0]} maxBarSize={28} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({ data, dataKey = "value", xKey = "label", height = 220, color = "#2db89f" }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2433" vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const PIE_COLORS = ["#f5a83c", "#2db89f", "#2c8fe0", "#e0552c", "#8a90a3"];

export function DonutChart({ data, height = 220, dataKey = "value", nameKey = "name" }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius="62%"
          outerRadius="90%"
          paddingAngle={3}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#8a90a3" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
