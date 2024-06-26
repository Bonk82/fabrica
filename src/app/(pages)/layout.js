'use client'

import 'dayjs/locale/es';
import { ActionIcon,AppShell, Burger, Group, Image } from '@mantine/core';
import { useDisclosure,useViewportSize } from '@mantine/hooks';
import { IconRipple } from '@tabler/icons-react';
import { useState } from "react";
import Navbar from '../(components)/Navbar';
import { MantineLogo } from '@mantinex/mantine-logo';
import Header from '../(components)/Header';
import Aside from '../(components)/Aside';
import Footer from '../(components)/Footer';
import { DatesProvider } from '@mantine/dates';

export function Model({ children }) {
  const [opened, { toggle }] = useDisclosure();
  const [nav, setNav] = useState(true)
  // const [width, setWidth] = useState((window || {}).innerWidth);
  const { width } = useViewportSize();

  const toggleNav = () =>{
    setNav(!nav);
  }

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 20 }}
      navbar={{ width: nav ? 300:70, breakpoint: 'sm', collapsed: {mobile: !opened }}}
      aside={{ width: 200, breakpoint: 'md', collapsed: { desktop: false, mobile: true } }}
      padding="md"
      transitionDuration={500}
      transitionTimingFunction="ease"
    >
      <AppShell.Header style={{backgroundColor:'#0c8599'}}>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          {/* <MantineLogo size={30} /> */}
          <Image radius="lg" src="/assets/icono3.jpg" h={50} w="auto" fit='contain' alt=''/>
          <Header/>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="sm" style={{overflow:'hidden',backgroundColor:'transparent'}}>
        {/* {(window?.innerWidth >= 768) && */}
        {(width >= 768) &&
          <div style={{display:'flex',justifyContent:'space-between', fontSize:'x-large',marginBottom:'2rem'}}>{nav ? 'Menú de opciones' : ''}
            <ActionIcon style={{width:'50px'}} onClick={toggleNav}><IconRipple/></ActionIcon>
          </div>
        }
        <Navbar/>
      </AppShell.Navbar>
      <AppShell.Main>
        <DatesProvider settings={{ locale: 'es' }}>
          {children}
        </DatesProvider>
      </AppShell.Main>
      <AppShell.Aside p="md" style={{overflow:'hidden',backgroundColor:'transparent'}}><Aside/></AppShell.Aside>
      {/* <AppShell.Footer style={{fontSize:'small',backgroundColor:'#0c8599', padding:'0 2rem'}}><Footer/></AppShell.Footer> */}
    </AppShell>
  );
}

export default Model