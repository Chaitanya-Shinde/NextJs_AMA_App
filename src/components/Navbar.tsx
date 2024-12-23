'use client'
import Link from 'next/link'
import React from 'react'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth'
import { Button } from './ui/button'

const Navbar = () => {

    const {data: session} = useSession()
    const user : User = session?.user as User
    return (
        <nav className=' p-4 md:pd-6 shadow-md'>
            <div className=' container mx-auto flex flex-col md:flex-row justify-between items-center'>
                <a href="#" className=' text-xl font-bold mb-4 md:mb-0'>Secret message</a>
                {
                    session? (
                        <>
                            <span className=' mr-4'>Welcome, {user.username || user.email}</span>
                            <Button onClick={()=>signOut({callbackUrl: "/"})} className=' w-full md:w-auto'>Logout</Button>
                        </>
                    ) : (
                        <Link href={'/signIn'}>
                            <Button className=' w-full md:w-auto'>Log in</Button>
                        </Link>
                    )
                }
            </div>
        </nav>
    )
}

export default Navbar