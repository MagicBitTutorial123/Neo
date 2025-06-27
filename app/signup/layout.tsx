import PageTransition from "../PageTransition";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
