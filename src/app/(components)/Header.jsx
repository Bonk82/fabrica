import React from 'react'
import { useSupa } from '../context/SupabaseContext';
import { ActionIcon, Avatar, Box } from '@mantine/core';
import { IconDotsVertical } from '@tabler/icons-react';

const Header = () => {
  const { usuario,avatar,logout} = useSupa();
  // console.log('usuario header',usuario);

  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center', gap:'0.5rem'}}>
      <Box visibleFrom='md'>
        <em style={{fontSize:'large',fontWeight:'600',marginTop:'0.8rem'}}>{usuario?.nombre}</em>
      </Box>
      <Avatar src={avatar} alt={usuario?.nombre?.slice(0,1) || 'U' } size='lg' />
      <ActionIcon variant="light" onClick={logout}>
        <IconDotsVertical  stroke={1.6}/>
      </ActionIcon>
    </div>
  )
}

export default Header