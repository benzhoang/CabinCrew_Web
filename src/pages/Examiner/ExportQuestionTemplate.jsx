import * as XLSX from "xlsx";

// Export file Excel template cho bộ câu hỏi của đề thi
// Cấu trúc cột giống hình: OrderNumber, QuestionContent, Score, Option1-6, CorrectAnswer
export function exportQuestionTemplate() {
  const header = [
    "OrderNumber",
    "QuestionContent",
    "Score",
    "Option1",
    "Option2",
    "Option3",
    "Option4",
    "Option5",
    "Option6",
    "CorrectAnswer",
  ];

  // Một vài dòng mẫu giống hình minh họa
  const sampleRows = [
    [1, "What is 2+2?", 10, "", "", "", "", "", "", ""],
    [2, "Capital of VN?", 10, "", "", "", "", "", "", ""],
    [3, "What is 4+2?", 10, "", "", "", "", "", "", ""],
  ];

  const aoa = [header, ...sampleRows];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Độ rộng cột tương đối dễ đọc
  ws["!cols"] = [
    { wch: 12 }, // OrderNumber
    { wch: 40 }, // QuestionContent
    { wch: 8 }, // Score
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 }, // CorrectAnswer
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "QuestionTemplate");
  XLSX.writeFile(
    wb,
    `question_template_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}


