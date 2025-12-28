import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RequestInfo from "../../components/AirlinePartnerComponent/RequestDetail/RequestInfo";
import PendingRequestDetail from "../../components/AirlinePartnerComponent/RequestDetail/PendingRequestDetail";
import { getCampaignRequestDetail } from "../../service/api2.js";

const AirlineRequestDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch request detail from API
  useEffect(() => {
    const fetchRequestDetail = async () => {
      if (!id) {
        setError("Request ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getCampaignRequestDetail(id);

        if (result.success && result.data) {
          setRequest(result.data);
        } else {
          setError(result.error || "Error loading request detail");
        }
      } catch (err) {
        setError(err.message || "Error loading request detail");
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600">Loading request data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-gray-500">No data found</div>
      </div>
    );
  }

  // Kiểm tra nếu request đang chờ phê duyệt (pending)
  const status = request.status?.toLowerCase() || "";
  if (status === "pending") {
    return <PendingRequestDetail request={request} />;
  }

  return (
    <div className="w-full h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">
            {request.campaignName || "No campaign name"}
          </h1>
        </div>
        <button
          onClick={() => navigate("/airline-partner/requests")}
          className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          Back
        </button>
      </div>

      <div className="space-y-5">
        <RequestInfo data={request} />
      </div>
    </div>
  );
};

export default AirlineRequestDetailPage;
