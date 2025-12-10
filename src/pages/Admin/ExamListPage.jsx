import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import ExamList from "../../components/AdminComponent/ExamList";

const ExamListPage = () => {
  const [search, setSearch] = useState("");
  const [testTypeFilter, setTestTypeFilter] = useState("all");

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
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            >
              <option value="all">All test types</option>
              <option value="EnglishListening">English Listening</option>
              <option value="EnglishSpeaking">English Speaking</option>
              <option value="Practical">Practical</option>
            </select>
          </div>

          <ExamList search={search} testTypeFilter={testTypeFilter} />
        </div>
      </div>
    </div>
  );
};

export default ExamListPage;
