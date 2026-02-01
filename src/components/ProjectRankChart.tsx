'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface Project {
  id: string;
  name: string;
  owner: string;
  department: string;
  team: string;
  milestones: Array<{
    id: string;
    name: string;
    completed: boolean;
  }>;
  userId: string;
}

interface ProjectRankChartProps {
  projects: Project[];
  isEditing: boolean;
}

const ProjectRankChart: React.FC<ProjectRankChartProps> = ({ projects, isEditing }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Dispose of existing chart instance if any
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    // Initialize the chart
    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    // Process data to calculate progress percentages
    const processedData = projects.map(project => {
      const completedCount = project.milestones.filter(m => m.completed).length;
      const totalCount = project.milestones.length;
      const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      return {
        name: project.name,
        value: progress,
        project: project
      };
    });

    // Sort by progress descending
    processedData.sort((a, b) => b.value - a.value);

    // Prepare chart options
    const option = {
      title: {
        text: '个人项目进度排名',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const param = params[0];
          const project = param.data.project;
          const completed = project.milestones.filter((m: any) => m.completed).length;
          const total = project.milestones.length;
          return `${param.name}<br/>${param.marker} 进度: ${param.value}% (${completed}/${total})`;
        }
      },
      xAxis: {
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      yAxis: {
        type: 'category',
        data: processedData.map(item => item.name),
        inverse: true, // Reverse to show highest at top
        axisLabel: {
          fontSize: 12
        }
      },
      series: [{
        data: processedData.map(item => ({
          value: item.value,
          name: item.name,
          project: item.project
        })),
        type: 'bar',
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%'
        }
      }],
      grid: {
        left: '10%',
        right: '10%',
        bottom: '5%',
        top: '15%'
      },
      animationDuration: 1000
    };

    // Set the option
    chart.setOption(option);

    // Handle window resize
    const handleResize = () => {
      if (chartRef.current) {
        chart.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart) {
        chart.dispose();
      }
    };
  }, [projects, isEditing]);

  return (
    <div 
      ref={chartRef} 
      style={{ 
        width: '100%', 
        height: `${Math.max(400, projects.length * 40)}px`,
        margin: '20px 0'
      }} 
    />
  );
};

export default ProjectRankChart;