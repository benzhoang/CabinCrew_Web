import HeaderAdmin from "../components/AdminComponent/HeaderAdmin";
import SidebarAdmin from "../components/AdminComponent/SidebarAdmin";
import { useState } from "react";

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      <div className="flex-shrink-0">
        <HeaderAdmin toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`${isSidebarOpen ? "w-70" : "w-0"} shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}>
          <SidebarAdmin isOpen={isSidebarOpen} />
        </div>

        <div className="flex-1 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden p-5 flex flex-col">
          <div className="flex-1 w-full h-full">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;