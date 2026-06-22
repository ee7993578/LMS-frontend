import PageHero from "../../components/landing/PageHero";
import Testimonials from "../../components/landing/Testimonials";
import CTASection from "../../components/landing/CTASection";

export default function TestimonialsPage() {
  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="Library owners, admins, and students — in their own words"
      />
      <Testimonials />
      <CTASection />
    </>
  );
}
