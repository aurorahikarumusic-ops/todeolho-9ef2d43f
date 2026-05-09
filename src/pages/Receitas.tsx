import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Zap, 
  Moon, 
  Sparkles,
  Filter,
  Bookmark,
  ChevronRight,
  PlayCircle,
  Info
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Recipe {
  id: number;
  title: string;
  category: string;
  time: string;
  servings: string;
  symptom: string;
  tags: string[];
  image: string;
  benefits: string;
  calories: string;
  ingredients: string[];
  steps: string[];
  subs: string;
}

const RECIPES: Recipe[] = [
  {
    id: 1,
    title: "Kefir com Frutas Amarelas e Granola de Sementes",
    category: "Café da Manhã",
    time: "10 min",
    servings: "1 pessoa",
    symptom: "Digestão",
    tags: ["Vegetariana", "Probiótico"],
    image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=300&fit=crop",
    benefits: "Rico em lactobacilos vivos que equilibram a microbiota e melhoram o humor.",
    calories: "280 kcal",
    ingredients: ["200ml de kefir de leite", "1/2 manga picada", "1 colher (sopa) de semente de girassol", "1 colher (chá) de mel (opcional)"],
    steps: ["Coloque o kefir em um bowl.", "Adicione a manga picada.", "Finalize com as sementes e o mel.", "Consuma imediatamente."],
    subs: "Substitua a manga por mamão para ajudar ainda mais no intestino preso."
  },
  {
    id: 2,
    title: "Smoothie 'Adeus Ondas de Calor' (Linhaça + Amora)",
    category: "Lanche",
    time: "5 min",
    servings: "1 pessoa",
    symptom: "Ondas de Calor",
    tags: ["Vegana", "Low Carb"],
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop",
    benefits: "As lignanas da linhaça ajudam no equilíbrio do estrogênio.",
    calories: "190 kcal",
    ingredients: ["1 xícara de amoras congeladas", "1 colher (sopa) de farinha de linhaça dourada", "200ml de leite de coco", "Gelo"],
    steps: ["Bata tudo no liquidificador até ficar cremoso.", "Se desejar, adicione gotas de stevia."],
    subs: "Pode usar morango ou mirtilo no lugar das amoras."
  },
  {
    id: 3,
    title: "Bowl de Quinoa, Abóbora e Grão-de-Bico Tostado",
    category: "Almoço",
    time: "25 min",
    servings: "2 pessoas",
    symptom: "Energia",
    tags: ["Vegana", "Alto em Fibras"],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    benefits: "Combinação de carboidratos complexos e fibras que evita picos de insulina.",
    calories: "420 kcal",
    ingredients: ["1 xícara de quinoa cozida", "2 xícaras de abóbora cabotiá em cubos", "1 lata de grão-de-bico cozido", "Azeite e alecrim"],
    steps: ["Tempere a abóbora e o grão-de-bico com azeite e alecrim.", "Leve ao forno por 20 min ou airfryer por 12 min.", "Misture com a quinoa cozida e sirva."],
    subs: "Substitua a abóbora por batata doce."
  },
  {
    id: 4,
    title: "Sopa 'Ventre Plano' (Creme de Chuchu e Alho-Poró)",
    category: "Jantar",
    time: "20 min",
    servings: "2 pessoas",
    symptom: "Inchaço",
    tags: ["Detox", "Leve"],
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
    benefits: "Altamente diurética e de fácil digestão, ideal para evitar o inchaço noturno.",
    calories: "150 kcal",
    ingredients: ["3 chuchus descascados", "1 talo de alho-poró fatiado", "500ml de caldo de legumes caseiro", "Sal e pimenta"],
    steps: ["Refogue o alho-poró.", "Adicione o chuchu e o caldo.", "Cozinhe até ficar macio e bata no liquidificador.", "Finalize com fios de azeite."],
    subs: "Pode adicionar um pouco de gengibre para potencializar a queima calórica."
  },
  {
    id: 5,
    title: "Moqueca de Ovos com Leite de Coco e Dendê",
    category: "Almoço",
    time: "20 min",
    servings: "2 pessoas",
    symptom: "Saciedade",
    tags: ["Ovo-lacto", "Brasileira"],
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop",
    benefits: "Proteína de alta qualidade com gorduras boas que auxiliam na produção hormonal.",
    calories: "350 kcal",
    ingredients: ["4 ovos", "200ml de leite de coco", "1 cebola fatiada", "1 colher (sopa) de azeite de dendê", "Coentro"],
    steps: ["Faça um refogado com cebola e dendê.", "Adicione o leite de coco e deixe ferver.", "Quebre os ovos com cuidado sobre o molho.", "Tampe e cozinhe por 5 min."],
    subs: "Se não gostar de dendê, use apenas azeite de oliva e páprica defumada."
  },
  {
    id: 6,
    title: "Mousse de Abacate com Cacau 70%",
    category: "Sobremesa",
    time: "10 min",
    servings: "2 pessoas",
    symptom: "Ansiedade",
    tags: ["Low Carb", "Sem Açúcar"],
    image: "https://images.unsplash.com/photo-1528740561666-dc2479da08ad?w=400&h=300&fit=crop",
    benefits: "O magnésio do cacau e as gorduras do abacate ajudam no relaxamento muscular.",
    calories: "210 kcal",
    ingredients: ["1 abacate pequeno maduro", "3 colheres (sopa) de cacau em pó", "Adoçante de sua preferência (eritritol ou xilitol)"],
    steps: ["Bata o abacate, o cacau e o adoçante no processador até ficar homogêneo.", "Leve à geladeira por 30 min antes de servir."],
    subs: "Pode adicionar raspas de laranja para um sabor cítrico."
  }
];

