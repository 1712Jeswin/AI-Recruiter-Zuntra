"use client"

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getInterviews } from '../actions/getInterviews'
import InterviewItemCard from './InterviewItemCard'
import { authClient } from '@/lib/auth-client'

const LatestInterviewsList = () => {
  const router = useRouter()
  
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch only when session is ready and user has an email
    if (session?.user?.email) {
      getInterviewList();
    } else if (!isSessionLoading && !session) {
        setLoading(false);
    }
  }, [session, isSessionLoading]);

  const getInterviewList = async () => {
    setLoading(true);
    const email = session?.user?.email;
    
    if (email) {
        const result = await getInterviews(email);
        setInterviewList(result);
    }
    setLoading(false);
  }

  return (
    <div className='my-7'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='font-medium text-xl'>Previously Created Interviews</h2>
        {interviewList?.length > 0 && (
             <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/create-interview")}>
                <Plus className="h-4 w-4 mr-2"/> Add New
             </Button>
        )}
      </div>

      {/* Loading State */}
      {loading || isSessionLoading ? (
        <div className='flex justify-center py-10'>
            <Loader2 className='animate-spin h-8 w-8 text-gray-500'/>
        </div>
      ) : (
        <>
          {/* EMPTY STATE */}
          {interviewList?.length == 0 ? (
            <Card className='gap-2 p-5 flex flex-col justify-center items-center h-[300px] border-dashed'>
              <Camera className='h-10 w-10 p-2 text-primary bg-blue-100 rounded-full' />
              <h2 className='font-medium text-lg'>You don't have any interviews created!</h2>
              <p className='text-gray-500 text-sm'>Create your first AI mock interview to get started.</p>
              <Button className='cursor-pointer mt-3' onClick={() => router.push("/dashboard/create-interview")}>
                <Plus className='mr-2' /> Create new Interview
              </Button>
            </Card>
          ) : (
            /* LIST STATE - Limited to 6 Items */
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3'>
              {interviewList.slice(0, 6).map((interview, index) => (
                <InterviewItemCard 
                    key={index} 
                    interview={interview} 
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default LatestInterviewsList;