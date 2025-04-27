import ChatInterface from "./components/ChatInterface";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gray-100">
      <div className="w-full max-w-4xl mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Health Assistant</h1>
        <p className="text-gray-600">
          Get preliminary health information based on WHO standards
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>Note:</strong> This assistant cannot diagnose conditions. Always consult a doctor for medical advice.
        </div>
      </div>
      <div className="w-full max-w-4xl h-[70vh] bg-white rounded-xl shadow-lg overflow-hidden">
        <ChatInterface />
      </div>
    </main>
  );
}