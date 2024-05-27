import React from 'react'
import { useSupa } from '../context/SupabaseContext';
import { ActionIcon, Avatar } from '@mantine/core';
import { IconDotsVertical } from '@tabler/icons-react';

const Header = () => {
  const { usuario,avatar,logout} = useSupa();
  console.log('usuario header',usuario);

  return (
    <div style={{display:'flex',justifyContent:'space-between',alignContent:'center',width:'90%'}}>
      <h1>Cristales</h1>
      <div style={{display:'flex',gap:'1rem',height :'60px',alignItems:'center'}}>
        <em style={{fontSize:'large',fontWeight:'600',marginTop:'0.8rem'}}>{usuario?.email}</em>
        <Avatar src={avatar} alt="U" size='lg' />
        <ActionIcon variant="light" onClick={logout}>
          <IconDotsVertical  stroke={1.8}/>
        </ActionIcon>
      </div>
    </div>
  )
}

export default Header