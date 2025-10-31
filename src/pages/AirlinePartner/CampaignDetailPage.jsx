import { useLocation, useNavigate } from "react-router-dom";
import BatchInfo from "../../components/AirlinePartnerComponent/CampaignDetail/BatchInfo";
import CampaignInfo from "../../components/AirlinePartnerComponent/CampaignDetail/CampaignInfo";
import PendingCampaignDetail from "../../components/AirlinePartnerComponent/CampaignDetail/PendingCampaignDetail";

const CampaignDetailPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const campaign = state?.campaign;

  // Kiểm tra nếu campaign đang chờ phê duyệt (pending)
  if (campaign?.status === "pending") {
    return <PendingCampaignDetail campaign={campaign} />;
  }

  return (
    <div className="w-full h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              {campaign.title}
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

export default CampaignDetailPage;
