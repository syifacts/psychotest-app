import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Props {
  testTypes: any[];
  allUsers: any[];
}

export default function TestChart({ testTypes, allUsers }: Props) {
  const testStats = testTypes.map((t) => ({
    testName: t.name,
    count: allUsers.filter(u => u.name === t.name && u.status === "Sudah Tes").length,
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-indigo-700 text-center">Test yang Sudah Dikerjakan</h2>
      {testStats.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={testStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="testName" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-500">Belum ada data tes</p>
      )}
    </div>
  );
}
