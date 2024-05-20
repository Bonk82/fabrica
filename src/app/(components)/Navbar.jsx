import { useRouter } from 'next/navigation';
import { useSupa } from '../context/SupabaseContext';
import { Button } from '@mantine/core';
import { IconUser,IconWorld,IconSignalE,IconBellHeart,IconChartBar } from '@tabler/icons-react';


const Navbar = () => {
  const { menu} = useSupa();
  const menues = menu;
  console.log('en navbar',menu);
  const router = useRouter()

  const navegar = (url) =>{
    if(url) router.push(url);
  }

  const icon = <IconUser/>

  return (
    <div>
      {menues.map((e,i)=>(
        <Button key={e.id_menu} leftSection={icon} onClick={()=>navegar(e.ruta)} fullWidth style={{marginBottom:'1rem'}}>{e.descripcion}</Button>
      ))}
    </div>
  )
}

export default Navbar