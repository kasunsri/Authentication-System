import React from 'react'
import { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContent } from '../context/AppContext'

const Header = () => {

  const {userData} = useContext(AppContent)


  return (
    <div className='flex flex-col items-center mt-20 text-center text-gray-800'>

        <img src={assets.header_img} alt="" className='w-36 h-36 rounded-full mb-6' />

        <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>Hey {userData ? userData.name : 'Bro..'}!
            <img className='w-8 aspect-square' src={assets.hand_wave} alt="" />
        </h1>

        <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Welcome to App Authentication System...</h2>

        <p className='mb-8 max-w-md'>Lets explore with a us and we will have you up and running in no time</p>

        {/*<button className='border border-gray-900 rounded-full px-8 py-2.5 hover:bg-blue-200'>Get Stared</button>*/}
    </div>
  )
}

export default Header