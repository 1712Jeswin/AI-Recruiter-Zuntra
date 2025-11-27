import SpeechToText from "../_components/SpeechToText";


export default function SpeechTestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎧 Speech Recognition Test</h1>
      <SpeechToText />
    </div>
  );
}
