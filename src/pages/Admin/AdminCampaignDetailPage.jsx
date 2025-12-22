import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCampaignDetail } from "../../service/api2";
import BatchInfo from "../../components/AdminComponent/CampaignDetail/BatchInfo";
import CampaignInfo from "../../components/AdminComponent/CampaignDetail/CampaignInfo";
import PendingCampaignInfo from "../../components/AdminComponent/CampaignDetail/PendingCampaignInfo";

const AdminCampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch campaign detail from API
  useEffect(() => {
    const fetchCampaignDetail = async () => {
      if (!id) {
        setError("Campaign ID not found");
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
          setError(result.error || "Error loading campaign detail");
        }
      } catch (err) {
        setError(err.message || "Error loading campaign detail");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!campaignData) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-500">Data not found</div>
      </div>
    );
  }

  // Kiểm tra nếu campaign đang chờ phê duyệt (pending)
  const status = campaignData.status?.toLowerCase() || "";
  if (status === "pending") {
    return <PendingCampaignInfo campaign={campaignData} />;
  }

  const goBack = () => navigate("/admin/campaigns");

  return (
    <div className="w-full h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">
            {campaignData?.campaignName || ""}
          </h1>
        </div>
        <button
          onClick={goBack}
          className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Back
        </button>
      </div>

      <div className="space-y-5">
        <CampaignInfo campaign={campaignData} />
        <BatchInfo campaign={campaignData} showBatchStatus={true} />
      </div>
    </div>
  );
};

export default AdminCampaignDetailPage;
