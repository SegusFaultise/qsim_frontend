import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatSimulationData = (result) => {
  if (!result || !result.states) return [];
  return Object.entries(result.states)
    .map(([state, probability]) => ({
      state: `|${state}⟩`,
      probability: parseFloat((probability * 100).toFixed(2)), // Keep as number for charting
    }))
    .sort((a, b) => a.state.localeCompare(b.state));
};

function SimulationResults({ simulationResult }) {
  if (!simulationResult) return null;

  const chartData = formatSimulationData(simulationResult);

  // Custom Tooltip for better theme integration
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="recharts-custom-tooltip">
          <p className="recharts-custom-tooltip__label">{`${label}`}</p>
          <p className="recharts-custom-tooltip__intro">{`Probability: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="simulation-results">
      <h3 className="simulation-results__title">Measurement Outcomes</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid stroke="var(--border-color-translucent)" />
            <XAxis dataKey="state" stroke="var(--text-secondary)" />
            <YAxis unit="%" stroke="var(--text-secondary)" />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "var(--accent-primary-translucent)" }}
            />
            <Bar
              dataKey="probability"
              name="Probability"
              fill="var(--accent-primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-muted mt-4">
          No measurement outcomes to display.
        </p>
      )}
    </div>
  );
}

export default SimulationResults;
