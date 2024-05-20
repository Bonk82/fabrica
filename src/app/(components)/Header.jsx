import React from 'react'
import { useSupa } from '../context/SupabaseContext';
import { Avatar } from '@mantine/core';

const Header = () => {
  const { usuario,avatar} = useSupa();
  console.log('usuario header',usuario);
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignContent:'center',width:'90%'}}>
      <h1>IceLand</h1>
      <div style={{display:'flex'}}>
        <em style={{fontSize:'large',fontWeight:'600',marginTop:'0.8rem'}}>{usuario?.email}</em>
        <Avatar src={avatar} alt="U" size='lg' />
      </div>
    </div>
  )
}

export default Header