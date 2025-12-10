import React from "react";
import { useNavigate } from "react-router-dom";
import { convertDateFormat, formatDate } from "../../../config/formatDate.js";

// Hàm chuyển Markdown thành HTML để hiển thị đúng format
const markdownToHtml = (text) => {
  if (!text || text === "N/A") return "N/A";

  // Escape HTML để tránh XSS (chỉ escape phần không phải markdown)
  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Hàm xử lý inline formatting (bold, italic)
  const processInlineFormatting = (line) => {
    // Escape HTML trước
    let processed = escapeHtml(line);

    // Xử lý bold **text** hoặc __text__ (xử lý trước italic)
    processed = processed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    processed = processed.replace(/__(.+?)__/g, "<strong>$1</strong>");

    // Xử lý italic *text* hoặc _text_ (sau khi đã xử lý bold)
    // Chỉ match *text* nếu không phải là **text**
    processed = processed.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>");
    processed = processed.replace(/(?<!_)_([^_]+?)_(?!_)/g, "<em>$1</em>");

    return processed;
  };

  // Chia text thành các dòng
  const lines = text.split(/\r?\n/);

  if (lines.length === 0) return text;

  let html = "";
  let inList = false;
  let listItems = [];
  let inOrderedList = false;
  let orderedListItems = [];

  const closeList = () => {
    if (inList && listItems.length > 0) {
      html += "<ul>";
      listItems.forEach((item) => {
        html += `<li>${processInlineFormatting(item)}</li>`;
      });
      html += "</ul>";
      listItems = [];
      inList = false;
    }
    if (inOrderedList && orderedListItems.length > 0) {
      html += "<ol>";
      orderedListItems.forEach((item) => {
        html += `<li>${processInlineFormatting(item)}</li>`;
      });
      html += "</ol>";
      orderedListItems = [];
      inOrderedList = false;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Kiểm tra heading
    if (trimmed.startsWith("### ")) {
      closeList();
      const content = trimmed.substring(4);
      html += `<h3>${processInlineFormatting(content)}</h3>`;
    } else if (trimmed.startsWith("## ")) {
      closeList();
      const content = trimmed.substring(3);
      html += `<h2>${processInlineFormatting(content)}</h2>`;
    } else if (trimmed.startsWith("# ")) {
      closeList();
      const content = trimmed.substring(2);
      html += `<h1>${processInlineFormatting(content)}</h1>`;
    }
    // Kiểm tra ordered list (1. item)
    else if (/^\d+\.\s/.test(trimmed)) {
      if (!inOrderedList) {
        closeList();
        inOrderedList = true;
      }
      const itemText = trimmed.replace(/^\d+\.\s*/, "").trim();
      if (itemText) {
        orderedListItems.push(itemText);
      }
    }
    // Kiểm tra unordered list (• hoặc - hoặc *)
    else if (/^[•\-*]\s/.test(trimmed)) {
      if (!inList) {
        closeList();
        inList = true;
      }
      const itemText = trimmed.replace(/^[•\-*]\s*/, "").trim();
      if (itemText) {
        listItems.push(itemText);
      }
    }
    // Dòng trống
    else if (!trimmed) {
      closeList();
      html += "<br>";
    }
    // Paragraph thông thường
    else {
      closeList();
      html += `<p>${processInlineFormatting(trimmed)}</p>`;
    }
  });

  // Đóng list cuối cùng nếu còn mở
  closeList();

  return html || processInlineFormatting(text);
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-sm text-gray-500 w-36 shrink-0">{label}</div>
    <div className="text-sm text-gray-900">{value}</div>
  </div>
);

const PendingRequestDetail = ({ request }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/airline-partner/requests")}
            className="p-2 transition-colors rounded-lg hover:bg-slate-100"
            title="Quay lại"
          >
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {request?.campaignName || "N/A"}
            </h1>
            <p className="text-slate-600">Request is pending approval</p>
          </div>
        </div>

        {/* Status Banner */}
        <div className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-800">
                Request is pending approval
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Request needs to be approved before recruitment can begin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Information */}
      <div className="bg-white border rounded-lg shadow-sm border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="text-sm text-slate-500">Proposal information</div>
            <div className="font-semibold text-slate-800">
              {request?.partnerName || "N/A"}
            </div>
          </div>
          <div className="text-xs text-right text-slate-500">
            Request ID: {request?.requestId || "N/A"}
          </div>
        </div>

        <div className="p-5">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 mt-4 md:grid-cols-2">
              <InfoRow label="Partner" value={request?.partnerName || "N/A"} />
              <InfoRow
                label="Created date"
                value={convertDateFormat(request?.createdAt) || "N/A"}
              />
              <InfoRow
                label="Target quantity"
                value={request?.targetQuantity || "N/A"}
              />
              <InfoRow
                label="Due date"
                value={formatDate(request?.dueDate) || "N/A"}
              />
              <InfoRow
                label="Description"
                value={request?.description || "N/A"}
              />
            </div>

            {/* Job Description */}
            {request?.jobDescription && (
              <div className="mt-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                  📋 Job description
                </h3>
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div
                    className="job-description-content text-sm prose-sm prose text-slate-700 max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: markdownToHtml(request.jobDescription),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Job Requirements */}
            {request?.jobRequirement && (
              <div className="mt-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                  📝 Job requirement
                </h3>
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div
                    className="job-requirement-content text-sm prose-sm prose text-slate-700 max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: markdownToHtml(request.jobRequirement),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Recruitment Process
            <div className="mt-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">
                🔄 Recruitment process
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
                        <span className="text-slate-700">
                          Phỏng vấn Hội đồng
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingRequestDetail;
