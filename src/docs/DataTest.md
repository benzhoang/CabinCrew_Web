# 📄 DataTest.md

**File:** `MainPage.jsx`  
**Mục đích:** Cung cấp **dữ liệu giả (mock data)** phục vụ **kiểm thử (test)** chức năng **đăng nhập (Login)** theo từng vai trò người dùng trong hệ thống.

---

## 🧩 1. Mô tả chung

Dữ liệu trong file này được sử dụng để mô phỏng thông tin người dùng thuộc nhiều vai trò khác nhau như **admin**, **recruiter**, **candidate**, **airline partner**, v.v.  
Các thông tin bao gồm: `username`, `password`, `displayName`, và `role`.

---

## 🧑‍💻 2. Cấu trúc dữ liệu

```javascript
const testUsers = {
  candidate: {
    username: "testuser",
    password: "123456",
    displayName: "Test Candidate",
    role: "candidate",
  },
  admin: {
    username: "admin",
    password: "admin123",
    displayName: "System Admin",
    role: "admin",
  },
  recruiter: {
    username: "recruiter",
    password: "recruiter123",
    displayName: "HR Recruiter",
    role: "recruiter",
  },
  "airline-partner": {
    username: "airline",
    password: "airline123",
    displayName: "Airline Partner",
    role: "airline-partner",
  },
  "cabin-crew": {
    username: "cabincrew",
    password: "cabincrew123",
    displayName: "Cabin Crew",
    role: "cabin-crew",
  },
  director: {
    username: "director",
    password: "director123",
    displayName: "Director",
    role: "director",
  },
  examiner: {
    username: "examiner",
    password: "examiner123",
    displayName: "Examiner",
    role: "examiner",
  },
  "senior-recruiter": {
    username: "senior",
    password: "senior123",
    displayName: "Senior Recruiter",
    role: "senior-recruiter",
  },
};
```

---

## 📘 3. Bảng tham chiếu tài khoản test

| **Role**           | **Username** | **Password** | **Display Name** | **Mô tả vai trò**                   |
| ------------------ | ------------ | ------------ | ---------------- | ----------------------------------- |
| `candidate`        | testuser     | 123456       | Test Candidate   | Ứng viên tham gia chương trình      |
| `admin`            | admin        | admin123     | System Admin     | Quản trị viên hệ thống              |
| `recruiter`        | recruiter    | recruiter123 | HR Recruiter     | Nhân sự phụ trách tuyển dụng        |
| `airline-partner`  | airline      | airline123   | Airline Partner  | Đại diện hãng hàng không đối tác    |
| `cabin-crew`       | cabincrew    | cabincrew123 | Cabin Crew       | Tiếp viên hàng không                |
| `director`         | director     | director123  | Director         | Giám đốc điều hành chương trình     |
| `examiner`         | examiner     | examiner123  | Examiner         | Giám khảo, người chấm thi           |
| `senior-recruiter` | senior       | senior123    | Senior Recruiter | Tuyển dụng cấp cao / Trưởng nhóm HR |

---

## ⚙️ 4. Cách sử dụng trong `MainPage.jsx`

```jsx
import React, { useState } from "react";

// Import hoặc định nghĩa trực tiếp data test
import { testUsers } from "./DataTest";

function MainPage() {
  const [loginInfo, setLoginInfo] = useState({ username: "", password: "" });

  const handleLogin = () => {
    const user = Object.values(testUsers).find(
      (u) =>
        u.username === loginInfo.username && u.password === loginInfo.password
    );

    if (user) {
      alert(`Đăng nhập thành công! Xin chào ${user.displayName}`);
    } else {
      alert("Sai thông tin đăng nhập!");
    }
  };

  return (
    <div>
      <h2>Login Test Page</h2>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) =>
          setLoginInfo({ ...loginInfo, username: e.target.value })
        }
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setLoginInfo({ ...loginInfo, password: e.target.value })
        }
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default MainPage;
```

---

## 🧭 5. Hướng dẫn kiểm thử

1. Mở ứng dụng React, điều hướng đến **trang Login (`MainPage.jsx`)**.
2. Dùng các cặp **username / password** trong bảng trên để đăng nhập.
3. Xác nhận:
   - Giao diện hiển thị đúng thông tin `displayName`.
   - Quyền truy cập hoặc UI thay đổi tương ứng với `role`.
4. Có thể mở rộng bằng cách lưu `user` vào `localStorage` hoặc `Context` để quản lý phiên đăng nhập.
