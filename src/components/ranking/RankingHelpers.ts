import { getDadTitle } from "@/lib/constants";

export function getPositionDescription(pos: number, total: number): string {
  if (total <= 1) return "Único pai aqui. Primeiro e último ao mesmo tempo.";
  if (pos === 0) return "Reinando. Suspeito, mas reinando.";
  if (pos === 1) return "Quase lá. Tão perto e tão longe.";
  if (pos === 2) return "Bronze. Poderia ser pior. E provavelmente vai ser.";
  if (pos <= 4) return "Top 5. Quase no pódio. Quase.";
  if (pos <= 9) return "Meio da tabela. Como na vida.";
  if (pos === total - 1) return "Último. A lenda viva da vergonha.";
  if (pos >= total - 3) return "Zona de rebaixamento. Cuidado.";
  return "Existindo no ranking. Parabéns (não).";
}

export function getMomPositionDescription(pos: number, total: number): string {
  if (total <= 1) return "Só um pai no radar. Coitado. Coitada de você.";
  if (pos === 0) return "Seu marido lidera. Aproveite. Vai durar pouco.";
  if (pos === 1) return "Quase lá. Quase bom o suficiente.";
  if (pos === 2) return "Pódio. Poderia ser pior. E será.";
  if (pos <= 4) return "Top 5. Tá no caminho. Devagar.";
  if (pos === total - 1) return "Último. Você sabia desde o começo.";
  return "Existindo. Já é alguma coisa, né?";
}

export function getShareText(name: string, pos: number, total: number, pts: number): string {
  const posLabel = `#${pos + 1}`;
  if (pos <= 2) return `👑 Tô no PÓDIO dos pais no *Estou de Olho* 👁️\nPosição ${posLabel} com ${pts} pontos!\nSim, eu. Guarda esse print. 🏆`;
  if (pos === total - 1) return `💀 Último lugar no ranking dos pais no *Estou de Olho* 👁️\n${pts} pontos. Mas pelo menos apareço. 😅`;
  return `⚡ Posição ${posLabel} no ranking dos pais no *Estou de Olho* 👁️\n${pts} pontos. Subindo! (Devagar, mas subindo.)`;
}

export function ranking_diff(_profile: any, pos: number) {
  return Math.max(1, 10 - (pos * 2));
}

export function getPositionStyle(pos: number, isMom: boolean) {
  if (isMom) {
    if (pos === 0) return { borderLeft: "4px solid hsl(var(--mom-accent))", background: "linear-gradient(135deg, hsl(var(--mom-accent) / 0.1), hsl(var(--card)))" };
    if (pos === 1) return { borderLeft: "4px solid hsl(var(--mom-border))", background: "linear-gradient(135deg, hsl(var(--mom-bg) / 0.5), hsl(var(--card)))" };
    if (pos === 2) return { borderLeft: "4px solid hsl(var(--mom-accent) / 0.5)", background: "linear-gradient(135deg, hsl(var(--mom-accent) / 0.05), hsl(var(--card)))" };
    return {};
  }
  if (pos === 0) return { borderLeft: "4px solid hsl(var(--dad-accent))", background: "linear-gradient(135deg, hsl(var(--dad-accent) / 0.1), hsl(var(--card)))" };
  if (pos === 1) return { borderLeft: "4px solid hsl(var(--dad-border))", background: "linear-gradient(135deg, hsl(var(--dad-bg) / 0.5), hsl(var(--card)))" };
  if (pos === 2) return { borderLeft: "4px solid hsl(var(--dad-accent) / 0.5)", background: "linear-gradient(135deg, hsl(var(--dad-accent) / 0.05), hsl(var(--card)))" };
  return {};
}
