'use client'
import MessageCard from '@/components/MessageCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Message } from '@/model/User'
import { acceptMsgSchema } from '@/schemas/acceptMsgSchema'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { Loader2, RefreshCcw } from 'lucide-react'
import { useSession } from 'next-auth/react'
import React, { Key, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

const Dashboard = () => {

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)
  const [profileUrl, setProfileUrl] = useState(''); 
  const { toast } = useToast()

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message)=>message._id !== messageId))
  }

  const {data:session} = useSession()
  const form = useForm({
    resolver: zodResolver(acceptMsgSchema)
  })

  const {register, watch, setValue} = form
  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessages = useCallback(async ()=>{
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>(`/api/acceptMessages`)
      
      setValue("acceptMessages", response.data.isAcceptingMessages)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to fetch message settings",
        variant: "destructive"
      })
    }finally{
      setIsSwitchLoading(false)
    }
  },[setValue])

  const fetchAllMessages = useCallback(async (refresh: boolean = false)=>{
    setIsLoading(true)
    setIsSwitchLoading(false)
    try {
      const response = await axios.get<ApiResponse>(`/api/getMessages`)
      //console.log("response", response.data);
      
      setMessages(response.data?.messages || [])
      if(refresh){
        toast({
          title: "Refreshed messages",
          description: "Showing latest messages"
        })
      } 
        
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to fetch message settings",
        variant: "destructive"
      })
    }finally{
      setIsLoading(false)
      setIsSwitchLoading(false)
    }

  },[setIsLoading, setMessages])

  useEffect(() => {

    if(!session || !session.user){
      return
    }
    fetchAllMessages()
    fetchAcceptMessages()
    //console.log("refreshed");
    
    if (typeof window !== 'undefined') {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const username = session?.user?.username || '';
      setProfileUrl(`${baseUrl}/u/${username}`);
    }
    
  }, [session, setValue, fetchAcceptMessages, fetchAllMessages])

  const handleSwitchChange = async()=>{
    try {
      const response = await axios.post<ApiResponse>(`/api/acceptMessages`, {acceptMessages: !acceptMessages})
      setValue('acceptMessages', !acceptMessages)
      toast({
        title: response.data.message,
        variant: "default"

      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Error in changing setting",
        description: axiosError.response?.data.message || "Failed to update setting",
        variant: "destructive"

      })
    }
  }

  //const {username} = session?.user as User
  
  // const username = session?.user?.username || "";
  // const baseUrl = `${window.location.protocol}//${window.location.host}`
  // const profileUrl = `${baseUrl}/u/${username}`
  
  const copyToClipboard = ()=>{
    navigator.clipboard.writeText(profileUrl)
    toast({
      title: "Link copied",
      description: "Profile URL has been copied to clipboard"
    })
  }

  if(!session || !session.user){
    return <div>Please log in again to proceed</div>
  }




  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchAllMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 ">
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageCard
                key={message._id as Key}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <p>No messages to display.</p>
          )}
        </div>

    </div>
  )
}

export default Dashboard