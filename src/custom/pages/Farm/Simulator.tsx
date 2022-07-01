import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

export function Simulator() {
  const data = [
    {
      name: 'Page A',
      farm: 0,
      noLeve: 2400,
      hool: 2400,
    },
    {
      name: 'Page B',
      farm: 0,
      noLeve: 1398,
      hool: 2400,
    },
    {
      name: 'Page C',
      farm: 2000,
      noLeve: 9800,
      hool: 2400,
    },
    {
      name: 'Page D',
      farm: 2780,
      noLeve: 3908,
      hool: 2400,
    },
    {
      name: 'Page E',
      farm: 1890,
      noLeve: 4800,
      hool: 2400,
    },
    {
      name: 'Page F',
      farm: 2390,
      noLeve: 3800,
      hool: 2400,
    },
    {
      name: 'Page G',
      uv: 3490,
      noLeve: 4300,
      hool: 2400,
    },
  ]
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'pv of page', angle: -90, position: 'insideLeft', textAnchor: 'middle' }} />
        <Tooltip />
        <Legend />

        <ReferenceLine x="Page C" label="Liquidation Price: 118.6169" stroke="#E74358" />
        <ReferenceLine x="Page E" label="Current Price: 201.1919" stroke="#9DA1AF" />
        <Line type="monotone" dataKey="farm" name="Farming" stroke="#1ED392" activeDot={{ r: 8 }} />
        <Line
          type="monotone"
          dataKey="noLeve"
          name="Farming No Leverage"
          stroke="#1ED392"
          strokeDasharray="4"
          activeDot={{ r: 6 }}
        />
        <Line type="monotone" dataKey="hool" name="HODL Without Farming" stroke="#9C8AD1" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
