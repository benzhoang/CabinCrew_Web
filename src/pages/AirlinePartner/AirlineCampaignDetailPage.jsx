import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCampaignDetail } from "../../service/api2";
import Loading from "../../components/Loading";
import BatchInfo from "../../components/AirlinePartnerComponent/CampaignDetail/BatchInfo";
import CampaignInfo from "../../components/AirlinePartnerComponent/CampaignDetail/CampaignInfo";
import PendingCampaignDetail from "../../components/AirlinePartnerComponent/CampaignDetail/PendingCampaignDetail";

const AirlineCampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch campaign detail from API
  useEffect(() => {
    const fetchCampaignDetail = async () => {
      if (!id) {
        setError("Không tìm thấy ID chiến dịch");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getCampaignDetail(id);

        if (result.success && result.data) {
          setCampaignData(result.data);
        } else {
          setError(result.error || "Lỗi khi tải chi tiết chiến dịch");
        }
      } catch (err) {
        setError(err.message || "Lỗi khi tải chi tiết chiến dịch");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignDetail();
  }, [id]);

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-red-600">Lỗi: {error}</div>
      </div>
    );
  }

  if (!campaignData) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-500">Không tìm thấy dữ liệu</div>
      </div>
    );
  }

  // Kiểm tra nếu campaign đang chờ phê duyệt (pending)
  const status = campaignData.status?.toLowerCase() || "";
  if (status === "pending") {
    return <PendingCampaignDetail campaign={campaignData} />;
  }

  const goBack = () => navigate("/airline-partner/campaigns");

  return (
    <div className="w-full h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">
            {campaignData?.campaignName || ""}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {campaignData.description || ""}
          </p>
        </div>
        <button
          onClick={goBack}
          className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Quay lại
        </button>
      </div>

      <div className="space-y-5">
        <CampaignInfo campaign={campaignData} />
        <BatchInfo campaign={campaignData} />
      </div>
    </div>
  );
};

export default AirlineCampaignDetailPage;
