"use client";

import { useEffect, useState } from "react";

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔽 NEW STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    fetch("/api/activity-log")
      .then(res => res.json())
      .then(data => setLogs(data))
      .finally(() => setLoading(false));
  }, []);

  const badge = (text: string, type: "status" | "severity" | "action") => {
    let style = "bg-gray-100 text-gray-700";

    if (type === "status") {
      if (text === "SUCCESS") style = "bg-green-100 text-green-700";
      if (text === "FAILED") style = "bg-red-100 text-red-700";
    }

    if (type === "severity") {
      if (text === "HIGH") style = "bg-red-100 text-red-700";
      if (text === "MEDIUM") style = "bg-yellow-100 text-yellow-700";
      if (text === "LOW") style = "bg-blue-100 text-blue-700";
    }

if (type === "action") {
  if (text === "LOGIN")
    style = "bg-blue-100 text-blue-700";

  if (text === "READ")
    style = "bg-green-100 text-green-700";

  if (text === "UPDATE")
    style = "bg-yellow-100 text-yellow-700";

  if (text === "DELETE")
    style = "bg-red-100 text-red-700";

  if (text === "CREATE")
    style = "bg-purple-100 text-purple-700";

  if (text === "EXPORT")
    style = "bg-indigo-100 text-indigo-700";
}

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style}`}>
        {text}
      </span>
    );
  };

  // 🔍 FILTER LOGIC
  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.createdAt);

    return (
      (statusFilter ? log.status === statusFilter : true) &&
      (severityFilter ? log.severity === severityFilter : true) &&
      (dateFrom ? logDate >= new Date(dateFrom) : true) &&
      (dateTo ? logDate <= new Date(dateTo + "T23:59:59") : true)
    );
  });

  // 📄 PAGINATION
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 📥 EXPORT CSV
  const exportCSV = () => {
const headers = [
  "No",
  "User",
  "Role",
  "Action",
  "Resource",
  "Resource ID",
  "Endpoint",
  "Method",
  "IP",
  "User Agent",
  "Status",
  "Severity",
  "Suspicious",
  "Description",
  "Created",
];

const rows = filteredLogs.map((log, index) => [
  (currentPage - 1) * itemsPerPage + index + 1,

  log.user
    ? `${log.user.fullName} (ID: ${log.user.id})`
    : "-",

  log.role,
  log.action,
  log.resource,
  log.resourceId,
  log.endpoint,
  log.method,
  log.ipAddress,
  log.userAgent,
  log.status,
  log.severity,
  log.isSuspicious ? "Yes" : "No",
  log.description,
  new Date(log.createdAt).toLocaleString(),
]);

    const csv =
      [headers, ...rows]
        .map(r => r.map(x => `"${x ?? ""}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "activity-log.csv";
    a.click();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Activity Log</h1>

      {/* 🔥 FILTER + EXPORT */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">Semua Status</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILED">FAILED</option>
        </select>

        <select
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">Semua Severity</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        {/* 📅 DATE FILTER */}
        <input
          type="date"
          onChange={(e) => {
            setDateFrom(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded-lg"
        />

        <input
          type="date"
          onChange={(e) => {
            setDateTo(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded-lg"
        />

        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : (
          <>
            <div className="overflow-auto">
  <table className="w-full min-w-[1600px] text-sm border-collapse">
<thead className="bg-gray-100 text-gray-700 text-xs uppercase sticky top-0 z-10">                  <tr>
               <th className="p-3 text-left">No</th>
<th className="p-3 text-left">User</th>
                    {/* <th className="p-3 text-left">UserId</th> */}
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Action</th>
                    <th className="p-3 text-left">Resource</th>
                    <th className="p-3 text-left">Resource ID</th>
                    <th className="p-3 text-left">Endpoint</th>
                    <th className="p-3 text-left">Method</th>
                    <th className="p-3 text-left">IP</th>
                    <th className="p-3 text-left">User Agent</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Severity</th>
                    <th className="p-3 text-left">Suspicious</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedLogs.map((log, index) => (
<tr
  key={log.id}
  className="border-t hover:bg-blue-50 transition-colors align-top"
>                          {/* NOMOR */}
    <td className="p-3">
      {(currentPage - 1) * itemsPerPage + index + 1}
    </td>
     {/* USER */}
    <td className="p-3">
      {log.user ? (
        <div>
          <p className="font-medium">
            {log.user.fullName}
          </p>

          <p className="text-xs text-gray-500">
            ID: {log.user.id}
          </p>
        </div>
      ) : (
        "-"
      )}
    </td>
                      {/* <td className="p-3">{log.userId || "-"}</td> */}
                      <td className="p-3">{log.role || "-"}</td>
                      <td className="p-3">{badge(log.action, "action")}</td>
                      <td className="p-3">{log.resource || "-"}</td>
                      <td className="p-3">{log.resourceId || "-"}</td>
<td className="p-3 text-blue-600 whitespace-normal break-all min-w-[220px]">
  {log.endpoint || "-"}
</td>                      <td className="p-3">{log.method || "-"}</td>
                      <td className="p-3">{log.ipAddress || "-"}</td>
<td className="p-3 whitespace-normal break-words min-w-[280px] text-gray-600">
  {log.userAgent || "-"}
</td>                      <td className="p-3">{badge(log.status, "status")}</td>
                      <td className="p-3">{badge(log.severity, "severity")}</td>
                      <td className="p-3">
                        {log.isSuspicious ? (
                          <span className="text-red-500 font-bold">🚨 Yes</span>
                        ) : "No"}
                      </td>
<td className="p-3 whitespace-normal break-words min-w-[250px]">
  {log.description || "-"}
</td>                      <td className="p-3 text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 🔢 PAGINATION */}
            <div className="flex justify-between items-center p-4">
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}