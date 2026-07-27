(function () {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "ABSS Nexus Technologies",
    alternateName: "ABSS Nexus",
    url: "https://shubhambca.in/",
    logo: "https://shubhambca.in/public/assets/images/LogoGenerated.png",
    description:
      "ABSS Nexus Technologies provides website development, application development, UI/UX design, landing pages, portfolios, maintenance, and digital solutions.",
    telephone: "+918757928673",
    email: "abssnexus@gmail.com",
    founder: {
      "@type": "Person",
      name: "Shubham Kumar",
    },
    sameAs: [
      "https://www.linkedin.com/in/shubham-abss-nexus-technologies/",
      "https://github.com/Shubham-ABSS-Nexus-Technologies",
      "https://www.instagram.com/shubham._tech/",
      "https://x.com/SubhamKuma43099",
    ],
    areaServed: "India",
    serviceType: [
      "Website Development",
      "Application Development",
      "UI/UX Design",
      "Business Landing Pages",
      "Portfolio Websites",
      "Website Maintenance",
    ],
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(organizationSchema);
  document.head.appendChild(script);
})();
