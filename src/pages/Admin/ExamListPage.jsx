import { useState, useEffect, useCallback } from "react";
import { FaSearch } from "react-icons/fa";
import ExamList from "../../components/AdminComponent/ExamList";
import { getTestTypes } from "../../service/api2";

const ExamListPage = () => {
  const [search, setSearch] = useState("");
  const [testTypeFilter, setTestTypeFilter] = useState("all");
  const [testTypes, setTestTypes] = useState([]);
  const [isLoadingTestTypes, setIsLoadingTestTypes] = useState(false);

  // Fetch test types from API
  const fetchTestTypes = useCallback(async () => {
    setIsLoadingTestTypes(true);
    try {
      const result = await getTestTypes();
      if (result.success) {
        // Handle different response formats
        const types = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.items)
          ? result.data.items
          : [];

        // Map to format: { testTypeId, testTypeName }
        const formattedTestTypes = types
          .map((type) => ({
            testTypeId: type?.testTypeId ?? type?.id ?? null,
            testTypeName: type?.testTypeName || type?.name || "",
          }))
          .filter((t) => t.testTypeId && t.testTypeName);

        setTestTypes(formattedTestTypes);
      } else {
        console.error("Failed to fetch test types:", result.error);
        setTestTypes([]);
      }
    } catch (error) {
      console.error("Error fetching test types:", error);
      setTestTypes([]);
    } finally {
      setIsLoadingTestTypes(false);
    }
  }, []);

  // Load test types on mount
  useEffect(() => {
    fetchTestTypes();
  }, [fetchTestTypes]);

  // Get testTypeId from selected filter value
  const getTestTypeId = useCallback(() => {
    if (testTypeFilter === "all" || !testTypeFilter) return null;
    // If testTypeFilter is already a number (testTypeId), return it
    if (!isNaN(testTypeFilter)) {
      return parseInt(testTypeFilter, 10);
    }
    // Otherwise, find by testTypeName
    const testType = testTypes.find((t) => t.testTypeName === testTypeFilter);
    return testType?.testTypeId || null;
  }, [testTypeFilter, testTypes]);

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end gap-3">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-3 pr-9 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <select
              value={testTypeFilter}
              onChange={(e) => setTestTypeFilter(e.target.value)}
              disabled={isLoadingTestTypes}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">All test types</option>
              {testTypes.map((type) => (
                <option key={type.testTypeId} value={type.testTypeName}>
                  {type.testTypeName}
                </option>
              ))}
            </select>
          </div>

          <ExamList search={search} testType={getTestTypeId()} />
        </div>
      </div>
    </div>
  );
};

export default ExamListPage;
