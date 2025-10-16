import { useNavigate } from "react-router-dom";
import BatchInfo from "../../components/AirlinePartnerComponent/BatchInfo";
import CampaignInfo from "../../components/AirlinePartnerComponent/CampaignInfo";

const CampaignDetail = () => {
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

      <div className="space-y-5">
        <CampaignInfo />
        <BatchInfo />
      </div>
    </div>
  );
};

export default CampaignDetail;
