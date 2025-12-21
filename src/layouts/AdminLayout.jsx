import SidebarAdmin from "../components/AdminComponent/SidebarAdmin";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`w-70 shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}
        >
          <SidebarAdmin />
        </div>

        <div className="flex flex-col flex-1 p-5 overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out">
          <div className="flex-1 w-full h-full">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
