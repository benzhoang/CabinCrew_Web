import { convertDateFormat, formatDate } from "../../../config/formatDate.js";

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-sm text-gray-500 w-36 shrink-0">{label}</div>
    <div className="text-sm text-gray-900">{value}</div>
  </div>
);

const RequestInfo = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 gap-5">
        <div className="p-5 bg-white border border-gray-200 rounded-xl">
          <div className="mb-3 text-sm font-semibold text-gray-900">
            Proposal information
          </div>

          <div className="font-medium text-gray-900">
            {data.partnerName || "N/A"}
          </div>
          <div className="grid grid-cols-1 gap-5 mt-4 md:grid-cols-2">
            <InfoRow label="Partner" value={data.partnerName || "N/A"} />
            <InfoRow
              label="Created date"
              value={convertDateFormat(data.createdAt) || "N/A"}
            />
            <InfoRow
              label="Target quantity"
              value={data.targetQuantity || "N/A"}
            />
            <InfoRow
              label="Due date"
              value={formatDate(data.dueDate) || "N/A"}
            />
            <InfoRow label="Description" value={data.description || "N/A"} />
          </div>
          {/* Job Description */}
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              📋 Job description
            </h3>
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div
                className="text-sm prose-sm prose job-description-content text-slate-700 max-w-none"
                dangerouslySetInnerHTML={{
                  __html: data.jobDescription || "N/A",
                }}
              />
            </div>
          </div>

          {/* Job Requirements */}
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              📝 Job requirement
            </h3>
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div
                className="text-sm prose-sm prose job-requirement-content text-slate-700 max-w-none"
                dangerouslySetInnerHTML={{
                  __html: data.jobRequirement || "N/A",
                }}
              />
            </div>
          </div>

          {/* Recruitment Process
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              🔄 Quy trình tuyển dụng / Recruitment Process
            </h3>
            <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                        1
                      </span>
                      <span className="text-slate-700">
                        Kiểm tra hồ sơ: Ứng viên chuẩn bị CCCD để đối chiếu và
                        lấy số báo danh
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                        2
                      </span>
                      <span className="text-slate-700">
                        Kiểm tra ngoại hình AI
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                        3
                      </span>
                      <span className="text-slate-700">
                        Cân đo chiều cao và BMI
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                        4
                      </span>
                      <span className="text-slate-700">
                        Thi Catwalk - Phỏng vấn AI
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                        5
                      </span>
                      <span className="text-slate-700">
                        Thi Tài năng (theo nhóm)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                        6
                      </span>
                      <span className="text-slate-700">Phỏng vấn Hội đồng</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default RequestInfo;
