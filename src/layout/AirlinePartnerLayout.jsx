import React from 'react'
import SidebarAirlinePartner from '../components/AirlinePartnerComponent/SidebarAirlinePartner';

const AirlinePartnerLayout = ({children}) => {
    return (
        <div className="flex flex-col w-screen h-screen overflow-hidden">
    
          <div className="flex flex-1 overflow-hidden">
            <div className={`w-70  shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}>
              <SidebarAirlinePartner />
            </div>
    
            <div className="flex-1 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden p-5 flex flex-col">
              <div className="flex-1 w-full h-full">{children}</div>
            </div>
          </div>
        </div>
      );
}

export default AirlinePartnerLayout