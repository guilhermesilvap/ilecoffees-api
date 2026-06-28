import { useState } from "react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Calendar, 
  CreditCard, 
  Settings, 
  Pause, 
  Play, 
  X,
  Edit3,
  Gift,
  Coffee,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionManagement() {
  const { toast } = useToast();
  const [showMorePlans, setShowMorePlans] = useState(false);

  // Dados mockados das assinaturas
  const activeSubscriptions = [
    {
      id: 1,
      name: "Assinatura Premium",
      product: "Café Especial Premium",
      quantity: "250g",
      frequency: "Mensal",
      price: 22.41,
      originalPrice: 24.90,
      nextDelivery: "2024-01-05",
      status: "active",
      discount: 10,
      deliveriesLeft: 8,
      totalDeliveries: 12,
      startDate: "2024-01-05",
      supplier: "Fazenda São José"
    },
    {
      id: 2,
      name: "Café Especial",
      product: "Blend Tradicional",
      quantity: "250g",
      frequency: "Quinzenal", 
      price: 21.90,
      originalPrice: 23.90,
      nextDelivery: "2024-12-15",
      status: "active",
      discount: 8,
      deliveriesLeft: 15,
      totalDeliveries: 24,
      startDate: "2024-06-01",
      supplier: "Café do Vale"
    }
  ];

  const availablePlans = [
    { 
      id: 1,
      name: "Explorador", 
      frequency: "Mensal", 
      price: 22.90, 
      originalPrice: 25.90,
      description: "1 café diferente por mês", 
      discount: 12,
      popular: false
    },
    { 
      id: 2,
      name: "Entusiasta", 
      frequency: "Quinzenal", 
      price: 21.90, 
      originalPrice: 25.90,
      description: "2 cafés por mês", 
      discount: 15,
      popular: true
    },
    { 
      id: 3,
      name: "Apreciador", 
      frequency: "Semanal", 
      price: 19.90, 
      originalPrice: 25.90,
      description: "4 cafés por mês", 
      discount: 23,
      popular: false
    },
    { 
      id: 4,
      name: "Connoisseur", 
      frequency: "Bi-semanal", 
      price: 18.90, 
      originalPrice: 25.90,
      description: "8 cafés por mês", 
      discount: 27,
      popular: false
    },
    { 
      id: 5,
      name: "Premium Plus", 
      frequency: "Diário", 
      price: 16.90, 
      originalPrice: 25.90,
      description: "Café todos os dias", 
      discount: 35,
      popular: false
    }
  ];

  const visiblePlans = showMorePlans ? availablePlans : availablePlans.slice(0, 3);

  const handlePauseSubscription = (id: number) => {
    toast({
      title: "Assinatura pausada",
      description: "Sua assinatura foi pausada com sucesso. Você pode reativá-la a qualquer momento.",
    });
  };

  const handleCancelSubscription = (id: number) => {
    toast({
      title: "Assinatura cancelada", 
      description: "Sua assinatura foi cancelada. Você ainda receberá as entregas já programadas.",
      variant: "destructive"
    });
  };

  const handleSubscribe = (planId: number) => {
    const plan = availablePlans.find(p => p.id === planId);
    toast({
      title: "Nova assinatura criada!",
      description: `Você se inscreveu no plano ${plan?.name}. Primeira entrega em 3-5 dias úteis.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userType="customer" userName="Maria Santos" />
      
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-primary mb-2">Gerenciar Assinaturas</h2>
          <p className="text-muted-foreground">Gerencie suas assinaturas ativas e descubra novos planos</p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Active Subscriptions */}
          <TabsContent value="active" className="space-y-6">
            {activeSubscriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="coffee-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Coffee className="h-5 w-5" />
                          {subscription.name}
                        </CardTitle>
                        <Badge variant="default">Ativa</Badge>
                      </div>
                      <CardDescription>
                        {subscription.product} - {subscription.quantity}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso da assinatura</span>
                          <span>{subscription.totalDeliveries - subscription.deliveriesLeft}/{subscription.totalDeliveries}</span>
                        </div>
                        <Progress 
                          value={((subscription.totalDeliveries - subscription.deliveriesLeft) / subscription.totalDeliveries) * 100} 
                          className="h-2" 
                        />
                      </div>

                      {/* Subscription Details */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Valor:</span>
                          <div className="text-right">
                            <span className="font-bold text-lg text-primary">R$ {subscription.price.toFixed(2)}</span>
                            <p className="text-xs text-muted-foreground line-through">
                              R$ {subscription.originalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Frequência:</span>
                          <span className="text-sm">{subscription.frequency}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Próxima entrega:</span>
                          <span className="text-sm">{new Date(subscription.nextDelivery).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Fornecedor:</span>
                          <span className="text-sm">{subscription.supplier}</span>
                        </div>

                        <div className="bg-green-50 p-3 rounded text-sm text-green-700">
                          💰 Economia de {subscription.discount}% vs compra avulsa
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handlePauseSubscription(subscription.id)}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelSubscription(subscription.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="coffee-card">
                <CardContent className="pt-6 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma assinatura ativa</h3>
                  <p className="text-muted-foreground mb-4">
                    Você ainda não possui assinaturas ativas. Que tal começar agora?
                  </p>
                  <Button variant="coffee">
                    <Gift className="h-4 w-4 mr-2" />
                    Explorar Planos
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Benefits Card */}
            <Card className="coffee-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Benefícios da Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Coffee className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-1">Cafés Especiais</h4>
                    <p className="text-xs text-muted-foreground">Seleção cuidadosa dos melhores grãos</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-1">Entrega Regular</h4>
                    <p className="text-xs text-muted-foreground">Café fresco na frequência que você escolher</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-1">Economia</h4>
                    <p className="text-xs text-muted-foreground">Desconto exclusivo para assinantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Available Plans */}
          <TabsContent value="plans" className="space-y-6">
            <Card className="coffee-card">
              <CardHeader>
                <CardTitle>Planos de Assinatura Disponíveis</CardTitle>
                <CardDescription>Escolha o plano ideal para o seu consumo de café</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {visiblePlans.map((plan) => (
                    <div key={plan.id} className="p-4 border rounded-lg space-y-3 relative">
                      {plan.popular && (
                        <Badge className="absolute -top-2 left-4 bg-primary">Mais Popular</Badge>
                      )}
                      <h4 className="font-semibold">{plan.name}</h4>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="space-y-1">
                        <p className="text-sm">Entrega {plan.frequency.toLowerCase()}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-primary">R$ {plan.price.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground line-through">
                            R$ {plan.originalPrice.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-green-600">Economia de {plan.discount}%</p>
                      </div>
                      <Button 
                        variant={plan.popular ? "coffee" : "outline"} 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        Assinar Agora
                      </Button>
                    </div>
                  ))}
                </div>
                
                {availablePlans.length > 3 && (
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowMorePlans(!showMorePlans)}
                    >
                      {showMorePlans ? 'Mostrar Menos' : 'Mostrar Mais Planos'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comparison Table */}
            <Card className="coffee-card">
              <CardHeader>
                <CardTitle>Comparação de Planos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Plano</th>
                        <th className="text-left p-2">Frequência</th>
                        <th className="text-left p-2">Quantidade/Mês</th>
                        <th className="text-left p-2">Preço/Entrega</th>
                        <th className="text-left p-2">Economia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availablePlans.map((plan) => (
                        <tr key={plan.id} className="border-b">
                          <td className="p-2 font-medium">{plan.name}</td>
                          <td className="p-2">{plan.frequency}</td>
                          <td className="p-2">
                            {plan.frequency === 'Mensal' ? '250g' : 
                             plan.frequency === 'Quinzenal' ? '500g' : 
                             plan.frequency === 'Semanal' ? '1kg' :
                             plan.frequency === 'Bi-semanal' ? '2kg' : '8kg'}
                          </td>
                          <td className="p-2">R$ {plan.price.toFixed(2)}</td>
                          <td className="p-2 text-green-600">{plan.discount}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-6">
            <Card className="coffee-card">
              <CardHeader>
                <CardTitle>Histórico de Assinaturas</CardTitle>
                <CardDescription>Todas as suas assinaturas anteriores e canceladas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      name: "Blend Tradicional", 
                      period: "Jun 2024 - Nov 2024", 
                      status: "Concluída", 
                      deliveries: "24/24",
                      reason: "Concluída com sucesso"
                    },
                    { 
                      name: "Café Orgânico", 
                      period: "Mar 2024 - Maio 2024", 
                      status: "Cancelada", 
                      deliveries: "6/12",
                      reason: "Cancelada pelo cliente"
                    }
                  ].map((history, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{history.name}</p>
                        <p className="text-sm text-muted-foreground">{history.period}</p>
                        <p className="text-xs text-muted-foreground">{history.reason}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant={history.status === "Concluída" ? "default" : "secondary"}>
                          {history.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{history.deliveries} entregas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}