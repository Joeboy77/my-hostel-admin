import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UserRegistrationTrendData {
  date: string;
  count: string;
}

interface UserRegistrationTrendChartProps {
  data: UserRegistrationTrendData[];
}

const UserRegistrationTrendChart: React.FC<UserRegistrationTrendChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Dynamic colors based on theme
  const textColor = isDark ? '#E5E7EB' : '#374151';
  const gridColor = isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.1)';
  const borderColor = isDark ? 'rgba(107, 114, 128, 0.4)' : 'rgba(107, 114, 128, 0.2)';
  const tooltipBg = isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.95)';
  const tooltipBorder = isDark ? '#60A5FA' : '#3B82F6';
  
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'New Users',
        data: data.map(item => parseInt(item.count)),
        borderColor: '#3B82F6',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
          gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.6)');
          return gradient;
        },
        borderWidth: 4,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: isDark ? '#1F2937' : '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointHoverBackgroundColor: '#2563EB',
        pointHoverBorderColor: isDark ? '#1F2937' : '#ffffff',
        pointHoverBorderWidth: 4,
        pointStyle: 'circle',
        segment: {
          borderColor: (ctx: any) => {
            if (ctx.p1.parsed.y > ctx.p0.parsed.y) {
              return '#10B981'; // Green for increasing
            } else if (ctx.p1.parsed.y < ctx.p0.parsed.y) {
              return '#EF4444'; // Red for decreasing
            }
            return '#3B82F6'; // Blue for same
          },
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeOutQuart' as const,
      onProgress: (animation: any) => {
        const chart = animation.chart;
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        
        if (chartArea) {
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.05)';
          ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
          ctx.restore();
        }
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '🚀 User Registration Trend (Last 30 Days)',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: {
          top: 15,
          bottom: 25,
        },
        color: textColor, // Dynamic title color
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: tooltipBorder,
        borderWidth: 3,
        cornerRadius: 16,
        displayColors: false,
        padding: 16,
        callbacks: {
          title: function(context: any) {
            return `📅 ${context[0].label}`;
          },
          label: function(context: any) {
            return `👥 New Users: ${context.parsed.y}`;
          },
          afterLabel: function(context: any) {
            const index = context.dataIndex;
            if (index > 0) {
              const prevValue = context.dataset.data[index - 1];
              const currentValue = context.parsed.y;
              const change = currentValue - prevValue;
              const changeText = change > 0 ? `+${change}` : change.toString();
              const changeColor = change > 0 ? '#10B981' : change < 0 ? '#EF4444' : '#6B7280';
              return `📈 Change: ${changeText}`;
            }
            return '🎯 First data point';
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor, // Dynamic tick color
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          maxRotation: 45,
        },
        border: {
          color: borderColor, // Dynamic border color
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor, // Dynamic grid color
          lineWidth: 1,
          drawBorder: false,
        },
        ticks: {
          color: textColor, // Dynamic tick color
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          stepSize: 1,
          padding: 8,
        },
        border: {
          color: borderColor, // Dynamic border color
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'xy' as const,
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 12,
        hitRadius: 10,
      },
    },
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center">
            <span className="text-3xl">📈</span>
          </div>
          <p className="font-medium">No registration data available</p>
          <p className="text-sm opacity-75">User registration trends will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <Line data={chartData} options={options} />
    </div>
  );
};

export default UserRegistrationTrendChart; 