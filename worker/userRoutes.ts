import { Hono } from "hono";
import { Env } from './core-utils';
import type { QueueState, ApiResponse, Ticket } from '@shared/types';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
const createTicketSchema = z.object({
  name: z.string().min(1, "El nombre no puede estar vacío.").max(50, "El nombre es demasiado largo."),
});
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/queue/state', async (c) => {
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.getQueueState();
        return c.json({ success: true, data } satisfies ApiResponse<QueueState>);
    });
    app.post('/api/queue/ticket', zValidator('json', createTicketSchema), async (c) => {
        const { name } = c.req.valid('json');
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.createTicket(name);
        return c.json({ success: true, data } satisfies ApiResponse<Ticket>);
    });
    app.post('/api/queue/next', async (c) => {
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.callNextTicket();
        return c.json({ success: true, data } satisfies ApiResponse<QueueState>);
    });
    app.post('/api/queue/reset', async (c) => {
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.resetQueue();
        return c.json({ success: true, data } satisfies ApiResponse<QueueState>);
    });
}