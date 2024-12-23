'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { verifyCodeSchema } from '@/schemas/verifyCodeSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import * as z  from 'zod';
import { Loader2 } from 'lucide-react';

const VerifyAccount = () => {
    const router = useRouter();
    const params = useParams<{username: string}>();
    const {toast} = useToast()
    const form = useForm<z.infer<typeof verifyCodeSchema>>({
        resolver: zodResolver(verifyCodeSchema)        
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (data: z.infer<typeof verifyCodeSchema>) =>{
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>(`/api/verifyCode`,{
                username: params.username,
                verifyCode: data.code
            })
            toast({
                title: 'Success',
                description: response.data.message
            })
            router.replace('/signIn')
            setIsSubmitting(false)
        } catch (error) {
            console.error("Error in verifying account", error);
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Account verification failed",
                description: axiosError.response?.data.message,
                variant: "destructive"    
            })
            setIsSubmitting(false)
        }
    }
    //TODO: Tell user if code has expired or not
    //TODO: Create a resend OTP functionality with a delay timer. Give 2 tries
    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-800'>
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                    Verify your account
                </h1>
                <p className="mb-4">Enter the verification code sent to your email</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Verification code</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your Verification code here" {...field} />
                            </FormControl>

                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                    {
                        isSubmitting ? (<>
                        <Loader2 className=" mr-2 h-4 w-4 animate-spin"/> Please wait
                        </>) : ('Sign Up')
                    }
                    </Button>
                </form>
            </Form>
            </div>
        </div>
    )
}

export default VerifyAccount