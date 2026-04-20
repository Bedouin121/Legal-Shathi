import { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
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
} from 'chart.js';

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

import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '@/services/api';
import { Loader2, AlertCircle } from 'lucide-react';

const CATEGORY_COLORS = ['#3f42e4', '#f59e42', '#10b981', '#ef4444', '#8b5cf6'];

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    analyticsAPI
      .get()
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const categoryChartData = {
    labels: data.templatesByCategory.map((c) => c._id),
    datasets: [
      {
        label: 'Templates',
        data: data.templatesByCategory.map((c) => c.count),
        backgroundColor: CATEGORY_COLORS,
      },
    ],
  };

  const popularTemplatesData = {
    labels: data.popularTemplates.map((t) => t.name),
    datasets: [
      {
        label: 'Favorites',
        data: data.popularTemplates.map((t) => t.count),
        backgroundColor: CATEGORY_COLORS,
      },
    ],
  };

  const userGrowthData = {
    labels: data.usersByMonth.map((u) => u.month),
    datasets: [
      {
        label: 'New Users',
        data: data.usersByMonth.map((u) => u.count),
        fill: false,
        borderColor: '#6366f1',
        backgroundColor: '#6366f1',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin Analytics Dashboard</h1>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go Back
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold">{data.totalUsers}</div>
          <div className="text-muted-foreground mt-2">Total Users</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold">{data.totalTemplates}</div>
          <div className="text-muted-foreground mt-2">Total Templates</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Templates by Category</h2>
          {data.templatesByCategory.length > 0 ? (
            <Pie data={categoryChartData} />
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Most Favorited Templates</h2>
          {data.popularTemplates.length > 0 ? (
            <Bar data={popularTemplatesData} />
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">No favorites yet</p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">User Registrations (Monthly)</h2>
        {data.usersByMonth.length > 0 ? (
          <Line data={userGrowthData} />
        ) : (
          <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
