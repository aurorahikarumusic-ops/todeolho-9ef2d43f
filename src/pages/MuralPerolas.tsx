import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Gem, Send, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const REACTION_EMOJIS = ["😂", "🤦", "👁️", "💀", "🏆"];

export default function MuralPerolas() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const isMom = profile?.role === "mae";
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["pearl-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pearl_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: reactions = [] } = useQuery({
    queryKey: ["pearl-reactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pearl_reactions")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const createPost = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("pearl_posts").insert({
        user_id: user!.id,
        display_name: profile?.display_name || "Mãe",
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pearl-posts"] });
      setNewPost("");
      setPosting(false);
      toast.success("Pérola publicada! 💎");
    },
    onError: () => toast.error("Erro ao publicar"),
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("pearl_posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pearl-posts"] });
      qc.invalidateQueries({ queryKey: ["pearl-reactions"] });
      toast.success("Post removido");
    },
  });

  const toggleReaction = useMutation({
    mutationFn: async ({ postId, emoji }: { postId: string; emoji: string }) => {
      const existing = reactions.find(
        (r) => r.post_id === postId && r.user_id === user!.id && r.emoji === emoji
      );
      if (existing) {
        const { error } = await supabase.from("pearl_reactions").delete().eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pearl_reactions").insert({
          post_id: postId,
          user_id: user!.id,
          emoji,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pearl-reactions"] }),
  });

  const handleSubmit = () => {
    const trimmed = newPost.trim();
    if (!trimmed || trimmed.length < 10) {
      toast.error("Conta mais! Mínimo de 10 caracteres 😄");
      return;
    }
    if (trimmed.length > 500) {
      toast.error("Máximo de 500 caracteres");
      return;
    }
    createPost.mutate(trimmed);
  };

  const getPostReactions = (postId: string) => {
    const postReactions = reactions.filter((r) => r.post_id === postId);
    const grouped: Record<string, { count: number; userReacted: boolean }> = {};
    for (const r of postReactions) {
      if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, userReacted: false };
      grouped[r.emoji].count++;
      if (r.user_id === user?.id) grouped[r.emoji].userReacted = true;
    }
    return grouped;
  };

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 shadow-lg shadow-pink-500/30">
          <Gem className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-pink-500 to-fuchsia-600 bg-clip-text text-transparent">
            Mural de Pérolas
          </h1>
          <p className="font-body text-xs text-muted-foreground">
            As maiores cabeçadas dos maridos 💎
          </p>
        </div>
      </div>

      {/* Post form — only for moms */}
      {isMom && (
        <Card className="border-pink-300/50 bg-gradient-to-br from-pink-50 to-fuchsia-50 dark:from-pink-950/20 dark:to-fuchsia-950/20">
          <CardContent className="p-4 space-y-3">
            {!posting ? (
              <button
                onClick={() => setPosting(true)}
                className="w-full text-left font-body text-sm text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-lg border border-dashed border-pink-300/50 hover:border-pink-400"
              >
                💎 Conta a pérola que ele soltou hoje...
              </button>
            ) : (
              <>
                <Textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder='Ex: "Meu marido esqueceu o filho na natação e trouxe a mochila de outra criança. Alguém mais?"'
                  className="min-h-[80px] font-body text-sm border-pink-300/50 focus:border-pink-500"
                  maxLength={500}
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-body">
                    {newPost.length}/500
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPosting(false);
                        setNewPost("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={createPost.isPending}
                      className="bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Publicar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Posts list */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-4xl animate-bounce">💎</div>
          <p className="font-body text-sm text-muted-foreground mt-2">Carregando pérolas...</p>
        </div>
      ) : posts.length === 0 ? (
        <Card className="border-dashed border-pink-300/50">
          <CardContent className="p-8 text-center">
            <Gem className="w-12 h-12 text-pink-300 mx-auto mb-3" />
            <p className="font-display font-bold text-foreground">Nenhuma pérola ainda</p>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {isMom
                ? "Seja a primeira a compartilhar uma cabeçada do seu marido! 😄"
                : "As mães ainda não postaram nenhuma pérola. Sorte sua... por enquanto. 😏"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const grouped = getPostReactions(post.id);
            const isAuthor = post.user_id === user?.id;
            return (
              <Card
                key={post.id}
                className="border-pink-200/30 hover:border-pink-300/50 transition-colors overflow-hidden"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Author + time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center text-white font-display text-xs font-bold">
                        {post.display_name?.charAt(0)?.toUpperCase() || "M"}
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold text-foreground">
                          {post.display_name || "Mãe"}
                        </p>
                        <p className="font-body text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                    {isAuthor && (
                      <button
                        onClick={() => deletePost.mutate(post.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <p className="font-body text-sm text-foreground leading-relaxed">
                    {post.content}
                  </p>

                  {/* Reactions */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {REACTION_EMOJIS.map((emoji) => {
                      const data = grouped[emoji];
                      const active = data?.userReacted;
                      return (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction.mutate({ postId: post.id, emoji })}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body transition-all ${
                            active
                              ? "bg-pink-100 dark:bg-pink-900/30 border border-pink-400 scale-105"
                              : "bg-muted/50 border border-transparent hover:bg-muted hover:scale-105"
                          }`}
                        >
                          <span className="text-sm">{emoji}</span>
                          {data && data.count > 0 && (
                            <span className={`text-[10px] font-semibold ${active ? "text-pink-600 dark:text-pink-400" : "text-muted-foreground"}`}>
                              {data.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
