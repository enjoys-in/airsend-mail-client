
import { HeroSection } from "./hero-section";
import { ContactUsSection } from "./contact-us-section";
import { FeaturedSection } from "./featured-section";
import FAQ from "./FaqSection";
import Features from "./features";
import { Feedback } from "./feedback";
import HeroSection2 from "./hero-section2";


export function LandingPage() {
    return (
        <div>
            <HeroSection />
            <HeroSection2 />
            <FeaturedSection />
            <Features />
            <Feedback />
            <ContactUsSection />
            <FAQ />
        </div>
    );
}