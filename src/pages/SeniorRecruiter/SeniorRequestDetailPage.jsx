import { useLocation, useNavigate } from "react-router-dom";
import RequestInfo from "../../components/SeniorRecruiterComponent/RequestInfo";


const SeniorRequestDetailPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation()
  const request = state?.request

  return (
    <div className="w-full h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                {request.title}
              </h1>
              <p className="text-slate-600 mt-1 text-sm">
                {request.code}
              </p>
            </div>
        </div>
        <button
          onClick={() => navigate("/senior-recruiter/requests")}
          className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700"
        >
          Quay lại
        </button>
      </div>

      <div className="space-y-5">
        <RequestInfo />
      </div>
    </div>
  );
};

export default SeniorRequestDetailPage;