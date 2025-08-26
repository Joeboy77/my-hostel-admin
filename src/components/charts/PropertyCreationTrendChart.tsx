import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PropertyCreationTrendData {
  date: string;
  count: string;
}

interface PropertyCreationTrendChartProps {
  data: PropertyCreationTrendData[];
}

const PropertyCreationTrendChart: React.FC<PropertyCreationTrendChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Dynamic colors based on theme
  const textColor = isDark ? '#E5E7EB' : '#374151';
  const gridColor = isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.1)';
  const borderColor = isDark ? 'rgba(107, 114, 128, 0.4)' : 'rgba(107, 114, 128, 0.2)';
  const tooltipBg = isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.95)';
  const tooltipBorder = isDark ? '#10B981' : '#10B981';
  
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'New Properties',
        data: data.map(item => parseInt(item.count)),
        backgroundColor: (context: any) => {
          const value = context.parsed.y;
          const maxValue = Math.max(...data.map(item => parseInt(item.count)));
          const ratio = value / maxValue;
          
          // Create gradient based on value
          if (ratio > 0.8) {
            return 'rgba(16, 185, 129, 0.9)'; // Bright green for high values
          } else if (ratio > 0.5) {
            return 'rgba(16, 185, 129, 0.7)'; // Medium green
          } else if (ratio > 0.2) {
            return 'rgba(16, 185, 129, 0.5)'; // Light green
          } else {
            return 'rgba(16, 185, 129, 0.3)'; // Very light green
          }
        },
        borderColor: (context: any) => {
          const value = context.parsed.y;
          const maxValue = Math.max(...data.map(item => parseInt(item.count)));
          const ratio = value / maxValue;
          
          if (ratio > 0.8) {
            return '#059669'; // Dark green for high values
          } else if (ratio > 0.5) {
            return '#10B981'; // Medium green
          } else if (ratio > 0.2) {
            return '#34D399'; // Light green
          } else {
            return '#6EE7B7'; // Very light green
          }
        },
        borderWidth: 3,
        borderRadius: {
          topLeft: 8,
          topRight: 8,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
        hoverBorderColor: '#047857',
        hoverBorderWidth: 4,
        barThickness: 'flex' as const,
        maxBarThickness: 50,
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
          ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.05)';
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
        text: '🏠 Property Creation Trend (Last 30 Days)',
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
            return `🏠 New Properties: ${context.parsed.y}`;
          },
          afterLabel: function(context: any) {
            const index = context.dataIndex;
            if (index > 0) {
              const prevValue = context.dataset.data[index - 1];
              const currentValue = context.parsed.y;
              const change = currentValue - prevValue;
              const changeText = change > 0 ? `+${change}` : change.toString();
              const changeEmoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
              return `${changeEmoji} Change: ${changeText}`;
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
      bar: {
        hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
        hoverBorderColor: '#047857',
        hoverBorderWidth: 4,
      },
    },
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 flex items-center justify-center">
            <span className="text-3xl">🏠</span>
          </div>
          <p className="font-medium">No property creation data available</p>
          <p className="text-sm opacity-75">Property creation trends will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default PropertyCreationTrendChart; 