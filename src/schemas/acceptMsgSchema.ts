import {z} from "zod"

export const acceptMsgSchema = z.object({
    acceptMessages: z.boolean(),

})