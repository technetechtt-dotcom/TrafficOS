import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip } from
'recharts';
const data = [
{
  name: 'Pending',
  value: 5,
  color: '#f59e0b'
},
{
  name: 'Paid',
  value: 2,
  color: '#10b981'
},
{
  name: 'Disputed',
  value: 3,
  color: '#3b82f6'
}];

export function FinesByStatusChart() {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="h-64 w-full relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {total}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Total Fines
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none">
            
            {data.map((entry, index) =>
            <Cell key={`cell-${index}`} fill={entry.color} />
            )}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            itemStyle={{
              color: '#1f2937',
              fontWeight: 500
            }} />
          
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: '12px'
            }} />
          
        </PieChart>
      </ResponsiveContainer>
    </div>);

}