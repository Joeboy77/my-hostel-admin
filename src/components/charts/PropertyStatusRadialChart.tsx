import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface PropertyStatusData {
  active: number;
  inactive: number;
  maintenance: number;
  booked: number;
}

interface PropertyStatusRadialChartProps {
  data: PropertyStatusData;
}

const PropertyStatusRadialChart: React.FC<PropertyStatusRadialChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Dynamic colors based on theme
  const textColor = isDark ? '#E5E7EB' : '#374151';
  const tooltipBg = isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.95)';
  const tooltipBorder = isDark ? '#60A5FA' : '#3B82F6';
  
  const chartData = {
    labels: ['✅ Active', '⏸️ Inactive', '🔧 Maintenance', '📅 Booked'],
    datasets: [
      {
        data: [data.active, data.inactive, data.maintenance, data.booked],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',   // Green for active
          'rgba(107, 114, 128, 0.8)',   // Gray for inactive
          'rgba(245, 158, 11, 0.8)',    // Yellow for maintenance
          'rgba(59, 130, 246, 0.8)',    // Blue for booked
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(107, 114, 128, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 3,
        hoverOffset: 15,
        borderRadius: 8,
        spacing: 2,
        cutout: '65%',
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
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                
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
        text: '🏠 Property Status Distribution',
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
        displayColors: true,
        padding: 16,
        callbacks: {
          title: function(context: any) {
            return `🏠 ${context[0].label}`;
          },
          label: function(context: any) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
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

  const total = data.active + data.inactive + data.maintenance + data.booked;

  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center">
            <span className="text-3xl">🏠</span>
          </div>
          <p className="font-medium">No property status data available</p>
          <p className="text-sm opacity-75">Property statuses will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <Doughnut data={chartData} options={options} />
      
      {/* Center text overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
      </div>
    </div>
  );
};

export default PropertyStatusRadialChart; 