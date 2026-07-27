export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
