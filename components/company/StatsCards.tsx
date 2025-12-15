interface Props {
  allUsers: any[];
}

export default function StatsCards({ allUsers }: Props) {
  const totalUsers = allUsers.length;
  const testedUsers = allUsers.filter(u => u.status === "Sudah Tes").length;
  const notTestedUsers = allUsers.filter(u => u.status === "Belum Tes").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6 text-center flex flex-col items-center justify-center">
        <h3 className="text-gray-500 text-sm mb-2">Total User Terdaftar</h3>
        <p className="text-3xl font-bold text-indigo-600">{totalUsers}</p>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6 text-center flex flex-col items-center justify-center">
        <h3 className="text-gray-500 text-sm mb-2">User yang Sudah Tes</h3>
        <p className="text-3xl font-bold text-green-600">{testedUsers}</p>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6 text-center flex flex-col items-center justify-center">
        <h3 className="text-gray-500 text-sm mb-2">User Belum Tes</h3>
        <p className="text-3xl font-bold text-red-500">{notTestedUsers}</p>
      </div>
    </div>
  );
}
