'use client'
import React,{use} from 'react'

const page = ({ params }) => {
      const resolvedParams = use(params);
      console.log(resolvedParams);
  return (
    <div className="pt-50">the new court will be added to the facility : {resolvedParams.id}</div>
  )
}

export default page