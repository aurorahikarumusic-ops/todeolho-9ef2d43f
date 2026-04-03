import { Construction } from "lucide-react";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <Construction className="w-16 h-16 text-secondary mb-4" />
      <h1 className="font-display text-2xl font-bold text-center mb-2">{title}</h1>
      <p className="font-body text-muted-foreground text-center">
        Em breve. A mãe já cobrou, relaxa. 😏
      </p>
    </div>
  );
}
