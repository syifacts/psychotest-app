interface Props {
  packagePurchases: any[];
  singlePayments: any[];
}

export default function TestCards({ packagePurchases, singlePayments }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-indigo-700 mb-4 text-center">Test yang Sudah Dibeli</h2>
      <div className="h-[400px] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...packagePurchases, ...singlePayments].map((p) => {
            const remaining =
              "remainingQuota" in p
                ? p.remainingQuota ?? p.quantity
                : p.quantity - (p.userPackages?.length ?? 0);
            const isEmpty = remaining <= 0;

            return (
              <div
                key={p.id}
                className={`rounded-2xl shadow-md p-4 ${isEmpty ? "bg-red-50" : "bg-white"}`}
              >
                <h3 className="text-lg font-bold text-indigo-700">
                  {"package" in p ? p.package?.name : p.TestType?.name}
                </h3>

                {"package" in p && p.package?.description && (
                  <p className="text-xs text-gray-500">{p.package.description}</p>
                )}

                <div className="flex flex-wrap gap-1 mt-2 text-sm">
                  <span className="px-2 py-1 bg-gray-100 rounded">Jumlah: {p.quantity}</span>
                  <span className={`px-2 py-1 rounded ${isEmpty ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    Sisa: {remaining}
                  </span>
                  {"amount" in p && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                      Harga: Rp {p.amount.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
