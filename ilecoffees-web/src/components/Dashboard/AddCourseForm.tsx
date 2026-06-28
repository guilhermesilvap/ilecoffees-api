import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface AddCourseFormProps {
  onSuccess?: () => void;
}

const LEVEL_MAP: Record<string, string> = {
  beginner: "BEGINNER",
  intermediate: "INTERMEDIATE",
  advanced: "ADVANCED",
};

const emptyForm = {
  title: "",
  description: "",
  price: "",
  workloadHours: "",
  level: "",
};

export function AddCourseForm({ onSuccess }: AddCourseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState(emptyForm);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.level) {
      toast({ title: "Selecione o nível do curso.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const body = new FormData();
      body.append("title", formData.title);
      body.append("description", formData.description);
      body.append("price", formData.price);
      body.append("workloadHours", formData.workloadHours);
      body.append("level", LEVEL_MAP[formData.level] ?? formData.level.toUpperCase());
      if (photoFile) body.append("photo", photoFile);

      await api.post("/admin/courses", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({ title: "Curso criado com sucesso!", description: `${formData.title} adicionado ao catálogo.` });
      setIsOpen(false);
      setFormData(emptyForm);
      setPhotoFile(null);
      setPhotoPreview(null);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erro ao criar curso.";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="coffee" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Criar Curso
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Curso</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais do curso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Capa */}
              <div className="space-y-2">
                <Label>Imagem de Capa</Label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 border-2 border-dashed border-border rounded-lg overflow-hidden flex items-center justify-center">
                    {photoPreview
                      ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      : <Upload className="h-6 w-6 text-muted-foreground" />}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Selecionar Imagem
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título do Curso *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => set("title", e.target.value)}
                  placeholder="Ex: Curso Completo de Torra Artesanal"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="O que os alunos vão aprender..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={e => set("price", e.target.value)}
                    placeholder="Ex: 297.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workloadHours">Carga horária (h) *</Label>
                  <Input
                    id="workloadHours"
                    type="number"
                    min="1"
                    value={formData.workloadHours}
                    onChange={e => set("workloadHours", e.target.value)}
                    placeholder="Ex: 20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Nível *</Label>
                  <Select value={formData.level} onValueChange={v => set("level", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="coffee" disabled={isLoading}>
              <BookOpen className="h-4 w-4 mr-2" />
              {isLoading ? "Criando..." : "Criar Curso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
