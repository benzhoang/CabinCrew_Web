import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCampaignDetail } from "../../service/api2";
import Approvers from "../../components/SeniorRecruiterComponent/CampaignDetail/Approvers";
import DetailInfo from "../../components/SeniorRecruiterComponent/CampaignDetail/DetailInfo";
import PendingCampaignDetail from "../../components/SeniorRecruiterComponent/CampaignDetail/PendingCampaignDetail";

//import ApprovalLog from "../../components/SeniorRecruiterComponent/CampaignDetail/ApprovalLog";
//import Followers from "../../components/SeniorRecruiterComponent/CampaignDetail/Followers";

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // const timeline = useMemo(
  //   () => [
  //     { time: "15:24", text: "Request created", by: "Đặng Bích Thu Thủy" },
  //     {
  //       time: "17:51",
  //       text: "Tony Quok approved the request",
  //       by: "Tony Quok",
  //     },
  //     {
  //       time: "18:08",
  //       text: "Hoàng Nhật Trường approved the request",
  //       by: "Hoàng Nhật Trường",
  //     },
  //     {
  //       time: "19:30",
  //       text: "Lương Thị Phúc approved the request",
  //       by: "Lương Thị Phúc",
  //     },
  //   ],
  //   []
  // );

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
          setError(result.error || "Error when loading campaign detail");
        }
      } catch (err) {
        setError(err.message || "Error when loading campaign detail");
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
    return <PendingCampaignDetail campaign={campaignData} />;
  }

  const goBack = () => navigate("/senior-recruiter/campaigns");

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">
            {campaignData?.campaignName || "No campaign name"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {campaignData.description || "No description"}
          </p>
        </div>
        <button
          onClick={goBack}
          className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DetailInfo campaign={campaignData} />
        </div>

        <div className="space-y-6">
          <Approvers reviewedBy={campaignData?.reviewedBy} />
          {/* <Followers /> */}
          {/* <ApprovalLog timeline={timeline} /> */}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
