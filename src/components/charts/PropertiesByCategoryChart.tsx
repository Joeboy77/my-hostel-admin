import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface PropertiesByCategoryData {
  categoryName: string;
  count: string;
}

interface PropertiesByCategoryChartProps {
  data: PropertiesByCategoryData[];
}

const PropertiesByCategoryChart: React.FC<PropertiesByCategoryChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Dynamic colors based on theme
  const textColor = isDark ? '#E5E7EB' : '#374151';
  const tooltipBg = isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.95)';
  const tooltipBorder = isDark ? '#60A5FA' : '#3B82F6';
  
  const chartData = {
    labels: data.map(item => item.categoryName),
    datasets: [
      {
        data: data.map(item => parseInt(item.count)),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(16, 185, 129, 0.8)',   // Green
          'rgba(245, 158, 11, 0.8)',   // Yellow
          'rgba(239, 68, 68, 0.8)',    // Red
          'rgba(139, 92, 246, 0.8)',   // Purple
          'rgba(6, 182, 212, 0.8)',    // Cyan
          'rgba(249, 115, 22, 0.8)',   // Orange
          'rgba(132, 204, 22, 0.8)',   // Lime
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(6, 182, 212, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(132, 204, 22, 1)',
        ],
        borderWidth: 3,
        hoverOffset: 15,
        borderRadius: 8,
        spacing: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          color: textColor, // Dynamic text color
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: 2,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i,
                  color: textColor, // Ensure text color is visible
                };
              });
            }
            return [];
          },
        },
      },
      title: {
        display: true,
        text: 'Properties Distribution by Category',
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
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
        padding: 12,
        callbacks: {
          title: function(context: any) {
            return `📊 ${context[0].label}`;
          },
          label: function(context: any) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `Properties: ${value} (${percentage}%)`;
          },
          afterLabel: function() {
            return 'Click to see details';
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'xy' as const,
      intersect: false,
    },
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center">
            <span className="text-3xl">📊</span>
          </div>
          <p className="font-medium">No category data available</p>
          <p className="text-sm opacity-75">Categories will appear here once properties are added</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PropertiesByCategoryChart; 