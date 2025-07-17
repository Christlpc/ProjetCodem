import { useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Entreprises from './components/Entreprises';
import Avantages from './components/Avantages';
import Footer from './components/Footer';
import HeroBannerImage from './components/HeroBannerImage';
import DemandeDevisStepper from './formulaire/DemandeDevisStepper';

function App() {
  const heroRef = useRef(null);
  const servicesRef = useRef(null);
  const entreprisesRef = useRef(null);
  const contactRef = useRef(null);
  const demandeDevisStepperRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        scrollToHero={() => scrollToSection(heroRef)}
        scrollToServices={() => scrollToSection(servicesRef)}
        scrollToEntreprises={() => scrollToSection(entreprisesRef)}
        scrollToContact={() => scrollToSection(contactRef)}
        scrollToDemandeDevisStepper={() => scrollToSection(demandeDevisStepperRef)}
      />
      <main>
        <section ref={heroRef}>
          <Hero />
          <HeroBannerImage />
        </section>
        <section ref={servicesRef}>
          <Services />
        </section>
        <section ref={entreprisesRef}>
          <Entreprises />
        </section>
        <section>
          <Avantages />
          <section ref={demandeDevisStepperRef}>
            <DemandeDevisStepper />
          </section>
        </section>
      </main>
      <footer ref={contactRef}>
        <Footer />
      </footer>
    </div>
  );
}

export default App;
