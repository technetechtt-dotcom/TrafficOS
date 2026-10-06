import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell } from
'recharts';
import { formatCurrency } from '../../utils/formatters';
const data = [
{
  plate: 'CA 123-456',
  count: 6,
  amount: 6250,
  color: '#3b82f6'
},
{
  plate: 'GP 789-012',
  count: 4,
  amount: 11000,
  color: '#10b981'
}];

export function FinesByVehicleChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 10,
            right: 30,
            left: 40,
            bottom: 0
          }}>
          
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#374151"
            opacity={0.2} />
          
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 12,
              fill: '#6b7280'
            }} />
          
          <YAxis
            dataKey="plate"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 12,
              fill: '#374151',
              fontWeight: 500
            }} />
          
          <Tooltip
            cursor={{
              fill: 'transparent'
            }}
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: number, name: string, props: any) => [
            name === 'count' ? value : formatCurrency(props.payload.amount),
            name === 'count' ? 'Fines' : 'Total Amount']
            } />
          
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
            {data.map((entry, index) =>
            <Cell key={`cell-${index}`} fill={entry.color} />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>);

}