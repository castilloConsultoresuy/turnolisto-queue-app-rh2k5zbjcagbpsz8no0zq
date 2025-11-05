import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Users, UserCheck, Trash2, LoaderCircle, BellRing } from 'lucide-react';
import { useQueueStore } from '@/hooks/useQueueStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
export function AdminPage() {
  const queueState = useQueueStore(s => s.queueState);
  const fetchQueueState = useQueueStore(s => s.fetchQueueState);
  const callNextTicket = useQueueStore(s => s.callNextTicket);
  const resetQueue = useQueueStore(s => s.resetQueue);
  const isLoading = useQueueStore(s => s.isLoading);
  useEffect(() => {
    fetchQueueState();
    const interval = setInterval(fetchQueueState, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchQueueState]);
  const handleCallNext = async () => {
    await callNextTicket();
    toast.success("¡Se ha llamado al siguiente cliente!");
  };
  const handleResetQueue = async () => {
    await resetQueue();
    toast.info("La fila ha sido reiniciada.");
  };
  const waitingTickets = queueState?.tickets.filter(t => t.status === 'waiting') || [];
  const currentlyServing = queueState?.currentlyServing;
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-display font-bold text-foreground">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona la fila de clientes en tiempo real.</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BellRing /> Acciones</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button
                  onClick={handleCallNext}
                  disabled={isLoading || waitingTickets.length === 0}
                  className="w-full h-14 text-lg font-bold bg-playful-blue hover:bg-blue-700 text-white rounded-xl transition-transform duration-200 active:scale-95"
                >
                  {isLoading ? <LoaderCircle className="animate-spin" /> : 'Llamar Siguiente Cliente'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full h-12 rounded-xl"
                      disabled={isLoading}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Reiniciar Fila
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>��Estás completamente seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la fila actual y a todos los clientes en espera.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetQueue} className="bg-destructive hover:bg-destructive/90">
                        Sí, reiniciar fila
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCheck /> Atendiendo</CardTitle>
              </CardHeader>
              <CardContent className="text-center p-6">
                {currentlyServing ? (
                  <div>
                    <p className="font-display text-7xl font-bold text-playful-blue">{currentlyServing.number.toString().padStart(3, '0')}</p>
                    <p className="text-2xl font-medium text-foreground mt-2">{currentlyServing.name}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-lg p-8">No se está atendiendo a ningún cliente.</p>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Waiting List */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg rounded-2xl h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Lista de Espera</CardTitle>
                <CardDescription>
                  {waitingTickets.length} cliente(s) esperando en la fila.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                  {waitingTickets.length > 0 ? (
                    <ul className="space-y-3">
                      <AnimatePresence>
                        {waitingTickets.map((ticket, index) => (
                          <motion.li
                            key={ticket.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-between p-4 bg-background rounded-lg border"
                          >
                            <div className="flex items-center gap-4">
                              <span className="flex items-center justify-center h-10 w-10 rounded-full bg-playful-yellow text-gray-800 font-bold text-lg">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-semibold text-foreground">{ticket.name}</p>
                                <p className="text-sm text-muted-foreground">Turno #{ticket.number.toString().padStart(3, '0')}</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(ticket.createdAt).toLocaleTimeString()}
                            </p>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-10">
                      <Users className="h-16 w-16 mb-4" />
                      <h3 className="text-xl font-semibold">¡La fila está vacía!</h3>
                      <p>Esperando a que llegue el primer cliente.</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}