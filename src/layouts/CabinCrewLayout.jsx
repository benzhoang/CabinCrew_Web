
import NavbarCabinCrew from '../components/CabinCrewComponent/NavbarCabinCrew';
import Footer from '../pages/Candidate/Footer';

const CabinCrewLayout = ({ children }) => {
  return (
    <>
      <NavbarCabinCrew />
      {children}
      <Footer />
    </>
  )
}

export default CabinCrewLayout