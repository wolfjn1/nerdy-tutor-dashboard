export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900">
      {children}
    </div>
  )
} 