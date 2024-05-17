'use client'

import { ActionIcon,AppShell, Burger, Group, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconRipple } from '@tabler/icons-react';
import { useState } from "react";
import Navbar from '../(components)/Navbar';
import { MantineLogo } from '@mantinex/mantine-logo';
import Header from '../(components)/Header';
import Aside from '../(components)/Aside';
import Footer from '../(components)/Footer';
// import { MantineLogo } from '@mantinex/mantine-logo';

export function Model({ children }) {
  const [opened, { toggle }] = useDisclosure();
  const [nav, setNav] = useState(true)

  const toggleNav = () =>{
    setNav(!nav);
  }

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      navbar={{ width: nav ? 300:60, breakpoint: 'sm', collapsed: {mobile: !opened } }}
      aside={{ width: 200, breakpoint: 'md', collapsed: { desktop: false, mobile: true } }}
      padding="md"
      transitionDuration={500}
      transitionTimingFunction="ease"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <MantineLogo size={30} />
          <Header/>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" style={{overflow:'hidden'}}>
        {(window.innerWidth >= 768) &&
          <div style={{display:'flex',justifyContent:'space-between'}}>{nav ? 'Menú' : ''}
            <ActionIcon onClick={toggleNav}><IconRipple/></ActionIcon>
          </div>
        }
        {/* {Array(15)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} h={28} mt="sm" animate={false} />
          ))} */}
        <Navbar/>
      </AppShell.Navbar>
      <AppShell.Main>
        {children}
      </AppShell.Main>
      <AppShell.Aside p="md"><Aside/></AppShell.Aside>
      <AppShell.Footer p="md"><Footer/></AppShell.Footer>
    </AppShell>
  );
}

export default Model