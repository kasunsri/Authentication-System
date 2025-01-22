import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'

const Home = () => {
  return (
    <div className='bg-blue-100'>
        <Navbar/>
        <Header/>
        <div className='justify-center bg-yellow-100 '>
            <p className='text-center justify-center text-red-600 '>Powered by &#169;Kasun_Sri_</p>
        </div>
    </div>
  )
}

export default Home