import React from 'react'
import Cards from './Cards'

const Hero = () => {

  return (
    <div className='flex w-full h-fit justify-center items-center space-x-12'>
        <Cards content = "Notes"/>
        <Cards content = "Summary"/>
        <Cards content = "Main topics"/>
    </div>
  )
}

export default Hero