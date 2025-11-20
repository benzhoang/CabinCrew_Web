import * as XLSX from "xlsx";

// Export file Excel template cho bộ câu hỏi của đề thi
// Cấu trúc cột giống hình: OrderNumber, QuestionContent, Score, Option1-6, CorrectAnswer
// Có thêm hộp hướng dẫn định dạng bên phải
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

  // Hướng dẫn định dạng
  const guideText = [
    "Format quy ước:",
    "",
    "English Speaking:",
    "→ Chỉ cần nhập Question và Score.",
    "",
    "English Listening và Practical:",
    "→ Cần nhập đầy đủ tất cả các trường.",
    "→ Riêng Options: có thể thêm tùy ý số lượng, không bắt buộc cố định.",
  ];

  // Tạo mảng 2 chiều: header và data rows
  const aoa = [];

  // Thêm header với các cột trống cho hướng dẫn (K, L, M, N, O) - merge 5 cột để đủ rộng
  aoa.push([...header, "", "", "", "", ""]);

  // Thêm các dòng dữ liệu với các cột trống
  sampleRows.forEach((row) => {
    aoa.push([...row, "", "", "", "", ""]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Gộp tất cả hướng dẫn thành một text với ký tự xuống dòng
  const fullGuideText = guideText.join("\n");

  // Đặt toàn bộ hướng dẫn vào cell K1 (hàng 0, cột 10)
  const guideCellAddress = XLSX.utils.encode_cell({ r: 0, c: 10 });
  ws[guideCellAddress] = { t: "s", v: fullGuideText };

  // Độ rộng cột tương đối dễ đọc
  ws["!cols"] = [
    { wch: 12 }, // OrderNumber
    { wch: 40 }, // QuestionContent
    { wch: 8 }, // Score
    { wch: 12 }, // Option1
    { wch: 12 }, // Option2
    { wch: 12 }, // Option3
    { wch: 12 }, // Option4
    { wch: 12 }, // Option5
    { wch: 12 }, // Option6
    { wch: 14 }, // CorrectAnswer
    { wch: 30 }, // Cột K - hướng dẫn
    { wch: 30 }, // Cột L - hướng dẫn (cho merge)
    { wch: 30 }, // Cột M - hướng dẫn (cho merge)
    { wch: 30 }, // Cột N - hướng dẫn (cho merge)
    { wch: 30 }, // Cột O - hướng dẫn (cho merge)
  ];

  // Merge toàn bộ vùng hướng dẫn thành một hộp lớn
  // Merge từ K1 đến O8 (tất cả các dòng hướng dẫn) để tạo một hộp lớn
  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push({
    s: { r: 0, c: 10 }, // Bắt đầu từ K1
    e: { r: guideText.length - 1, c: 14 }, // Kết thúc ở O8 (merge cả chiều dọc và ngang)
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "QuestionTemplate");
  XLSX.writeFile(
    wb,
    `question_template_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}


