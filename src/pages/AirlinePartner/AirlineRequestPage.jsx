import CampaignList from "../../components/AirlinePartnerComponent/CampaignList";

const AirlineRequestPage = () => {
  return (
    <div className="p-6">
      <CampaignList search="" campaigns={undefined} />
    </div>
  );
};

export default AirlineRequestPage;