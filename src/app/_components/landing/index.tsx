
import { HeroSection } from "./hero-section";
import { ContactUsSection } from "./contact-us-section";
import { FeaturedSection } from "./featured-section";
import FAQ from "./FaqSection";
import Features from "./features";
import { Feedback } from "./feedback";

export function LandingPage() {
    return (
        <div >
            <HeroSection />
            <FeaturedSection />
            <Features />
            <Feedback />
            <ContactUsSection />
            <FAQ />
        </div>
    );
}