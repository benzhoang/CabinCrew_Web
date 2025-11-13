# 📄 DataRequestListTest.md
**File:** `RequestListPage.jsx`  
**Mục đích:** Cung cấp **dữ liệu giả (mock data)** để **kiểm thử (test)** chức năng hiển thị và quản lý **danh sách yêu cầu tuyển dụng & thăng bậc**.

---

## 🧩 1. Mô tả chung

Dữ liệu này mô phỏng các **yêu cầu tuyển dụng (recruitment)** và **yêu cầu nâng bậc (promotion)** được tạo bởi các phòng ban khác nhau.  
Mỗi yêu cầu chứa thông tin cơ bản như: mã yêu cầu, người đề xuất, vị trí, số lượng, trạng thái, thời gian hiệu lực và mô tả chi tiết.

---

## 🧑‍💻 2. Cấu trúc dữ liệu

```javascript
// Dữ liệu giả cho danh sách yêu cầu
const demoRequests = [
  {
    id: 101,
    code: "REQ-2024-001",
    title: "Yêu cầu tuyển dụng - Cabin Crew (MRF)",
    proposer: "Đặng Bích Thu Thùy",
    position: "Cabin Crew",
    department: "Cabin Crew",
    unit: "Cabin Crew - Tiếp viên hàng không",
    quantity: 20,
    status: "pending",
    requestType: "recruitment",
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    description:
      "Bổ sung nhân sự Cabin Crew do biến động nghỉ việc và mở rộng đội bay",
  },
  {
    id: 102,
    code: "REQ-2024-002",
    title: "Yêu cầu tuyển dụng - IT Specialist",
    proposer: "Nguyễn Văn Nam",
    position: "IT Specialist",
    department: "Information Technology",
    unit: "IT Operations",
    quantity: 5,
    status: "approved",
    requestType: "recruitment",
    startDate: "2024-08-01",
    endDate: "2024-09-30",
    description: "Tăng cường đội ngũ IT phục vụ triển khai hệ thống mới",
  },
  {
    id: 103,
    code: "REQ-2024-003",
    title: "Yêu cầu tuyển dụng - Aircraft Mechanic",
    proposer: "Trần Bảo Vy",
    position: "Aircraft Mechanic",
    department: "Maintenance",
    unit: "Base Maintenance",
    quantity: 12,
    status: "rejected",
    requestType: "recruitment",
    startDate: "2024-07-15",
    endDate: "2024-10-15",
    description:
      "Bổ sung kỹ thuật viên bảo trì, đợt đề xuất chưa đáp ứng ngân sách",
  },
  {
    id: 104,
    code: "REQ-2024-004",
    title: "Yêu cầu nâng bậc - Senior Cabin Crew",
    proposer: "Lê Thị Hoa",
    position: "Senior Cabin Crew",
    department: "Cabin Crew",
    unit: "Cabin Crew - Tiếp viên hàng không",
    quantity: 15,
    status: "pending",
    requestType: "promotion",
    startDate: "2024-11-01",
    endDate: "2025-01-31",
    description: "Nâng bậc cho các cabin crew có kinh nghiệm lâu năm",
  },
  {
    id: 105,
    code: "REQ-2024-005",
    title: "Yêu cầu nâng bậc - Lead IT Specialist",
    proposer: "Phạm Minh Tuấn",
    position: "Lead IT Specialist",
    department: "Information Technology",
    unit: "IT Operations",
    quantity: 3,
    status: "approved",
    requestType: "promotion",
    startDate: "2024-09-01",
    endDate: "2024-12-31",
    description: "Nâng bậc cho các IT Specialist xuất sắc",
  },
];
```

---

## 📘 3. Bảng mô tả thuộc tính

| **Thuộc tính** | **Kiểu dữ liệu** | **Mô tả** |
|----------------|------------------|------------|
| `id` | `number` | ID duy nhất của yêu cầu |
| `code` | `string` | Mã yêu cầu (theo định dạng REQ-YYYY-XXX) |
| `title` | `string` | Tiêu đề mô tả yêu cầu |
| `proposer` | `string` | Tên người đề xuất yêu cầu |
| `position` | `string` | Chức danh cần tuyển hoặc cần nâng bậc |
| `department` | `string` | Phòng ban phụ trách |
| `unit` | `string` | Đơn vị hoặc bộ phận cụ thể |
| `quantity` | `number` | Số lượng nhân sự cần tuyển / nâng bậc |
| `status` | `string` | Trạng thái yêu cầu (`pending`, `approved`, `rejected`) |
| `requestType` | `string` | Loại yêu cầu (`recruitment` hoặc `promotion`) |
| `startDate` | `string (YYYY-MM-DD)` | Ngày bắt đầu hiệu lực |
| `endDate` | `string (YYYY-MM-DD)` | Ngày kết thúc hiệu lực |
| `description` | `string` | Mô tả chi tiết về yêu cầu |

---

## 🧭 4. Danh sách yêu cầu mẫu

| **Mã yêu cầu** | **Loại** | **Vị trí** | **Người đề xuất** | **Trạng thái** | **Thời gian** |
|-----------------|----------|-------------|------------------|----------------|----------------|
| REQ-2024-001 | Tuyển dụng | Cabin Crew | Đặng Bích Thu Thùy | ⏳ Pending | 01/10/2024 → 31/12/2024 |
| REQ-2024-002 | Tuyển dụng | IT Specialist | Nguyễn Văn Nam | ✅ Approved | 01/08/2024 → 30/09/2024 |
| REQ-2024-003 | Tuyển dụng | Aircraft Mechanic | Trần Bảo Vy | ❌ Rejected | 15/07/2024 → 15/10/2024 |
| REQ-2024-004 | Nâng bậc | Senior Cabin Crew | Lê Thị Hoa | ⏳ Pending | 01/11/2024 → 31/01/2025 |
| REQ-2024-005 | Nâng bậc | Lead IT Specialist | Phạm Minh Tuấn | ✅ Approved | 01/09/2024 → 31/12/2024 |

---

## ⚙️ 5. Hướng dẫn sử dụng trong React

```jsx
import React, { useState } from "react";
import { demoRequests } from "./DataRequestListTest";

function RequestListPage() {
  const [requests, setRequests] = useState(demoRequests);

  return (
    <div>
      <h2>Danh sách yêu cầu</h2>
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tiêu đề</th>
            <th>Loại</th>
            <th>Trạng thái</th>
            <th>Người đề xuất</th>
            <th>Số lượng</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td>{req.code}</td>
              <td>{req.title}</td>
              <td>{req.requestType}</td>
              <td>{req.status}</td>
              <td>{req.proposer}</td>
              <td>{req.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RequestListPage;
```

---

## 🧠 6. Ghi chú

- `status` có thể được hiển thị bằng **màu badge**:
  - 🟢 `approved` → Xanh lá  
  - 🟡 `pending` → Vàng  
  - 🔴 `rejected` → Đỏ  
- Dữ liệu có thể được mở rộng để test thêm tính năng **lọc (filter)**, **phân trang (pagination)**, hoặc **tìm kiếm (search)**.
