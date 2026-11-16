import LandingClientLayout from "./LandingClientLayout";

// The landing pages are public. Signed-in visitors see the same content with a
// dashboard link in the header, so there is no session read or redirect here.
export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LandingClientLayout>{children}</LandingClientLayout>;
}
