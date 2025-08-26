import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title
);

interface SystemMetricsData {
  users: number;
  properties: number;
  categories: number;
  likes: number;
  notifications: number;
}

interface SystemMetricsRadarChartProps {
  data: SystemMetricsData;
}

const SystemMetricsRadarChart: React.FC<SystemMetricsRadarChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Dynamic colors based on theme
  const textColor = isDark ? '#E5E7EB' : '#374151';
  const gridColor = isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.2)';
  const angleLineColor = isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)';
  const tooltipBg = isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.95)';
  const tooltipBorder = isDark ? '#60A5FA' : '#3B82F6';
  
  // Normalize data to 0-100 scale for better visualization
  const maxValues = {
    users: Math.max(data.users, 10),
    properties: Math.max(data.properties, 10),
    categories: Math.max(data.categories, 5),
    likes: Math.max(data.likes, 10),
    notifications: Math.max(data.notifications, 10),
  };

  const normalizedData = {
    users: (data.users / maxValues.users) * 100,
    properties: (data.properties / maxValues.properties) * 100,
    categories: (data.categories / maxValues.categories) * 100,
    likes: (data.likes / maxValues.likes) * 100,
    notifications: (data.notifications / maxValues.notifications) * 100,
  };

  const chartData = {
    labels: ['👥 Users', '🏠 Properties', '🏷️ Categories', '❤️ Likes', '🔔 Notifications'],
    datasets: [
      {
        label: 'System Metrics',
        data: [
          normalizedData.users,
          normalizedData.properties,
          normalizedData.categories,
          normalizedData.likes,
          normalizedData.notifications,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 0.8)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: isDark ? '#1F2937' : '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointHoverBackgroundColor: '#2563EB',
        pointHoverBorderColor: isDark ? '#1F2937' : '#ffffff',
        pointHoverBorderWidth: 4,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeOutQuart' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '📊 System Health Overview',
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
            return `📊 ${context[0].label}`;
          },
          label: function(context: any) {
            const label = context.label;
            const value = context.parsed.r;
            const percentage = Math.round(value);
            
            // Map back to actual values
            let actualValue = 0;
            switch (label) {
              case '👥 Users':
                actualValue = Math.round((value / 100) * maxValues.users);
                return `Users: ${actualValue} (${percentage}%)`;
              case '🏠 Properties':
                actualValue = Math.round((value / 100) * maxValues.properties);
                return `Properties: ${actualValue} (${percentage}%)`;
              case '🏷️ Categories':
                actualValue = Math.round((value / 100) * maxValues.categories);
                return `Categories: ${actualValue} (${percentage}%)`;
              case '❤️ Likes':
                actualValue = Math.round((value / 100) * maxValues.likes);
                return `Likes: ${actualValue} (${percentage}%)`;
              case '🔔 Notifications':
                actualValue = Math.round((value / 100) * maxValues.notifications);
                return `Notifications: ${actualValue} (${percentage}%)`;
              default:
                return `${label}: ${percentage}%`;
            }
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          color: textColor, // Dynamic tick color
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          callback: function(value: any) {
            return `${value}%`;
          },
        },
        grid: {
          color: gridColor, // Dynamic grid color
          lineWidth: 1,
        },
        pointLabels: {
          color: textColor, // Dynamic point label color
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          padding: 20,
        },
        angleLines: {
          color: angleLineColor, // Dynamic angle line color
          lineWidth: 1,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'r' as const,
      intersect: false,
    },
  };

  return (
    <div className="h-64 relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <Radar data={chartData} options={options} />
    </div>
  );
};

export default SystemMetricsRadarChart; 