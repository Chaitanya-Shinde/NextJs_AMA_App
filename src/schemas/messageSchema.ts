import {z} from "zod"

export const messageSchema = z.object({
    content: z.string()
    .min(10, 'Message must be of minimum 10 characters')
    .max(300, 'Message must be of maximum 300 characters')

})