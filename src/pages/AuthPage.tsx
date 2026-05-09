import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Bem-vinda ao GutMenopausa!");
    window.location.href = "/app/dashboard";
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#2A8C7E] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <span className="text-white font-bold text-3xl">G</span>
          </div>
          <h1 className="text-4xl font-bold text-[#444444]">GutMenopausa</h1>
          <p className="text-[#444444]/60 text-lg italic">Equilíbrio intestinal para sua melhor fase.</p>
        </div>

        <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <Tabs defaultValue="login" onValueChange={(v) => setIsLogin(v === "login")}>
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#F8F5F1] p-1 rounded-full">
              <TabsTrigger value="login" className="rounded-full data-[state=active]:bg-[#A3D9D3] data-[state=active]:text-[#2A8C7E]">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-full data-[state=active]:bg-[#A3D9D3] data-[state=active]:text-[#2A8C7E]">Cadastrar</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#444444] font-semibold ml-2">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="rounded-full border-[#E8C7C8]/30 px-6 py-6 h-auto focus-visible:ring-[#A3D9D3]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass" className="text-[#444444] font-semibold ml-2">Senha</Label>
                <Input 
                  id="pass" 
                  type="password" 
                  className="rounded-full border-[#E8C7C8]/30 px-6 py-6 h-auto focus-visible:ring-[#A3D9D3]"
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                  <Label className="text-[#444444] font-semibold ml-2">Qual sua fase atual?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="outline" className="rounded-full border-[#E8C7C8]/30 hover:bg-[#A3D9D3]/20 hover:border-[#A3D9D3]">
                      Perimenopausa
                    </Button>
                    <Button type="button" variant="outline" className="rounded-full border-[#E8C7C8]/30 hover:bg-[#A3D9D3]/20 hover:border-[#A3D9D3]">
                      Menopausa
                    </Button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full bg-[#2A8C7E] hover:bg-[#2A8C7E]/90 text-white rounded-full py-7 h-auto text-xl font-bold shadow-lg shadow-[#2A8C7E]/20 mt-4 transition-all active:scale-[0.98]">
                {isLogin ? "Entrar na Plataforma" : "Começar Agora"}
              </Button>
            </form>
          </Tabs>
        </Card>

        <p className="text-sm text-muted-foreground">
          Ao entrar, você concorda com nossos <br />
          <span className="underline cursor-pointer hover:text-[#2A8C7E]">Termos de Uso</span> e <span className="underline cursor-pointer hover:text-[#2A8C7E]">Política de Privacidade</span>.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
