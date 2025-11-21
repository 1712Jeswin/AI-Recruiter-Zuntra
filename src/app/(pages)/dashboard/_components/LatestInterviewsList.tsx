"use client"


import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const LatestInterviewsList = () => {
  const router = useRouter()
    const [interviewList, setInterviewList] = useState([])
  return (
    <div className='my-5  '>
        <h2 className='font-medium text-xl mb-1'>Previously Created Interviews</h2>
        {interviewList?.length == 0 && <Card className='gap-2 p-5 flex flex-col justify-center items-center'>
            <Camera className='h-10 w-10 p-2 text-primary bg-blue-100 rounded-full' />
            <h2>You don't have any interviews created!</h2>
            <Button className='cursor-pointer' onClick={()=> router.push("dashboard/create-interview")}><Plus/>Create new Interview</Button>
        </Card>
        }
    </div>
  )
}

export default LatestInterviewsList;