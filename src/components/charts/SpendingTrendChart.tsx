import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend } from
'recharts';
import { formatCurrency } from '../../utils/formatters';
const data = [
{
  month: 'Jan',
  issued: 1500,
  paid: 500
},
{
  month: 'Feb',
  issued: 2000,
  paid: 1500
},
{
  month: 'Mar',
  issued: 5200,
  paid: 2000
},
{
  month: 'Apr',
  issued: 5200,
  paid: 5200
},
{
  month: 'May',
  issued: 7000,
  paid: 5200
},
{
  month: 'Jun',
  issued: 11500,
  paid: 7000
},
{
  month: 'Jul',
  issued: 12250,
  paid: 11500
},
{
  month: 'Aug',
  issued: 14250,
  paid: 12250
},
{
  month: 'Sep',
  issued: 17750,
  paid: 14250
},
{
  month: 'Oct',
  issued: 23750,
  paid: 15000
},
{
  month: 'Nov',
  issued: 26000,
  paid: 17750
},
{
  month: 'Dec',
  issued: 27000,
  paid: 20000
}];

export function SpendingTrendChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0
          }}>
          
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#374151"
            opacity={0.2} />
          
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 12,
              fill: '#6b7280'
            }}
            dy={10} />
          
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 12,
              fill: '#6b7280'
            }}
            tickFormatter={(value) => `R${value}`} />
          
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: number) => formatCurrency(value)}
            labelStyle={{
              color: '#374151',
              fontWeight: 'bold',
              marginBottom: '4px'
            }} />
          
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: '12px'
            }} />
          
          <Line
            type="monotone"
            dataKey="issued"
            name="Cumulative Issued"
            stroke="#ef4444"
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 6
            }} />
          
          <Line
            type="monotone"
            dataKey="paid"
            name="Cumulative Paid"
            stroke="#10b981"
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 6
            }} />
          
        </LineChart>
      </ResponsiveContainer>
    </div>);

}