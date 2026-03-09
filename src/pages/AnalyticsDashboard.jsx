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

// Register Chart.js components
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

// Hardcoded analytics data
const analyticsData = {
  totalUsers: 1200,
  generatedDocuments: 3400,
  popularTemplates: [
    { name: 'Business Contract', count: 800 },
    { name: 'Personal Will', count: 600 },
    { name: 'Property Lease', count: 500 },
    { name: 'Employment Offer', count: 400 },
  ],
  apiUsage: [
    { month: 'Jan', count: 200 },
    { month: 'Feb', count: 300 },
    { month: 'Mar', count: 400 },
    { month: 'Apr', count: 350 },
    { month: 'May', count: 500 },
  ],
  storageUsed: 2.5, // in GB
};

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  // Chart data
  const popularTemplatesData = {
    labels: analyticsData.popularTemplates.map(t => t.name),
    datasets: [
      {
        label: 'Usage',
        data: analyticsData.popularTemplates.map(t => t.count),
        backgroundColor: [
          '#3f42e4', '#f59e42', '#10b981', '#ef4444'
        ],
      },
    ],
  };

  const apiUsageData = {
    labels: analyticsData.apiUsage.map(u => u.month),
    datasets: [
      {
        label: 'API Calls',
        data: analyticsData.apiUsage.map(u => u.count),
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
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go Back
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold">{analyticsData.totalUsers}</div>
          <div className="text-muted-foreground mt-2">Total Users</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold">{analyticsData.generatedDocuments}</div>
          <div className="text-muted-foreground mt-2">Generated Documents</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold">{analyticsData.storageUsed} GB</div>
          <div className="text-muted-foreground mt-2">Storage Used</div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold mb-2">Popular Templates</h2>
          <Pie data={popularTemplatesData} />
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold mb-2">API Usage (Monthly)</h2>
          <Line data={apiUsageData} />
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
