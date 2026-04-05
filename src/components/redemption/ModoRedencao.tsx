import { useState } from "react";
import ToneSelection from "./ToneSelection";
import LetterWriter from "./LetterWriter";
import LetterPreview from "./LetterPreview";
import SendConfirmation from "./SendConfirmation";

export type Tone = "coracao" | "leveza" | "romantico" | "gratidao";

interface Props {
  onClose: () => void;
  recipientName?: string;
  recipientId?: string;
}

export default function ModoRedencao({ onClose, recipientName, recipientId }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [tone, setTone] = useState<Tone | null>(null);
  const [content, setContent] = useState("");
  const [includeSignature, setIncludeSignature] = useState(false);
  const [letterId, setLetterId] = useState<string | null>(null);

  if (step === 1) {
    return (
      <ToneSelection
        selected={tone}
        onSelect={setTone}
        onContinue={() => setStep(2)}
        onBack={onClose}
      />
    );
  }

  if (step === 2) {
    return (
      <LetterWriter
        tone={tone!}
        content={content}
        onChange={setContent}
        onPreview={() => setStep(3)}
        onBack={() => setStep(1)}
      />
    );
  }

  if (step === 3) {
    return (
      <LetterPreview
        tone={tone!}
        content={content}
        recipientName={recipientName}
        includeSignature={includeSignature}
        onToggleSignature={setIncludeSignature}
        onSend={(id) => { setLetterId(id); setStep(4); }}
        onBack={() => setStep(2)}
        recipientId={recipientId}
      />
    );
  }

  return <SendConfirmation onClose={onClose} />;
}
