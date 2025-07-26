export default function TestSimplePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
      <p>If you can see this, pages are working on Netlify!</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  )
} 