export default function Receitas() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [favorites, setFavorites] = useState<number[]>([]);

  const categories = ["Todas", "Café da Manhã", "Almoço", "Lanche", "Jantar", "Sobremesa"];

  const filteredRecipes = RECIPES.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.ingredients.some(i => i.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "Todas" || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
    toast.success(favorites.includes(id) ? "Removido dos favoritos" : "Adicionado aos favoritos");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header & Search */}
      <header className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Cozinha Flora</h2>
            <p className="text-gray-500 font-medium">Receitas que abraçam seu intestino e seu ciclo.</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Buscar por ingrediente ou nome..." 
                className="pl-12 rounded-full py-6 border-none shadow-sm bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-full h-12 w-12 p-0 border-none bg-white shadow-sm">
              <Filter className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "secondary"}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-6 h-10 border-none shadow-sm transition-all ${
                selectedCategory === cat ? "bg-[#2A8C7E] text-white" : "bg-white text-gray-500 hover:bg-[#A3D9D3]/10"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </header>

      {/* Recommended Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Sparkles className="w-5 h-5 text-[#2A8C7E]" />
          <h3 className="text-xl font-bold text-gray-800">Recomendadas para você</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.slice(0, 3).map(recipe => (
            <Card key={recipe.id} className="group rounded-[2.5rem] overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    onClick={() => toggleFavorite(recipe.id)}
                    className={`h-10 w-10 rounded-full p-0 border-none ${favorites.includes(recipe.id) ? 'bg-[#FBCFE8] text-white' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-[#2A8C7E]'}`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(recipe.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-[#2A8C7E] text-white border-none px-3 py-1 rounded-full">{recipe.symptom}</Badge>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                   <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.time}</div>
                   <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {recipe.servings}</div>
                </div>
                <h4 className="text-xl font-black text-gray-900 group-hover:text-[#2A8C7E] transition-colors leading-tight h-14 overflow-hidden">
                  {recipe.title}
                </h4>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-[#FDF8F3] hover:bg-[#A3D9D3]/20 text-[#2A8C7E] border-none rounded-full py-6 font-bold flex items-center gap-2 group/btn">
                      Ver Receita <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden bg-white max-h-[90vh]">
                    <ScrollArea className="h-full max-h-[90vh]">
                      <div className="relative h-72">
                         <img src={recipe.image} className="w-full h-full object-cover" alt={recipe.title} />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                            <h2 className="text-3xl font-black text-white">{recipe.title}</h2>
                         </div>
                      </div>
                      <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                           <div className="bg-[#FDF8F3] p-4 rounded-3xl text-center">
                              <Clock className="w-5 h-5 text-[#2A8C7E] mx-auto mb-1" />
                              <span className="text-xs text-gray-500 block">Tempo</span>
                              <span className="font-bold text-gray-900">{recipe.time}</span>
                           </div>
                           <div className="bg-[#FDF8F3] p-4 rounded-3xl text-center">
                              <Users className="w-5 h-5 text-[#2A8C7E] mx-auto mb-1" />
                              <span className="text-xs text-gray-500 block">Porções</span>
                              <span className="font-bold text-gray-900">{recipe.servings}</span>
                           </div>
                           <div className="bg-[#FDF8F3] p-4 rounded-3xl text-center">
                              <ChefHat className="w-5 h-5 text-[#2A8C7E] mx-auto mb-1" />
                              <span className="text-xs text-gray-500 block">Dificuldade</span>
                              <span className="font-bold text-gray-900">Fácil</span>
                           </div>
                           <div className="bg-[#FDF8F3] p-4 rounded-3xl text-center">
                              <Info className="w-5 h-5 text-[#2A8C7E] mx-auto mb-1" />
                              <span className="text-xs text-gray-500 block">Calorias</span>
                              <span className="font-bold text-gray-900">{recipe.calories}</span>
                           </div>
                        </div>

                        <div className="bg-[#2A8C7E]/5 p-6 rounded-[2rem] border border-[#2A8C7E]/10">
                           <h4 className="flex items-center gap-2 text-[#2A8C7E] font-bold mb-2">
                             <Heart className="w-4 h-4 fill-current" /> Benefícios Flora
                           </h4>
                           <p className="text-gray-700 leading-relaxed">{recipe.benefits}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                           <div className="space-y-4">
                              <h4 className="text-xl font-bold text-gray-900">Ingredientes</h4>
                              <ul className="space-y-3">
                                 {recipe.ingredients.map((ing, i) => (
                                   <li key={i} className="flex items-start gap-3 text-gray-600">
                                      <div className="w-2 h-2 rounded-full bg-[#A3D9D3] mt-2" />
                                      <span>{ing}</span>
                                   </li>
                                 ))}
                              </ul>
                           </div>
                           <div className="space-y-4">
                              <h4 className="text-xl font-bold text-gray-900">Modo de Preparo</h4>
                              <ul className="space-y-4">
                                 {recipe.steps.map((step, i) => (
                                   <li key={i} className="flex gap-4">
                                      <span className="text-3xl font-black text-[#A3D9D3]/30 leading-none">{i + 1}</span>
                                      <span className="text-gray-600 text-sm leading-relaxed">{step}</span>
                                   </li>
                                 ))}
                              </ul>
                           </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                           <div className="flex items-center gap-3">
                              <ArrowRightLeft className="w-5 h-5 text-[#2A8C7E]" />
                              <p className="text-sm text-gray-500"><strong>Dica de Substituição:</strong> {recipe.subs}</p>
                           </div>
                           <Button className="bg-[#2A8C7E] hover:bg-[#2A8C7E]/90 rounded-full px-8 py-6 h-auto text-lg font-bold flex items-center gap-2">
                             <PlayCircle className="w-5 h-5" /> Cozinhar Agora
                           </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Grid of all recipes */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-2xl font-black text-gray-900">Explorar todas as receitas</h3>
           <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{filteredRecipes.length} resultados</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {filteredRecipes.map(recipe => (
             <Card key={recipe.id} className="group rounded-[2rem] overflow-hidden border-none shadow-sm hover:shadow-md transition-all bg-white">
                <div className="relative h-40 overflow-hidden">
                   <img src={recipe.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                   <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#2A8C7E] text-[10px] font-bold border-none">{recipe.category}</Badge>
                </div>
                <div className="p-5 space-y-3">
                   <h5 className="font-bold text-gray-900 group-hover:text-[#2A8C7E] transition-colors leading-tight line-clamp-2 h-10">
                     {recipe.title}
                   </h5>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                         <Clock className="w-3 h-3" /> {recipe.time}
                      </div>
                      <div className="p-2 bg-[#FDF8F3] rounded-lg">
                        {recipe.symptom === "Inchaço" && <Info className="w-4 h-4 text-[#2A8C7E]" />}
                        {recipe.symptom === "Digestão" && <Heart className="w-4 h-4 text-[#2A8C7E]" />}
                        {recipe.symptom === "Energia" && <Zap className="w-4 h-4 text-[#2A8C7E]" />}
                        {recipe.symptom === "Ondas de Calor" && <Sparkles className="w-4 h-4 text-[#2A8C7E]" />}
                        {recipe.symptom === "Ansiedade" && <Moon className="w-4 h-4 text-[#2A8C7E]" />}
                      </div>
                   </div>
                </div>
             </Card>
           ))}
        </div>
      </section>

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <div className="text-center py-20 space-y-4">
           <div className="p-6 bg-[#FDF8F3] rounded-full w-24 h-24 flex items-center justify-center mx-auto">
              <Search className="w-10 h-10 text-[#A3D9D3]" />
           </div>
           <h4 className="text-2xl font-bold text-gray-900">Nenhuma receita encontrada</h4>
           <p className="text-gray-500">Tente buscar por outro ingrediente ou mude o filtro de categoria.</p>
           <Button onClick={() => {setSearch(""); setSelectedCategory("Todas");}} variant="link" className="text-[#2A8C7E] font-bold">Limpar todos os filtros</Button>
        </div>
      )}
    </div>
  );
}

const ArrowRightLeft = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m16 3 4 4-4 4" />
    <path d="M20 7H4" />
    <path d="m8 21-4-4 4-4" />
    <path d="M4 17h16" />
  </svg>
);
