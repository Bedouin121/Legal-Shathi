import { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { analyticsAPI } from "@/services/api";

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await analyticsAPI.getSummary();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics", err);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const popularTemplatesData = {
    labels: (analytics?.popularTemplates ?? []).map((t) => t.name),
    datasets: [
      {
        label: "Usage",
        data: (analytics?.popularTemplates ?? []).map((t) => t.count),
        backgroundColor: ["#3f42e4", "#f59e42", "#10b981", "#ef4444"],
      },
    ],
  };

  const apiUsageData = {
    labels: (analytics?.apiUsage ?? []).map((u) => u.date || u.month),
    datasets: [
      {
        label: "API Calls",
        data: (analytics?.apiUsage ?? []).map((u) => u.count),
        fill: true,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin Analytics Dashboard</h1>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go Back
        </button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="h-32 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold">
                {analytics?.totalUsers ?? 0}
              </div>
              <div className="mt-2 text-muted-foreground">Total Users</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold">
                {analytics?.generatedDocuments ?? 0}
              </div>
              <div className="mt-2 text-muted-foreground">
                Generated Documents (approx.)
              </div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold">
                {analytics?.storageUsed ?? 0} GB
              </div>
              <div className="mt-2 text-muted-foreground">Storage Used</div>
            </Card>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="mb-2 font-semibold">Popular Templates</h2>
              <Pie data={popularTemplatesData} />
            </Card>
            <Card className="p-6">
              <h2 className="mb-2 font-semibold">API Usage (Monthly)</h2>
              <Line
                data={apiUsageData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      callbacks: {
                        title: (context) => `Period: ${context[0].label}`,
                        label: (context) => `API Calls: ${context.parsed.y}`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      display: true,
                      title: { display: true, text: 'Month' },
                      grid: { display: false },
                    },
                    y: {
                      display: true,
                      title: { display: true, text: 'Number of API Calls' },
                      beginAtZero: true,
                      ticks: { stepSize: 1 },
                    },
                  },
                }}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
