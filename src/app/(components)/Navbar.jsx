import { useRouter } from 'next/navigation';
import { useSupa } from '../context/SupabaseContext';
import { Button } from '@mantine/core';
import { IconUsersGroup,IconBuildingFactory2,IconBriefcase,IconUserCog,IconUserCheck,IconTimeline,IconBusinessplan,IconListCheck, IconTools, IconListNumbers } from '@tabler/icons-react';


const Navbar = () => {
  const { menu,usuario,setDesplegar} = useSupa();
  const menues = menu.filter(f=>f.rol==usuario?.rol).sort((a,b)=>a.orden-b.orden);
  // console.log('en navbar',menu,usuario);
  const router = useRouter()

  const navegar = (url) =>{
    setTimeout(() => {
      setDesplegar(false);
    }, 500);
    if(url) router.push(url);
  }

  const icons = [
    <IconBriefcase key={3} />,
    <IconUsersGroup key={1}/>,
    <IconBuildingFactory2 key={2}/>,
    <IconUserCheck key={5} />,
    <IconListCheck key={8} />,
    <IconTimeline key={6} />,
    <IconBusinessplan key={7} />,
    <IconUserCog key={4} />,
    <IconTools key={9} />,
    <IconListNumbers key={10} />,
  ]

  return (
    <div style={{textAlign:'left'}}>
      {menues.map((e,i)=>(
        <Button key={e.id_menu}
          leftSection={icons[e.orden -1]}
          onClick={()=>navegar(e.ruta)}
          fullWidth style={{marginBottom:'1rem'}}
          justify='flex-start'
          variant='light'
        >
          {e.descripcion}
        </Button>
      ))}
    </div>
  )
}

export default Navbar