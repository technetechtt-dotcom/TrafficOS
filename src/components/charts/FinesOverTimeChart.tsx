import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import { formatCurrency } from '../../utils/formatters';
const data = [
{
  month: 'Jan',
  count: 2,
  amount: 1500
},
{
  month: 'Feb',
  count: 1,
  amount: 500
},
{
  month: 'Mar',
  count: 3,
  amount: 3200
},
{
  month: 'Apr',
  count: 0,
  amount: 0
},
{
  month: 'May',
  count: 2,
  amount: 1800
},
{
  month: 'Jun',
  count: 4,
  amount: 4500
},
{
  month: 'Jul',
  count: 1,
  amount: 750
},
{
  month: 'Aug',
  count: 2,
  amount: 2000
},
{
  month: 'Sep',
  count: 3,
  amount: 3500
},
{
  month: 'Oct',
  count: 5,
  amount: 6000
},
{
  month: 'Nov',
  count: 2,
  amount: 2250
},
{
  month: 'Dec',
  count: 1,
  amount: 1000
}];

export function FinesOverTimeChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0
          }}>
          
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            formatter={(value: number) => [formatCurrency(value), 'Amount']}
            labelStyle={{
              color: '#374151',
              fontWeight: 'bold',
              marginBottom: '4px'
            }} />
          
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#2563eb"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorAmount)" />
          
        </AreaChart>
      </ResponsiveContainer>
    </div>);

}