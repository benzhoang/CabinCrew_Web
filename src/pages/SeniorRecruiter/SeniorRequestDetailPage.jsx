import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCampaignRequestDetail } from "../../service/api2.js";
import RequestInfo from "../../components/SeniorRecruiterComponent/RequestInfo";

const SeniorRequestDetailPage = () => {
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
        <div className="text-gray-500">Loading request data...</div>
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

  return (
    <div className="w-full h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">
            {request.campaignName || "N/A"}
          </h1>
        </div>
        <button
          onClick={() => navigate("/senior-recruiter/requests")}
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

export default SeniorRequestDetailPage;
