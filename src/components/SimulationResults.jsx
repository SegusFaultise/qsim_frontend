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
      probability: (probability * 100).toFixed(2),
    }))
    .sort((a, b) => a.state.localeCompare(b.state));
};

function SimulationResults({ simulationResult }) {
  if (!simulationResult) return null;

  const chartData = formatSimulationData(simulationResult);

  return (
    <div className="simulation-results">
      <h3>Simulation Results</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="state" />
            <YAxis
              unit="%"
              label={{
                value: "Probability",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(128, 128, 128, 0.1)" }}
              contentStyle={{
                backgroundColor: "var(--background-color)",
                borderColor: "var(--border-color)",
              }}
            />
            <Legend />
            <Bar
              dataKey="probability"
              name="Probability (%)"
              fill="var(--accent-primary)"
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>No measurement outcomes to display.</p>
      )}
    </div>
  );
}

export default SimulationResults;
