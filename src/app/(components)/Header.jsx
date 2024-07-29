import React from 'react'
import { useSupa } from '../context/SupabaseContext';
import { ActionIcon, Avatar, Box } from '@mantine/core';
import { IconDotsVertical } from '@tabler/icons-react';

const Header = () => {
  const { usuario,avatar,logout} = useSupa();
  console.log('usuario header',usuario);

  return (
    <div style={{display:'flex',justifyContent:'space-between',alignContent:'center',alignItems:'center',width:'70%'}}>
      <Box component='h1' visibleFrom='md'>Cristales Ice®</Box>
      <Box component='h4' hiddenFrom='md'>Cristales Ice®</Box>
      <div style={{display:'flex',gap:'1rem',height :'60px',alignItems:'center'}}>
        <Box visibleFrom='md'>
          <em style={{fontSize:'large',fontWeight:'600',marginTop:'0.8rem'}}>{usuario?.nombre}</em>
        </Box>
        <Avatar src={avatar} alt={usuario?.nombre?.slice(0,1) || 'U' } size='lg' />
        <ActionIcon variant="light" onClick={logout}>
          <IconDotsVertical  stroke={1.8}/>
        </ActionIcon>
      </div>
    </div>
  )
}

export default Header