# 📄 DataCampaignListTest.md

**File:** `CampaignListPage.jsx`  
**Mục đích:** Cung cấp **dữ liệu giả (mock data)** để **kiểm thử (test)** chức năng hiển thị và quản lý **danh sách chiến dịch tuyển dụng & nâng bậc**.

---

## 🧩 1. Mô tả chung

Dữ liệu này mô phỏng các **chiến dịch (campaign)** trong hệ thống tuyển dụng và thăng bậc của hãng hàng không.  
Mỗi chiến dịch bao gồm thông tin tổng quan, tiến độ, yêu cầu và danh sách các **đợt (rounds)** tương ứng.

---

## 🧑‍💻 2. Cấu trúc dữ liệu

```javascript
const demoCampaigns = [
  {
    id: 1,
    code: "CCD1 MRF",
    title: "Tuyển dụng Tiếp viên hàng không 2024",
    subtitle: "Cabin Crew (Thay thế do nghỉ việc/Thai sản)",
    proposer: "Đặng Bích Thu Thùy (Crew Welfare Team Leader)",
    role: "Tiếp viên hàng không",
    department: "Cabin Crew",
    unit: "Cabin Crew - Tiếp viên hàng không",
    quantity: 20,
    status: "active",
    campaignType: "recruitment",
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    progress: { current: 8, total: 20 },
    description:
      "Tuyển dụng tiếp viên hàng không cho các chuyến bay nội địa và quốc tế.",
    requirements:
      "Tiếng Anh tốt, Chiều cao 1.60m+, Kỹ năng giao tiếp, Sức khỏe tốt",
    rounds: [
      {
        id: "r1",
        name: "Đợt 1",
        status: "Đang diễn ra",
        startDate: "2024-10-01",
        endDate: "2024-10-15",
        location: "Hà Nội",
        method: "Trực tiếp",
        owner: "Nguyễn Thanh Tùng",
        target: "7/10",
        notes: "Phỏng vấn vòng 1",
        progress: 70,
      },
      {
        id: "r2",
        name: "Đợt 2",
        status: "Sắp diễn ra",
        startDate: "2024-11-01",
        endDate: "2024-11-15",
        location: "TP.HCM",
        method: "Trực tiếp",
        owner: "Trần Bảo Vy",
        target: "0/10",
        notes: "Phỏng vấn vòng 2",
        progress: 0,
      },
    ],
  },
  // ... (các chiến dịch khác tương tự)
];
```

---

## 📘 3. Bảng mô tả thuộc tính

| **Thuộc tính** | **Kiểu dữ liệu**      | **Mô tả**                                                |
| -------------- | --------------------- | -------------------------------------------------------- |
| `id`           | `number`              | ID duy nhất của chiến dịch                               |
| `code`         | `string`              | Mã chiến dịch                                            |
| `title`        | `string`              | Tên chiến dịch chính                                     |
| `subtitle`     | `string`              | Tiêu đề phụ mô tả thêm                                   |
| `proposer`     | `string`              | Người khởi xướng chiến dịch                              |
| `role`         | `string`              | Chức danh liên quan đến chiến dịch                       |
| `department`   | `string`              | Phòng ban phụ trách                                      |
| `unit`         | `string`              | Đơn vị cụ thể                                            |
| `quantity`     | `number`              | Số lượng nhân sự cần tuyển / nâng bậc                    |
| `status`       | `string`              | Trạng thái chiến dịch (`active`, `pending`, `completed`) |
| `campaignType` | `string`              | Loại chiến dịch (`recruitment` hoặc `promotion`)         |
| `startDate`    | `string (YYYY-MM-DD)` | Ngày bắt đầu chiến dịch                                  |
| `endDate`      | `string (YYYY-MM-DD)` | Ngày kết thúc chiến dịch                                 |
| `progress`     | `object`              | Tiến độ `{ current, total }`                             |
| `description`  | `string`              | Mô tả chi tiết về chiến dịch                             |
| `requirements` | `string`              | Yêu cầu đối với ứng viên hoặc nhân sự                    |
| `rounds`       | `array`               | Danh sách các đợt (rounds) trong chiến dịch              |

---

## 🧭 4. Ví dụ minh họa dữ liệu

| **Mã**     | **Tên chiến dịch**                     | **Loại**   | **Trạng thái** | **Người khởi xướng** | **Tiến độ** |
| ---------- | -------------------------------------- | ---------- | -------------- | -------------------- | ----------- |
| CCD1 MRF   | Tuyển dụng Tiếp viên hàng không 2024   | Tuyển dụng | 🟢 Active      | Đặng Bích Thu Thùy   | 8/20        |
| CCD2 PILOT | Chiến dịch Pilot Training              | Tuyển dụng | ✅ Completed   | Nguyễn Văn A         | 5/5         |
| CCD3 MAINT | Tuyển dụng Kỹ thuật viên bảo trì       | Tuyển dụng | 🟡 Pending     | Trần Văn B           | 0/15        |
| CCD4 PROMO | Chiến dịch nâng bậc Senior Cabin Crew  | Nâng bậc   | 🟢 Active      | Lê Thị Hoa           | 5/15        |
| CCD5 LEAD  | Chiến dịch nâng bậc Lead IT Specialist | Nâng bậc   | 🟡 Pending     | Phạm Minh Tuấn       | 0/3         |

---

## ⚙️ 5. Hướng dẫn sử dụng trong React

```jsx
import React, { useState } from "react";
import { demoCampaigns } from "./DataCampaignListPage";

function CampaignListPage() {
  const [campaigns, setCampaigns] = useState(demoCampaigns);

  return (
    <div>
      <h2>Danh sách chiến dịch</h2>
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên chiến dịch</th>
            <th>Loại</th>
            <th>Trạng thái</th>
            <th>Người khởi xướng</th>
            <th>Tiến độ</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((camp) => (
            <tr key={camp.id}>
              <td>{camp.code}</td>
              <td>{camp.title}</td>
              <td>{camp.campaignType}</td>
              <td>{camp.status}</td>
              <td>{camp.proposer}</td>
              <td>{`${camp.progress.current}/${camp.progress.total}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CampaignListPage;
```

---

## 🧠 6. Ghi chú

- `status` hiển thị bằng **badge màu**:
  - 🟢 `active` → Xanh lá (đang diễn ra)
  - 🟡 `pending` → Vàng (chờ phê duyệt / sắp diễn ra)
  - ⚪ `completed` → Xám hoặc xanh dương nhạt (đã hoàn thành)
- Mỗi `round` có thể hiển thị trong **modal chi tiết** hoặc **accordion**.
- Có thể mở rộng test tính năng **lọc theo loại chiến dịch**, **theo trạng thái**, hoặc **theo phòng ban**.
