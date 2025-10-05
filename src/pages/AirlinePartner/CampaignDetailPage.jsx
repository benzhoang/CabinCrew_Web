import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CampaignInfo from "../../components/AirlinePartnerComponent/CampaignInfo";

const mockCampaign = {
  id: 1,
  code: "CCD1 MRF",
  title: "Yêu cầu tuyển dụng - MRF",
  subtitle: "Cabin Crew (Thay thế do nghỉ việc/Thai sản)",
  proposer: "Đặng Bích Thu Thùy (Crew Welfare Team Leader)",
  role: "Tiếp viên hàng không",
  department: "Cabin Crew",
  unit: "Cabin Crew - Tiếp viên hàng không",
  quantity: 20,
  startDate: "2024-01-15",
  endDate: "2024-03-15",
  description:
    "Tuyển dụng tiếp viên hàng không cho các chuyến bay nội địa và quốc tế",
  requirements:
    "Tiếng Anh tốt, Chiều cao 1.60m+, Kỹ năng giao tiếp, Sức khỏe tốt",
  rounds: [
    {
      id: "r1",
      name: "Đợt 1",
      status: "Đang diễn ra",
      time: "01/10/2024 - 15/10/2024",
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
      time: "01/11/2024 - 15/11/2024",
      location: "TP.HCM",
      method: "Trực tiếp",
      owner: "Trần Bảo Vy",
      target: "0/10",
      notes: "Phỏng vấn vòng 2",
      progress: 0,
    },
  ],
};

const CampaignDetail = () => {
  const { id } = useParams();
  const data = useMemo(() => ({ ...mockCampaign, id }), [id]);
  const navigate = useNavigate();

  return (
    <div className="w-full h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-red-600 tracking-wide uppercase">
              Yêu cầu tuyển dụng - MRF
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              [CCD] MRF - Cabin Crew (Replacement for Resignation/Maternity)
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/airline-partner/campaigns")}
          className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700"
        >
          Quay lại
        </button>
      </div>

      <CampaignInfo campaign={data} />
    </div>
  );
};

export default CampaignDetail;
